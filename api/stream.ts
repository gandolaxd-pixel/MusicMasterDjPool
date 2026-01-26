
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

    if (!STORAGE_CONFIG.user || !STORAGE_CONFIG.pass) {
        console.error("❌ Missing Storage Credentials in Environment Variables");
        return res.status(500).json({ error: "Server Configuration Error: Missing Storage Credentials" });
    }

    const { path: trackPath, download } = req.query;

    if (!trackPath || typeof trackPath !== 'string') {
        return res.status(400).send("Missing path parameter");
    }

    // Ensure path has leading slash
    let cleanPath = trackPath;
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }

    // Encode path components
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
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

        // Forward important headers
        res.status(response.status);
        if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
        if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
        if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);

        const contentType = response.headers['content-type'] || 'audio/mpeg';
        res.setHeader('Content-Type', contentType);

        // Handle Download
        if (download === 'true') {
            const filename = basename(cleanPath);
            // Use encodeURIComponent for filename to handle special chars safe in header
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        }

        // Pipe data to response
        response.data.pipe(res);

    } catch (error: any) {
        console.error("❌ Audio Stream Error:", cleanPath, error.message);
        if (error.response) {
            console.error("Storage Status:", error.response.status);
        }
        res.status(404).send("Audio not found or inaccessible.");
    }
}
