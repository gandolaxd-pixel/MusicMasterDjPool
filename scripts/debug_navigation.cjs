const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function debug() {
    console.log('\n========================================');
    console.log('🔍 DIAGNÓSTICO DE NAVEGACIÓN');
    console.log('========================================\n');

    // 1. Check dj_folders table
    console.log('1️⃣ TABLA dj_folders:');
    const { data: foldersCount, error: fcErr } = await supabase
        .from('dj_folders')
        .select('*', { count: 'exact', head: true });
    
    if (fcErr) {
        console.log('   ❌ Error o tabla no existe:', fcErr.message);
    } else {
        const { count } = await supabase.from('dj_folders').select('*', { count: 'exact', head: true });
        console.log(`   Total carpetas indexadas: ${count || 0}`);
    }

    // 2. Check sample folders
    console.log('\n   Muestra de carpetas:');
    const { data: sampleFolders } = await supabase
        .from('dj_folders')
        .select('parent_path, name')
        .limit(10);
    
    if (sampleFolders && sampleFolders.length > 0) {
        sampleFolders.forEach(f => console.log(`   📁 ${f.parent_path} -> ${f.name}`));
    } else {
        console.log('   ⚠️ No hay carpetas en dj_folders');
    }

    // 3. Check BEATPORT folders specifically
    console.log('\n2️⃣ BEATPORT - Carpetas con parent_path que contenga BEATPORT:');
    const { data: beatportFolders } = await supabase
        .from('dj_folders')
        .select('parent_path, name')
        .ilike('parent_path', '%BEATPORT%')
        .limit(10);
    
    if (beatportFolders && beatportFolders.length > 0) {
        beatportFolders.forEach(f => console.log(`   📁 ${f.parent_path} -> ${f.name}`));
    } else {
        console.log('   ⚠️ No hay carpetas de BEATPORT en dj_folders');
    }

    // 4. Check RETRO folders
    console.log('\n3️⃣ RETRO_VAULT - Carpetas:');
    const { data: retroFolders } = await supabase
        .from('dj_folders')
        .select('parent_path, name')
        .or('parent_path.ilike.%80s%,parent_path.ilike.%ITALO%,parent_path.ilike.%DANCE%,parent_path.eq./')
        .limit(15);
    
    if (retroFolders && retroFolders.length > 0) {
        retroFolders.forEach(f => console.log(`   📁 ${f.parent_path} -> ${f.name}`));
    } else {
        console.log('   ⚠️ No hay carpetas de RETRO en dj_folders');
    }

    // 5. Check dj_tracks by pool_id
    console.log('\n4️⃣ TRACKS POR POOL_ID:');
    const { data: poolCounts } = await supabase
        .from('dj_tracks')
        .select('pool_id')
        .limit(10000);
    
    if (poolCounts) {
        const counts = {};
        poolCounts.forEach(t => {
            counts[t.pool_id] = (counts[t.pool_id] || 0) + 1;
        });
        Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([pool, count]) => {
            console.log(`   🎵 ${pool}: ${count} tracks`);
        });
    }

    // 6. Check BEATPORT tracks server_path format
    console.log('\n5️⃣ BEATPORT - Formato de server_path:');
    const { data: beatportTracks } = await supabase
        .from('dj_tracks')
        .select('server_path, original_folder')
        .eq('pool_id', 'BEATPORT')
        .limit(5);
    
    if (beatportTracks && beatportTracks.length > 0) {
        beatportTracks.forEach(t => {
            console.log(`   📄 server_path: ${t.server_path}`);
            console.log(`      original_folder: ${t.original_folder}`);
        });
    } else {
        console.log('   ⚠️ No hay tracks de BEATPORT');
    }

    // 7. Check RETRO tracks
    console.log('\n6️⃣ RETRO_VAULT - Tracks (pool_id = RETRO_VAULT):');
    const { data: retroTracks } = await supabase
        .from('dj_tracks')
        .select('server_path, pool_id')
        .eq('pool_id', 'RETRO_VAULT')
        .limit(5);
    
    if (retroTracks && retroTracks.length > 0) {
        retroTracks.forEach(t => console.log(`   📄 ${t.server_path}`));
    } else {
        console.log('   ⚠️ No hay tracks con pool_id = RETRO_VAULT');
        
        // Check if they're stored differently
        console.log('\n   Buscando tracks que contengan "80s" o "ITALO" en server_path:');
        const { data: altRetro } = await supabase
            .from('dj_tracks')
            .select('server_path, pool_id')
            .or('server_path.ilike.%80s%,server_path.ilike.%ITALO%')
            .limit(5);
        
        if (altRetro && altRetro.length > 0) {
            altRetro.forEach(t => console.log(`   📄 [${t.pool_id}] ${t.server_path}`));
        }
    }

    // 8. Check DJ Pools (Club Killers, etc)
    console.log('\n7️⃣ DJ POOLS - Estructura de drop_month/drop_day:');
    const { data: djPoolTracks } = await supabase
        .from('dj_tracks')
        .select('pool_id, original_folder, drop_month, drop_day')
        .not('pool_id', 'in', '(BEATPORT,DJPACKS,RETRO_VAULT,SOUTH AMERICA)')
        .limit(10);
    
    if (djPoolTracks && djPoolTracks.length > 0) {
        djPoolTracks.forEach(t => {
            console.log(`   🎵 [${t.pool_id}] folder: ${t.original_folder}, month: ${t.drop_month}, day: ${t.drop_day}`);
        });
    } else {
        console.log('   ⚠️ No hay tracks de DJ Pools regulares');
    }

    console.log('\n========================================');
    console.log('✅ Diagnóstico completado');
    console.log('========================================\n');
}

debug().catch(console.error);
