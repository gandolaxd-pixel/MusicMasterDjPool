
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRpc() {
    console.log("Checking for exec_sql...");
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    if (error) {
        console.log("❌ exec_sql not available:", error.message);
    } else {
        console.log("✅ exec_sql IS available!");
    }
}

checkRpc();
