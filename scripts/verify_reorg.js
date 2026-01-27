
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyUpdates() {
    const { data, error } = await supabase
        .from('dj_tracks')
        .select('original_folder, server_path')
        .eq('pool_id', 'Beatport 2025')
        .limit(10); // Check first 10

    if (error) { console.error(error); return; }

    console.log("Updated Folders Sample:");
    data.forEach(d => console.log(`${d.original_folder}  (was ${d.server_path.split('/')[1]})`));
}

verifyUpdates();
