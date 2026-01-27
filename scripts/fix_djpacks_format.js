
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixFormat() {
    console.log("🛠️ Fixing DJPACKS format (file -> pack)...");

    // Update all tracks with pool_id 'DJPACKS' to have format 'pack'
    const { data, error, count } = await supabase
        .from('dj_tracks')
        .update({ format: 'pack' })
        .eq('pool_id', 'DJPACKS')
        .eq('format', 'file')
        .select();

    if (error) {
        console.error("❌ Error updating:", error.message);
    } else {
        console.log(`✅ Success! Updated ${data.length} tracks to PACK format.`);
    }
}

fixFormat();
