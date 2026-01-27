
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
    console.log("🧪 Testing Insert into 'dj_folders'...");

    const dummy = {
        full_path: '/test/folder',
        name: 'folder',
        depth: 2,
        parent_path: '/test',
        track_count: 0
    };

    const { data, error } = await supabase
        .from('dj_folders')
        .upsert(dummy)
        .select();

    if (error) {
        console.error("❌ Insert Failed:", error);
    } else {
        console.log("✅ Insert Success:", data);

        // Clean up
        await supabase.from('dj_folders').delete().eq('full_path', '/test/folder');
    }
}

testInsert();
