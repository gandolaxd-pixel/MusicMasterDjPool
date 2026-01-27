import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- SECURITY HEADERS (Helmet) ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Disable for audio streaming
}));

// --- CORS CONFIGURATION (Only allow specific origins) ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        return callback(new Error('CORS not allowed'), false);
    },
    credentials: true
}));

// --- RATE LIMITING ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

const streamLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 streams per minute per IP
    message: { error: 'Too many stream requests.' }
});

app.use('/api/search', apiLimiter);
app.use('/api/stream', streamLimiter);
app.use(express.static('public'));

// --- SECURE CREDENTIALS (Environment Variables REQUIRED) ---
const STORAGE_CONFIG = {
    user: process.env.HETZNER_USER,
    pass: process.env.HETZNER_PASS,
    host: process.env.HETZNER_HOST
};

// Validate required environment variables
if (!STORAGE_CONFIG.user || !STORAGE_CONFIG.pass || !STORAGE_CONFIG.host) {
    console.error("❌ CRITICAL: Missing HETZNER credentials in environment variables!");
    console.error("   Required: HETZNER_USER, HETZNER_PASS, HETZNER_HOST");
    process.exit(1);
}

// --- DATABASE LOADING ---
console.log("⏳ Loading music database...");
const dbPath = path.join(__dirname, 'tracks_master.json');
let db = [];

try {
    const rawData = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(rawData);
    console.log(`✅ SUCCESS! ${db.length} files loaded.`);
} catch (error) {
    console.warn("⚠️ WARNING: tracks_master.json not found - search disabled");
}

// --- PATH SECURITY VALIDATION ---
const isPathSafe = (filePath) => {
    // Block path traversal attacks
    if (!filePath) return false;
    const normalized = path.normalize(filePath);

    // Block directory traversal attempts
    if (normalized.includes('..')) return false;

    // Block access to system directories
    const blockedPatterns = ['/etc/', '/root/', '/home/', '/usr/', '/var/', '/tmp/', '/proc/', '/sys/'];
    for (const pattern of blockedPatterns) {
        if (normalized.toLowerCase().includes(pattern)) return false;
    }

    // Only allow audio/video file extensions
    const allowedExtensions = ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.wma', '.aiff', '.mp4', '.zip'];
    const ext = path.extname(normalized).toLowerCase();
    if (!allowedExtensions.includes(ext)) return false;

    return true;
};

// --- API 1: SEARCH ---
app.get('/api/search', (req, res) => {
    const query = req.query.q ? String(req.query.q).toLowerCase().slice(0, 100) : ''; // Limit query length
    if (query.length < 2) return res.json([]);

    const results = db.filter(item =>
        item.name && item.name.toLowerCase().includes(query)
    ).slice(0, 100);

    res.json(results);
});

// --- API 2: SECURE STREAMING ---
app.get('/api/stream', async (req, res) => {
    const trackPath = req.query.path;

    // Security validation
    if (!trackPath) {
        return res.status(400).json({ error: 'Missing path parameter' });
    }

    if (!isPathSafe(trackPath)) {
        console.warn(`⚠️ BLOCKED: Suspicious path request: ${trackPath}`);
        return res.status(403).json({ error: 'Invalid path' });
    }

    let encodedPath = trackPath.split('/').map(encodeURIComponent).join('/');
    if (!encodedPath.startsWith('/')) {
        encodedPath = '/' + encodedPath;
    }

    const secureUrl = `https://${STORAGE_CONFIG.user}:${STORAGE_CONFIG.pass}@${STORAGE_CONFIG.host}${encodedPath}`;

    try {
        const headers = {};
        if (req.headers.range) {
            headers['Range'] = req.headers.range;
        }

        const response = await axios({
            method: 'get',
            url: secureUrl,
            responseType: 'stream',
            headers: headers,
            timeout: 30000, // 30 second timeout
            validateStatus: (status) => status >= 200 && status < 300
        });

        res.status(response.status);
        if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
        if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
        if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
        res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');

        if (req.query.download === 'true') {
            const filename = path.basename(trackPath);
            // Sanitize filename for Content-Disposition header
            const safeFilename = filename.replace(/[^\w\s.-]/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        }

        response.data.pipe(res);

    } catch (error) {
        console.error("❌ Stream error:", trackPath, error.message);
        res.status(404).json({ error: 'File not accessible' });
    }
});

// --- HEALTH CHECK (for monitoring) ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok', tracks: db.length });
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 SECURE SERVER ONLINE ON PORT ${PORT}`);
    console.log(`🔒 Security features: Helmet, CORS, Rate Limiting, Path Validation`);
});