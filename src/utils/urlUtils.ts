import { API_URL } from '../config';
import { Track } from '../types';

/**
 * Generates the URL for a track's audio stream or download.
 * Priority:
 * 1. If track has an absolute URL (http/https), use it.
 * 2. If VITE_STORAGE_URL is set (Cloudflare/VPS), append path to it.
 * 3. Fallback to API_URL/stream proxy.
 */
// Note: We need the Supabase session token for secure streaming.
// Since this function is sync, the token should be passed in or retrieved from a synchronous store if available.
// For now, let's allow passing an optional token.

export function getTrackUrl(track: Track, asDownload: boolean = false, token?: string): string {
    // 1. Check for absolute URL
    if (track.streamUrl && track.streamUrl.startsWith('http')) {
        let url = track.streamUrl;
        if (asDownload) {
            const separator = url.includes('?') ? '&' : '?';
            url = url.includes('download=true') ? url : `${url}${separator}download=true`;
        }

        if (token) {
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}token=${encodeURIComponent(token)}`;
        }

        return url;
    }

    const rawPath = track.file_path || track.server_path || track.filename;

    if (!rawPath) return '';

    // If path is already absolute URL
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
        return rawPath;
    }

    // Decode first if already encoded (to avoid double encoding)
    // Then encode once for URL safety
    let path = rawPath;
    try {
        // Check if path contains encoded characters
        if (rawPath.includes('%')) {
            path = decodeURIComponent(rawPath);
        }
    } catch (e) {
        // If decode fails, use original
        path = rawPath;
    }

    // 2. Build Query Params
    let query = `path=${encodeURIComponent(path)}`;
    if (asDownload) query += '&download=true';
    if (token) query += `&token=${encodeURIComponent(token)}`;

    // 3. Construct URL
    // Always go through /api/stream to ensure Auth validation happens on Backend (unless we expose Direct Storage with signed URLs in future)
    // We removed 'Direct Storage' bypass because we want "Mega Security" checking the user session every time.

    if (API_URL && API_URL.startsWith('http')) {
        return `${API_URL}/api/stream?${query}`;
    }

    return `/api/stream?${query}`;
}
