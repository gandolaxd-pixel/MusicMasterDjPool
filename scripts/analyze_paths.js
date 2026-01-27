
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzePaths() {
    console.log("Fetching sample paths...");
    const { data, error } = await supabase
        .from('dj_tracks')
        .select('server_path')
        .eq('pool_id', 'Beatport 2025')
        .limit(2000); // Larger sample

    if (error) {
        console.error(error);
        return;
    }

    const structure = {};
    const rootFolders = {};

    data.forEach(row => {
        const parts = row.server_path.split('/').filter(p => p !== ''); // Remove empty
        // parts[0] = BEATPORT2025
        // parts[1] = DECEMBER (Maybe)
        // parts[2] = 09 (Maybe)
        // ...

        if (parts.length < 2) return;

        const level1 = parts[1]; // Potentially Month or Pack

        if (!structure[level1]) {
            structure[level1] = { count: 0, examples: [] };
        }
        structure[level1].count++;
        if (structure[level1].examples.length < 3) {
            structure[level1].examples.push(row.server_path);
        }
    });

    console.log("Analysis of Level 1 folders (inside /BEATPORT2025):");
    console.log(JSON.stringify(structure, null, 2));
}

analyzePaths();
