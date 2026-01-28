
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("=== CHECKING PROFILES TABLE ===");

    // Attempt to select one record to see fields
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error accessing profiles:", error.message);
        // Try 'users' table if profiles doesn't exist? (Supabase normally uses auth.users but custom data in profiles)
    } else {
        if (data && data.length > 0) {
            console.log("Fields found:", Object.keys(data[0]));
        } else {
            console.log("Profiles table is empty or exists but no records.");
            // We can't see columns if empty easily via JS client without inspection query?
            // Actually, we can infer from error or just try to select 'subscription_status'
        }
    }
}

checkSchema();
