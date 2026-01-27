
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTable() {
    console.log("🔍 Checking 'dj_folders' table...");

    const { data, error } = await supabase
        .from('dj_folders')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error("❌ Table does not exist (or permissions error):", error.message);
        process.exit(1);
    } else {
        console.log("✅ Table exists!");
        // Check if empty
        console.log(`info: Table has ${data} rows (count in property count check needed if data is array type?)`);
        // .select('count', { count: 'exact', head: true }) returns null for data and count in count property usually, or data is length if array?
        // Actually for head:true, data is null, count is the number.
        // Wait, supabase-js v2 returns count property on the object returned by select if count option is used.
    }
}

checkTable();
