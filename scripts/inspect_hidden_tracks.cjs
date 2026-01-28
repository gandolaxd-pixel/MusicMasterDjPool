
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTracks() {
    // Check tracks in one of the mixed folders found earlier
    const path = "/80s/100%20Hits%2070s%20Chartbusters%20(5Cd).Flac";

    console.log(`Checking tracks in: ${path}`);

    const { data: tracks, error } = await supabase
        .from('dj_tracks')
        .select('name, server_path')
        .ilike('server_path', `${path}/%`)
        .limit(10);

    if (error) console.error(error);
    else {
        console.log("Sample tracks found (HIDDEN IN UI):");
        tracks.forEach(t => console.log(`- ${t.name} (${t.server_path})`));
    }
}

checkTracks();
