const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function reset() {
    console.log("🧨 WIPING SOUTH AMERICA DATA...");

    // Delete tracks
    const { error: tErr, count: tCount } = await supabase
        .from('dj_tracks')
        .delete({ count: 'exact' })
        .eq('pool_id', 'SOUTH AMERICA');

    if (tErr) console.error("Track delete error:", tErr);
    else console.log(`Deleted ${tCount} tracks.`);

    // Delete folders
    const { error: fErr, count: fCount } = await supabase
        .from('dj_folders')
        .delete({ count: 'exact' })
        .ilike('full_path', '/REMIXEN%');

    if (fErr) console.error("Folder delete error:", fErr);
    else console.log(`Deleted ${fCount} folders.`);

    console.log("💀 Reset Complete.");
}

reset();
