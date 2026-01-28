
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
        process.exit(1);
    }

    console.log(`🔍 Looking for user in Auth system: ${email}...`);

    // 1. Find user in the Auth system (auth.users)
    // Note: This requires SERVICE_ROLE_KEY
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error("❌ Error listing users:", authError.message);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`❌ User '${email}' not found in Supabase Auth.`);
        console.log("Please sign up first.");
        return;
    }

    console.log(`✅ Found Auth User ID: ${user.id}`);

    // 2. Upsert into profiles (Create or Update)
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: email,
            subscription_status: 'active',
            subscription_plan: 'premium_admin'
        })
        .select();

    if (upsertError) {
        console.error("❌ Failed to update/create profile:", upsertError.message);
    } else {
        console.log(`✅ SUCCESS! User '${email}' profile updated/created.`);
        console.log("Status: ACTIVE (premium_admin)");
    }
}

const emailArg = process.argv[2];
grantAccess(emailArg);
