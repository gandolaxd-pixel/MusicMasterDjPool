
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function skipScanFolders() {
    console.log("🚀 Testing Optimized Skip Scan for DECEMBER...");

    // Path to search
    const searchPrefix = '/BEATPORT2025/MONTHS/DECEMBER/';
    const prefixDepth = searchPrefix.split('/').filter(Boolean).length; // 3

    let folders = [];
    let currentMarker = searchPrefix; // Start searching from the prefix itself

    let hasMore = true;
    let iterations = 0;

    console.time("SkipScan");

    while (hasMore) {
        iterations++;
        // Fetch just ONE item that is greater than the current expected end of previous folder
        const { data, error } = await supabase
            .from('dj_tracks')
            .select('server_path')
            .eq('pool_id', 'BEATPORT')
            .ilike('server_path', `${searchPrefix}%`)
            .gt('server_path', currentMarker)
            .order('server_path', { ascending: true })
            .limit(1);

        if (error || !data || data.length === 0) {
            hasMore = false;
        } else {
            const serverPath = data[0].server_path;
            const parts = serverPath.split('/').filter(Boolean);

            if (parts.length > prefixDepth) {
                const folderName = parts[prefixDepth]; // e.g. "01"
                folders.push(folderName);
                console.log(`Found: ${folderName}`);

                console.log(`Debug: Last Path: ${serverPath}`);
                console.log(`Debug: Marker:    ${currentMarker}`);
                // Construct the marker to skip THIS entire folder
                // Use unicode max char to skip
                currentMarker = `${searchPrefix}${folderName}/\uffff`;
            } else {
                console.log(`Debug: Invalid Depth. Path: ${serverPath}`);
                hasMore = false;
            }
        }

        // Safety break
        if (iterations > 20) break;
    }

    console.timeEnd("SkipScan");
    console.log(`✅ Total Folders Found: ${folders.length}`);
    console.log(folders.join(', '));
}

skipScanFolders();
