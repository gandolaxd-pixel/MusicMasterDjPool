const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { count, error } = await supabase
        .from('dj_tracks')
        .select('*', { count: 'exact', head: true })
        .eq('pool_id', 'SOUTH AMERICA');

    if (error) console.log(error);
    console.log('South America Tracks:', count);

    // Also check folders
    const { count: fCount } = await supabase
        .from('dj_folders')
        .select('*', { count: 'exact', head: true })
        .ilike('full_path', '/REMIXEN%');
    console.log('REMIXEN Folders:', fCount);
}
run();
