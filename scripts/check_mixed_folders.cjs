
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const RETRO_ROOTS = [
    '80s',
    '12 INCH',
    'DANCE CLASSICS COLLECTION',
    'DANCE EURO COLLECTION',
    'ITALO_DISCO'
];

async function checkMixed() {
    console.log("=== CHECKING FOR MIXED CONTENT IN RETRO VAULT ===");

    // We'll check just '80s' for now as a sample, or all roots if fast
    for (const root of RETRO_ROOTS) {
        const path = `/${root}`;
        console.log(`Checking root: ${path}`);

        // 1. Check if root itself has files (it shouldn't, it's a folder root)
        // But more importantly, check its children.

        // Let's get all folders under this root (level 1)
        const { data: subfolders } = await supabase
            .from('dj_folders')
            .select('name')
            .eq('parent_path', path);

        if (!subfolders) continue;

        for (const f of subfolders) {
            const subPath = `${path}/${f.name}`;

            // Does this subfolder have FURTHER subfolders?
            const { count: folderCount } = await supabase
                .from('dj_folders')
                .select('*', { count: 'exact', head: true })
                .eq('parent_path', subPath);

            // Does this subfolder ALSO have tracks?
            const { count: trackCount } = await supabase
                .from('dj_tracks')
                .select('*', { count: 'exact', head: true })
                .ilike('server_path', `${subPath}/%`);
            // Note: server_path includes filename. track "server_path" usually is "/80s/Pop/song.mp3"
            // If we want tracks DIRECTLY in this folder, we need regex or careful check
            // But generally, checks if tracks exist at all.

            if (folderCount > 0 && trackCount > 0) {
                console.log(`⚠️ MIXED CONTENT FOUND at ${subPath}`);
                console.log(`   - Subfolders: ${folderCount}`);
                console.log(`   - Tracks: ${trackCount}`);
                console.log(`   -> UI will SHOW FOLDERS and HIDE TRACKS (Correct per request?)`);
            }
        }
    }
    console.log("=== DONE ===");
}

checkMixed();
