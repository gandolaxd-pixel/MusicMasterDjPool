
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials. Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const importData = async () => {
  const jsonPath = path.resolve(__dirname, '../rutas_reales_djpacks.json');
  console.log(`📖 Reading data from ${jsonPath}...`);

  try {
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const tracks = JSON.parse(rawData);
    console.log(`✅ Loaded ${tracks.length} tracks from JSON.`);

    // Prepare data directly, minimal processing
    // Batch insert to avoid timeouts
    const BATCH_SIZE = 500;
    
    for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
      const batch = tracks.slice(i, i + BATCH_SIZE).map(track => ({
         title: track.name,
         file_path: track.full_path,
         folder: track.folder,
         artist: track.name.split(' - ')[0] || 'Unknown' // Simple heuristic
      }));

      const { error } = await supabase.from('tracks').insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${i}:`, error.message);
      } else {
        console.log(`✨ Inserted batch ${i} to ${i + batch.length}`);
      }
    }

    console.log("🎉 Migration complete!");

  } catch (err) {
    console.error("❌ Error reading JSON or migrating:", err);
  }
};

importData();
