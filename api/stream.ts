
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { basename, join } from 'path';
import * as fs from 'fs';
import NodeID3 from 'node-id3';

// Load credentials from Environment Variables
const STORAGE_CONFIG = {
    user: process.env.STORAGE_USER,
    pass: process.env.STORAGE_PASS,
    host: process.env.STORAGE_HOST || "u529624-sub1.your-storagebox.de"
};

// Cache branding buffer to avoid reading FS on every request
let BRAND_COVER_BUFFER: Buffer | null = null;

try {
    // Attempt to load cover from local public immediately
    // Note: In Vercel serverless, public files might be in process.cwd()/public depending on config
    // Fallback: Check standard locations
    const possiblePaths = [
        join(process.cwd(), 'public', 'images', 'brand_cover.png'),
        join(process.cwd(), 'images', 'brand_cover.png'),
        '/var/task/public/images/brand_cover.png'
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            BRAND_COVER_BUFFER = fs.readFileSync(p);
            console.log(`✅ Default Cover Art loaded from: ${p}`);
            break;
        }
    }
} catch (err) {
    console.error("⚠️ Could not load default cover art on startup:", err);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Range');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!STORAGE_CONFIG.user || !STORAGE_CONFIG.pass) {
        return res.status(500).json({ error: "Server Configuration Error: Missing Storage Credentials" });
    }

    const { path: trackPath, download } = req.query;

    if (!trackPath || typeof trackPath !== 'string') {
        return res.status(400).send("Missing path parameter");
    }

    if (trackPath.includes('..') || trackPath.includes('\0')) {
        return res.status(403).send("Forbidden: Invalid path");
    }

    let cleanPath = trackPath.startsWith('/') ? trackPath : '/' + trackPath;
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const secureUrl = `https://${STORAGE_CONFIG.user}:${STORAGE_CONFIG.pass}@${STORAGE_CONFIG.host}${encodedPath}`;

    try {
        const headers: Record<string, string> = {};
        if (req.headers.range) {
            headers['Range'] = req.headers.range as string;
        }

        const response = await axios({
            method: 'get',
            url: secureUrl,
            responseType: 'stream',
            headers: headers,
            validateStatus: (status) => status >= 200 && status < 300
        });

        const filename = basename(cleanPath);
        const isMp3 = filename.toLowerCase().endsWith('.mp3');
        const isDownload = download === 'true';

        // 🚀 SMART INJECTION LOGIC
        // Only inject for MP3 downloads IF we have the cover art ready
        if (isDownload && isMp3 && BRAND_COVER_BUFFER) {

            // 1. Create ID3 Tags
            const tags: NodeID3.Tags = {
                title: filename.replace(/\.[^/.]+$/, ""), // Remove extension
                artist: "MUSIC MASTER DJ POOL",
                album: "VIP MEMBER EXCLUSIVE",
                year: new Date().getFullYear().toString(),
                image: {
                    mime: "image/png",
                    type: {
                        id: 3,
                        name: "front cover"
                    },
                    description: "Cover",
                    imageBuffer: BRAND_COVER_BUFFER
                },
                userDefinedText: [{
                    description: "WWW",
                    value: "musicmasterpool.com"
                }]
            };

            // 2. Generate Tag Buffer (Synchronous, fast)
            const tagBuffer = NodeID3.create(tags);

            // 3. Calc new size
            const originalSize = parseInt(response.headers['content-length'] || '0');
            if (originalSize > 0) {
                res.setHeader('Content-Length', originalSize + tagBuffer.length);
            }

            // 4. Set Download Headers
            const encodedFilename = encodeURIComponent(filename);
            res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`);
            res.setHeader('Content-Type', 'audio/mpeg');

            // 5. STREAM SPLICING: Write Tags -> Pipe Content
            res.write(tagBuffer, () => {
                response.data.pipe(res);
            });

        } else {
            // STANDARD PASS-THROUGH (WAVs, Packs, or Streaming)
            res.status(response.status);

            if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
            if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
            if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
            res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

            if (isDownload) {
                const encodedFilename = encodeURIComponent(filename);
                res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`);
            }

            response.data.pipe(res);
        }

    } catch (error: any) {
        console.error(`❌ Stream Error: ${error.message}`);
        res.status(404).send("Audio not found.");
    }
}
