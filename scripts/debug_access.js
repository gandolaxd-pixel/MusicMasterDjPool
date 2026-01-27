
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAccess() {
    console.log("🔍 Checking access to 'dj_tracks' with ANON KEY...");

    const { data, error } = await supabase
        .from('dj_tracks')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error("❌ Error accessing table:", error.message);
        console.error("This confirms RLS is blocking access.");
    } else {
        console.log(`✅ Success! Rows accessible: ${data?.length} (Count: ${data})`); // count is in property count
    }

    // Try to fetch one record
    const { data: record, error: readError } = await supabase
        .from('dj_tracks')
        .select('id, pool_id')
        .limit(1);

    if (readError) {
        console.error("❌ Error reading record:", readError.message);
    } else {
        console.log("✅ Read record:", record);
    }
}

checkAccess();
