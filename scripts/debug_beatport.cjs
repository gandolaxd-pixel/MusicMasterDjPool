
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkBeatport() {
    console.log("=== CHECKING BEATPORT TRACKS ===");

    const { data: tracks, error } = await supabase
        .from('dj_tracks')
        .select('server_path')
        .eq('pool_id', 'BEATPORT')
        .limit(20);

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    if (tracks.length === 0) {
        console.log("No tracks found for pool_id = 'BEATPORT'");
    } else {
        console.log("Sample paths:");
        tracks.forEach(t => console.log(t.server_path));
    }

    console.log("\n=== CHECKING DJ_FOLDERS FOR BEATPORT ===");
    const { data: folders } = await supabase
        .from('dj_folders')
        .select('*')
        .ilike('parent_path', '%BEATPORT%')
        .limit(20);

    if (folders && folders.length > 0) {
        folders.forEach(f => console.log(`[Folder] ${f.parent_path} -> ${f.name}`));
    } else {
        console.log("No folders found matching BEATPORT in parent_path");
    }
}

checkBeatport();
