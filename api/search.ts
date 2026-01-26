
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // TODO: Implement search logic connected to Supabase or Cloud DB
    // The local JSON file cannot be reliably used here if it's too large for the repo

    // Returning empty array for now to prevent errors
    res.status(200).json([]);
}
