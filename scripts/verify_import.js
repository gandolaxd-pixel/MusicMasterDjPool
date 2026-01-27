// Verificar cuántos registros hay ahora en dj_tracks
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log('\n📊 VERIFICACIÓN POST-IMPORTACIÓN\n');

    const { count } = await supabase
        .from('dj_tracks')
        .select('*', { count: 'exact', head: true });

    console.log(`dj_tracks: ${(count || 0).toLocaleString()} registros\n`);

    // Ver distribución por carpeta
    const { data } = await supabase
        .from('dj_tracks')
        .select('original_folder')
        .limit(5000);

    const folders = {};
    data?.forEach(d => {
        if (d.original_folder) {
            const key = d.original_folder.split('/')[0] || 'ROOT';
            folders[key] = (folders[key] || 0) + 1;
        }
    });

    console.log('Distribución por carpeta principal:');
    Object.entries(folders).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
        console.log(`   📁 ${k.padEnd(30)} ${v.toLocaleString().padStart(8)} items`);
    });
}

main();
