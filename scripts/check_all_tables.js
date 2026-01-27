// Script para verificar tracks en TODAS las tablas
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🔍 Verificando TODAS las tablas...\n');

    // 1. Tabla 'tracks'
    console.log('═══════════════════════════════════════');
    console.log('📂 TABLA: tracks');
    console.log('═══════════════════════════════════════');

    const { count: totalTracks } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true });
    console.log(`   Total: ${totalTracks || 0} registros`);

    const { data: trackSamples } = await supabase
        .from('tracks')
        .select('folder, file_path, title')
        .limit(5);
    console.log('   Ejemplos:');
    trackSamples?.forEach(t => console.log(`     - ${t.folder || t.file_path}`));

    // 2. Tabla 'dj_tracks'
    console.log('\n═══════════════════════════════════════');
    console.log('📂 TABLA: dj_tracks');
    console.log('═══════════════════════════════════════');

    const { count: totalDjTracks } = await supabase
        .from('dj_tracks')
        .select('*', { count: 'exact', head: true });
    console.log(`   Total: ${totalDjTracks || 0} registros`);

    // Buscar Beatport en dj_tracks
    const { count: beatportDjTracks } = await supabase
        .from('dj_tracks')
        .select('*', { count: 'exact', head: true })
        .ilike('original_folder', '%beatport%');
    console.log(`   Beatport (any): ${beatportDjTracks || 0} registros`);

    const { count: beatport2025DjTracks } = await supabase
        .from('dj_tracks')
        .select('*', { count: 'exact', head: true })
        .ilike('original_folder', '%beatport%2025%');
    console.log(`   Beatport 2025: ${beatport2025DjTracks || 0} registros`);

    const { data: djTrackSamples } = await supabase
        .from('dj_tracks')
        .select('original_folder, server_path, name')
        .ilike('original_folder', '%beatport%')
        .limit(5);
    console.log('   Ejemplos Beatport:');
    djTrackSamples?.forEach(t => console.log(`     - ${t.original_folder}`));

    // 3. Ver patrones únicos de carpetas
    console.log('\n═══════════════════════════════════════');
    console.log('📊 PATRONES DE CARPETAS ÚNICOS (dj_tracks)');
    console.log('═══════════════════════════════════════');

    const { data: uniqueFolders } = await supabase
        .from('dj_tracks')
        .select('original_folder')
        .ilike('original_folder', '%beatport%')
        .limit(20);

    const unique = [...new Set(uniqueFolders?.map(f => f.original_folder?.split('/').slice(0, 4).join('/')))];
    unique.forEach(f => console.log(`   - ${f}`));

    console.log('\n✅ Verificación completada.');
}

main();
