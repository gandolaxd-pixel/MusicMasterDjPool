
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'https://musicmasterpool.com',
    'https://www.musicmasterpool.com',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

function getCorsOrigin(origin: string | undefined): string {
    if (!origin) return ALLOWED_ORIGINS[0] || '';
    if (ALLOWED_ORIGINS.includes(origin)) return origin;
    // Allow localhost in development
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return origin;
    }
    return ALLOWED_ORIGINS[0] || '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin;
    const corsOrigin = getCorsOrigin(origin);

    // Enable CORS with restricted origins
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // TODO: Implement search logic connected to Supabase or Cloud DB
    // The local JSON file cannot be reliably used here if it's too large for the repo

    // Returning empty array for now to prevent errors
    res.status(200).json([]);
}
