
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
    const { data, error } = await supabase
        .from('dj_tracks')
        .select('pool_id, original_folder, server_path, name, title')
        .eq('pool_id', 'Beatport 2025')
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }
    console.log("Muestra de datos insertados (Beatport 2025):");
    console.log(JSON.stringify(data, null, 2));
}

checkStructure();
