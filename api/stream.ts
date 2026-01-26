
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { basename } from 'path';

// Load credentials from Environment Variables
const STORAGE_CONFIG = {
    user: process.env.STORAGE_USER,
    pass: process.env.STORAGE_PASS,
    host: process.env.STORAGE_HOST || "u529624-sub1.your-storagebox.de"
};

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

    // Validate Configuration
    if (!STORAGE_CONFIG.user || !STORAGE_CONFIG.pass) {
        console.error("❌ CRITICAL: Missing Storage Credentials in Environment Variables (STORAGE_USER, STORAGE_PASS)");
        return res.status(500).json({ error: "Server Configuration Error: Missing Storage Credentials" });
    }

    const { path: trackPath, download } = req.query;

    if (!trackPath || typeof trackPath !== 'string') {
        return res.status(400).send("Missing path parameter");
    }

    // 🛡️ SECURITY: Explicitly block path traversal attempts
    if (trackPath.includes('..') || trackPath.includes('\0')) {
        console.error(`❌ Security Alert: Path traversal attempt blocked: ${trackPath}`);
        return res.status(403).send("Forbidden: Invalid path");
    }

    // Ensure path has leading slash
    let cleanPath = trackPath.startsWith('/') ? trackPath : '/' + trackPath;

    // Encode path components for the URL (preserving slashes)
    // Example: /Musica/Techno/My Song.mp3 -> /Musica/Techno/My%20Song.mp3
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');

    // Construct authenticated URL
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

        // Forward important headers for streaming/seeking
        res.status(response.status); // 200 or 206

        if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
        if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
        if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);

        const contentType = response.headers['content-type'] || 'audio/mpeg';
        res.setHeader('Content-Type', contentType);

        // Handle Download properly
        if (download === 'true') {
            const filename = basename(cleanPath);
            // Robust filename handling
            const encodedFilename = encodeURIComponent(filename);
            res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`);
        }

        // Pipe data to response
        response.data.pipe(res);

    } catch (error: any) {
        console.error(`❌ Audio Stream Error for path: ${cleanPath}`);
        if (error.response) {
            console.error(`Storage Response: ${error.response.status} ${error.response.statusText}`);
        } else {
            console.error(`Error details: ${error.message}`);
        }
        res.status(404).send("Audio not found or inaccessible.");
    }
}
