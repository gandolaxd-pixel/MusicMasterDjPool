import express from 'express';
import cors from 'cors';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- SUPABASE CLIENT ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use Service Role Key for backend operations if available, otherwise Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ CRITICAL: Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- SECURITY HEADERS (Helmet) - PRODUCTION HARDENED ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Vite needs inline scripts
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            mediaSrc: ["'self'", "blob:", "https:"],
            connectSrc: ["'self'", process.env.VITE_SUPABASE_URL, "https://*.supabase.co"].filter(Boolean),
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }
}));

// --- CORS CONFIGURATION ---
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
        return callback(new Error('CORS not allowed'), false);
    },
    credentials: true
}));

// --- RATE LIMITING (PRODUCTION HARDENED) ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Too many requests. Please wait 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const streamLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: { error: 'Streaming rate limit exceeded. Wait 1 minute.' },
    standardHeaders: true,
    legacyHeaders: false
});

const downloadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Max 100 downloads per hour
    message: { error: 'Download limit reached. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/search', apiLimiter);

app.use(express.static('public'));

// --- SECURE CREDENTIALS ---
const STORAGE_CONFIG = {
    user: process.env.HETZNER_USER,
    pass: process.env.HETZNER_PASS,
    host: process.env.HETZNER_HOST
};

if (!STORAGE_CONFIG.user || !STORAGE_CONFIG.pass || !STORAGE_CONFIG.host) {
    console.error("❌ CRITICAL: Missing HETZNER credentials!");
    process.exit(1);
}

// --- AUTH MIDDLEWARE ---
const requireAuth = async (req, res, next) => {
    // Accept token via Header (API calls) or Query Param (Audio tags/Download links)
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw error;

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};

// --- PATH SECURITY VALIDATION ---
const isPathSafe = (filePath) => {
    if (!filePath) return false;
    const normalized = path.normalize(filePath);
    if (normalized.includes('..')) return false;
    const blockedPatterns = ['/etc/', '/root/', '/home/', '/usr/', '/var/', '/tmp/', '/proc/', '/sys/'];
    for (const pattern of blockedPatterns) {
        if (normalized.toLowerCase().includes(pattern)) return false;
    }
    const allowedExtensions = ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.wma', '.aiff', '.mp4', '.zip', '.rar'];
    const ext = path.extname(normalized).toLowerCase();
    return allowedExtensions.includes(ext);
};

// --- API 1: SEARCH (SUPABASE) ---
app.get('/api/search', async (req, res) => {
    const query = req.query.q ? String(req.query.q).trim() : '';

    if (query.length < 2) return res.json([]);

    try {
        // Perform Full Text Search or ILIKE
        const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .ilike('title', `%${query}%`)
            .limit(100);

        if (error) throw error;

        // Map to expected format if needed, but schema matches mostly
        // Changing 'file_path' to what frontend expects if needed, or frontend adapts
        // Legacy 'name' vs 'title'
        const results = data.map(t => ({
            ...t,
            name: t.title, // Frontend expects 'name'
            full_path: t.file_path // Frontend expects 'full_path' or 'file_path'
        }));

        res.json(results);

    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

// --- API 2: SECURE STREAMING (PROTECTED) ---
// Apply different rate limits based on action (stream vs download)
app.get('/api/stream', requireAuth, async (req, res, next) => {
    // Apply downloadLimiter only for downloads
    if (req.query.download === 'true') {
        return downloadLimiter(req, res, next);
    }
    return streamLimiter(req, res, next);
}, async (req, res) => {
    const trackPath = req.query.path;

    if (!trackPath || !isPathSafe(trackPath)) {
        return res.status(403).json({ error: 'Invalid path' });
    }

    let encodedPath = trackPath.split('/').map(encodeURIComponent).join('/');
    if (!encodedPath.startsWith('/')) encodedPath = '/' + encodedPath;

    const secureUrl = `https://${STORAGE_CONFIG.user}:${STORAGE_CONFIG.pass}@${STORAGE_CONFIG.host}${encodedPath}`;

    try {
        const headers = {};
        if (req.headers.range) headers['Range'] = req.headers.range;

        const response = await axios({
            method: 'get',
            url: secureUrl,
            responseType: 'stream',
            headers: headers,
            timeout: 30000,
            validateStatus: (status) => status >= 200 && status < 300
        });

        res.status(response.status);
        if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
        if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
        if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
        res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');

        if (req.query.download === 'true') {
            const filename = path.basename(trackPath);
            const safeFilename = filename.replace(/[^\w\s.-]/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

            // Log download to Supabase (async, non-blocking)
            supabase.from('downloads').insert({
                user_id: req.user?.id,
                track_path: trackPath,
                downloaded_at: new Date().toISOString()
            }).then(() => { }).catch(() => { }); // Silent logging
        }

        response.data.pipe(res);

    } catch (error) {
        console.error("❌ Stream error:", trackPath, error.message);
        res.status(404).json({ error: 'File not accessible' });
    }
});

// --- HEALTH CHECK ---
app.get('/health', async (req, res) => {
    const { error } = await supabase.from('tracks').select('count', { count: 'exact', head: true });
    res.json({ status: error ? 'db_error' : 'ok' });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 SERVER UPGRADED & ONLINE ON PORT ${PORT}`);
    console.log(`🔒 Connected to Supabase`);
});