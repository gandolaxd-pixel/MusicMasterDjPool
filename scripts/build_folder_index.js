
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

// Admin client required for writes/inserts
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function buildIndex() {
    console.log("🚀 Starting Folder Indexer Service (10TB Scale)...");

    // 1. Get all unique parents from tracks (expensive but necessary once)
    // Actually, reading 35k rows is cheap for a script.
    // For 10TB (millions of rows), we should iterate.
    // But for now we have 64k tracks. We can fetch ALL paths.

    console.log("📥 Fetching all track paths...");

    let allPaths = [];
    let hasMore = true;
    let from = 0;
    const BATCH = 1000;

    while (hasMore) {
        const { data, error } = await supabase
            .from('dj_tracks')
            .select('server_path')
            .range(from, from + BATCH - 1);

        if (error || !data || data.length === 0) {
            hasMore = false;
        } else {
            console.log(`   Fetched ${data.length} tracks...`);
            allPaths.push(...data.map(d => d.server_path));
            from += BATCH;
            if (data.length < BATCH) hasMore = false;
        }
    }

    console.log(`✅ Total Tracks Scanned: ${allPaths.length}`);
    console.log("🔄 Building Folder Tree in Memory...");

    const folderSet = new Set();
    const folderStats = {}; // path -> count

    allPaths.forEach(path => {
        if (!path) return;
        // path: /BEATPORT2025/MONTHS/DECEMBER/01/Track.mp3

        // Remove filename to get parent folder
        const parts = path.split('/').filter(Boolean);
        parts.pop(); // remove filename

        // current: /BEATPORT2025/MONTHS/DECEMBER/01

        // We need to register this folder AND all its parents
        // 1. /BEATPORT2025/MONTHS/DECEMBER/01
        // 2. /BEATPORT2025/MONTHS/DECEMBER
        // 3. /BEATPORT2025/MONTHS
        // 4. /BEATPORT2025

        let currentBuildPath = '';
        parts.forEach((part) => {
            const parent = currentBuildPath ? '/' + currentBuildPath : ''; // e.g. /BEATPORT2025
            currentBuildPath = currentBuildPath ? `${currentBuildPath}/${part}` : part;
            const fullPath = '/' + currentBuildPath;

            if (!folderSet.has(fullPath)) {
                folderSet.add(fullPath);
                folderStats[fullPath] = {
                    name: part,
                    full_path: fullPath,
                    parent_path: parent || '/',
                    depth: fullPath.split('/').filter(Boolean).length,
                    track_count: 0
                };
            }
        });

        // Increment track count for the IMMEDIATE parent
        const immediateParent = '/' + parts.join('/');
        if (folderStats[immediateParent]) {
            folderStats[immediateParent].track_count++;
        }
    });

    const foldersToInsert = Object.values(folderStats);
    console.log(`📦 Identified ${foldersToInsert.length} unique folders.`);

    // 3. Insert into DB (Upsert)
    console.log("💾 Writing to 'dj_folders' table...");

    const limit = pLimit(10); // 10 concurrent requests
    const CHUNK_SIZE = 100;

    // Split into chunks
    for (let i = 0; i < foldersToInsert.length; i += CHUNK_SIZE) {
        const chunk = foldersToInsert.slice(i, i + CHUNK_SIZE);
        await limit(async () => {
            const { error } = await supabase
                .from('dj_folders')
                .upsert(chunk, { onConflict: 'full_path' });

            if (error) console.error("Error inserting chunk:", error.message);
            else process.stdout.write('.');
        });
    }

    console.log("\n✅ Indexing Complete!");
}

buildIndex();
