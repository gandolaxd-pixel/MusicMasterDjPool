const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clean() {
    console.log("🧹 Cleaning 'Altoremix' from DB...");

    // Fetch all tracks with the string
    let { data: tracks, error } = await supabase
        .from('dj_tracks')
        .select('*')
        .ilike('name', '%Altoremix%')
        .eq('pool_id', 'SOUTH AMERICA');

    if (error) {
        console.error("Fetch error:", error);
        return;
    }

    console.log(`Found ${tracks.length} dirty tracks.`);

    if (tracks.length === 0) return;

    const updates = tracks.map(t => {
        const cleanName = t.name
            .replace(/Altoremix\.com\.ar\s*-\s*/gi, '')
            .replace(/www\.altoremix\.com\.ar/gi, '')
            .replace(/Altoremix\.com\.ar/gi, '')
            .trim();

        return {
            ...t,
            name: cleanName,
            title: cleanName.replace(/\.[^/.]+$/, "")
        };
    });

    // Upsert in batches
    const BATCH = 1000;
    for (let i = 0; i < updates.length; i += BATCH) {
        const batch = updates.slice(i, i + BATCH);
        const { error: upErr } = await supabase.from('dj_tracks').upsert(batch);
        if (upErr) console.error("Update error:", upErr);
        else console.log(`   Cleaned batch ${i} - ${i + batch.length}`);
    }

    console.log("✨ Done cleaning tracks.");
}

clean();
