
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkFolders() {
    console.log("🔍 Simulating Frontend Fetch for DECEMBER...");

    // Path simulation
    const searchPrefix = '/BEATPORT2025/MONTHS/DECEMBER/';

    // Fetch with limit 5000 (same as frontend)
    const { data } = await supabase
        .from('dj_tracks')
        .select('server_path')
        .eq('pool_id', 'BEATPORT')
        .ilike('server_path', `${searchPrefix}%`)
        .limit(50000);

    if (data) {
        // Extract unique subfolders (days)
        const folderSet = new Set();
        const prefixDepth = searchPrefix.split('/').filter(Boolean).length; // should be 3 (BEATPORT2025, MONTHS, DECEMBER)

        data.forEach(item => {
            if (!item.server_path) return;
            const parts = item.server_path.split('/').filter(Boolean);
            if (parts.length > prefixDepth) {
                folderSet.add(parts[prefixDepth]);
            }
        });

        const folders = Array.from(folderSet).sort();
        console.log(`✅ Returned ${data.length} rows.`);
        console.log(`✅ Found ${folders.length} subfolders:`);
        console.log(folders.join(', '));
    } else {
        console.log("❌ No data returned");
    }
}

checkFolders();
