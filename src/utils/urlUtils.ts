import { API_URL, STORAGE_URL } from '../config';
import { Track } from '../types';

/**
 * Generates the URL for a track's audio stream or download.
 * Priority:
 * 1. If track has an absolute URL (http/https), use it.
 * 2. If VITE_STORAGE_URL is set (Cloudflare/VPS), append path to it.
 * 3. Fallback to API_URL/stream proxy.
 */
export function getTrackUrl(track: Track, asDownload: boolean = false): string {
    // 1. Check for absolute URL
    if (track.streamUrl && track.streamUrl.startsWith('http')) {
        if (asDownload) {
            const separator = track.streamUrl.includes('?') ? '&' : '?';
            return track.streamUrl.includes('download=true')
                ? track.streamUrl
                : `${track.streamUrl}${separator}download=true`;
        }
        return track.streamUrl;
    }

    const path = track.file_path || track.server_path || track.filename;

    if (!path) return '';

    // If path is already absolute URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // 2. Use Direct Storage (Cloudflare Tunnel) if configured
    if (STORAGE_URL) {
        // Remove leading slash if present to avoid double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        // Ensure STORAGE_URL doesn't end with slash
        const cleanStorageUrl = STORAGE_URL.endsWith('/') ? STORAGE_URL.slice(0, -1) : STORAGE_URL;

        // Encode path components to handle spaces/special chars safely
        // We split by '/' to encode each segment, preserving directory structure
        const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');

        return `${cleanStorageUrl}/${encodedPath}${asDownload ? '?download=true' : ''}`;
    }

    // 3. Fallback to API Proxy
    const query = `path=${encodeURIComponent(path)}${asDownload ? '&download=true' : ''}`;
    return `${API_URL}/api/stream?${query}`;
}
