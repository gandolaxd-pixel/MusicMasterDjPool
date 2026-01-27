
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MONTHS = {
    'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4, 'MAY': 5, 'JUNE': 6,
    'JULY': 7, 'AUGUST': 8, 'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
};

// Map typical path segments to months if possible
function detectMonth(pathParts, filename) {
    const fullString = pathParts.join(' ').toUpperCase() + ' ' + filename.toUpperCase();

    // 1. Explicit Folder in Path (e.g. /DECEMBER/)
    for (const part of pathParts) {
        if (MONTHS[part.toUpperCase()]) return part.toUpperCase();
    }

    // 2. String Match in Path/Filename (e.g. "Best of December")
    for (const month of Object.keys(MONTHS)) {
        if (fullString.includes(month)) return month;
    }

    // 3. Week Logic (Optional, simplistic mapping for now)
    // Week 1-4: Jan, 5-8: Feb... 
    // Week 51, 52 -> DECEMBER
    const weekMatch = fullString.match(/WEEK\s?(\d+)/);
    if (weekMatch) {
        const week = parseInt(weekMatch[1]);
        if (week >= 48) return 'DECEMBER';
        if (week >= 44) return 'NOVEMBER';
        if (week >= 40) return 'OCTOBER';
        /* ... can expand ... */
    }

    return 'COLLECTIONS'; // Fallback
}

function extractFolder(pathParts, month) {
    // Strategy:
    // If path is /BEATPORT2025/DECEMBER/09/Folder Name/...
    // Parts: ["BEATPORT2025", "DECEMBER", "09", "Folder Name"]

    // If Month was found at index 1:
    if (pathParts[1].toUpperCase() === month) {
        // Check if index 2 is a day (2 digits)
        if (/^\d+$/.test(pathParts[2])) {
            return pathParts[3] || pathParts[2]; // Return "Folder Name" or "09" if folder missing
        }
        return pathParts[2] || 'Uncategorized';
    }

    // If path is /BEATPORT2025/Folder Name/... (And Month was detected via string match)
    // Parts: ["BEATPORT2025", "Folder Name"]
    // Return "Folder Name" (index 1)
    if (pathParts[1]) return pathParts[1];

    return 'General';
}

async function reorganize() {
    console.log("Fetching Beatport 2025 tracks...");

    // Process in chunks to avoid memory issues
    const pageSize = 1000;
    let page = 0;
    let processed = 0;
    let updates = [];

    while (true) {
        const { data, error } = await supabase
            .from('dj_tracks')
            .select('id, server_path')
            .eq('pool_id', 'Beatport 2025')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) { console.error(error); break; }
        if (data.length === 0) break;

        for (const track of data) {
            const parts = track.server_path.split('/').filter(p => p !== '');
            // parts[0] is usually BEATPORT2025

            const month = detectMonth(parts, parts[parts.length - 1]);
            const folder = extractFolder(parts, month);

            const newOriginalFolder = `${month}/${folder}`;

            updates.push({
                id: track.id,
                original_folder: newOriginalFolder
            });
        }

        // Perform Bulk Update (upsert is tricky for updates, better to rely on ID)
        // Since Supabase JS doesn't support bulk update easily with different values,
        // we might need to iterate. But for 50k, sequential is slow.
        // Optimization: Use `upsert` if we include all required fields? No.
        // We will execute parallel promises in batches of 50.

        console.log(`Processing batch ${page + 1}... (${data.length} tracks)`);

        const BATCH_SIZE = 50;
        for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = updates.slice(i, i + BATCH_SIZE);
            const promises = batch.map(u =>
                supabase.from('dj_tracks').update({ original_folder: u.original_folder }).eq('id', u.id)
            );
            await Promise.all(promises);
            process.stdout.write('.');
        }
        console.log(" Batch done.");

        processed += data.length;
        page++;
        updates = []; // Clear
    }

    console.log(`\nReorganization Complete. Processed ${processed} tracks.`);
}

reorganize();
