
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function grantAccess(email) {
    if (!email) {
        console.error("❌ Error: Please provide an email address.");
        console.log("Usage: node scripts/grant_access.cjs user@example.com");
        process.exit(1);
    }

    console.log(`🔍 Looking for user: ${email}...`);

    // 1. Check if user exists in profiles
    const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (findError || !profile) {
        console.error("❌ User not found in 'profiles' table.");
        console.log("Make sure the user has signed up and logged in at least once.");
        return;
    }

    // 2. Update status
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            subscription_status: 'active',
            subscription_plan: 'premium_admin' // Optional flag for reference
        })
        .eq('id', profile.id);

    if (updateError) {
        console.error("❌ Failed to update profile:", updateError.message);
    } else {
        console.log(`✅ SUCCESS! User '${email}' is now ACTIVE.`);
        console.log("They can now download files without paying.");
    }
}

const emailArg = process.argv[2];
grantAccess(emailArg);
