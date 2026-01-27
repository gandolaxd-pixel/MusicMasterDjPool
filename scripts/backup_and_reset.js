// ⚠️ BACKUP + RESET - Crea backup primero, luego borra todo
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchAllRecords(table) {
    let allRecords = [];
    let offset = 0;
    const batchSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .range(offset, offset + batchSize - 1);

        if (error) {
            console.log(`   Error en ${table}: ${error.message}`);
            break;
        }

        if (!data || data.length === 0) break;

        allRecords = allRecords.concat(data);
        offset += batchSize;
        process.stdout.write(`   Recuperando ${table}: ${allRecords.length} registros...\r`);
    }

    console.log(`   ✅ ${table}: ${allRecords.length} registros recuperados`);
    return allRecords;
}

async function deleteAllRecords(table) {
    // Obtener todos los IDs
    let offset = 0;
    const batchSize = 1000;
    let totalDeleted = 0;

    while (true) {
        const { data, error } = await supabase
            .from(table)
            .select('id')
            .range(0, batchSize - 1);

        if (error || !data || data.length === 0) break;

        const ids = data.map(r => r.id);

        const { error: delError } = await supabase
            .from(table)
            .delete()
            .in('id', ids);

        if (delError) {
            console.log(`   Error eliminando: ${delError.message}`);
            break;
        }

        totalDeleted += ids.length;
        process.stdout.write(`   Eliminando ${table}: ${totalDeleted} registros...\r`);
    }

    console.log(`   ✅ ${table}: ${totalDeleted} registros eliminados`);
    return totalDeleted;
}

async function main() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║           💾 BACKUP + RESET TOTAL                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `./backups/full_backup_${timestamp}`;
    fs.mkdirSync(backupDir, { recursive: true });

    // ═══════════════════════════════════════════════════════════════
    // PASO 1: BACKUP
    // ═══════════════════════════════════════════════════════════════
    console.log('┌────────────────────────────────────────────────────────────────────┐');
    console.log('│  💾 PASO 1: CREANDO BACKUP                                        │');
    console.log('└────────────────────────────────────────────────────────────────────┘\n');

    // Backup tracks
    console.log('   Respaldando tabla tracks...');
    const tracks = await fetchAllRecords('tracks');
    fs.writeFileSync(`${backupDir}/tracks.json`, JSON.stringify(tracks, null, 2));
    console.log(`   📁 Guardado: ${backupDir}/tracks.json\n`);

    // Backup dj_tracks
    console.log('   Respaldando tabla dj_tracks...');
    const djTracks = await fetchAllRecords('dj_tracks');
    fs.writeFileSync(`${backupDir}/dj_tracks.json`, JSON.stringify(djTracks, null, 2));
    console.log(`   📁 Guardado: ${backupDir}/dj_tracks.json\n`);

    console.log(`✅ BACKUP COMPLETO en: ${backupDir}`);
    console.log(`   - tracks.json: ${tracks.length} registros`);
    console.log(`   - dj_tracks.json: ${djTracks.length} registros\n`);

    // ═══════════════════════════════════════════════════════════════
    // PASO 2: ELIMINAR
    // ═══════════════════════════════════════════════════════════════
    console.log('┌────────────────────────────────────────────────────────────────────┐');
    console.log('│  🗑️  PASO 2: ELIMINANDO REGISTROS                                  │');
    console.log('└────────────────────────────────────────────────────────────────────┘\n');

    console.log('   Eliminando tabla tracks...');
    await deleteAllRecords('tracks');

    console.log('   Eliminando tabla dj_tracks...');
    await deleteAllRecords('dj_tracks');

    // ═══════════════════════════════════════════════════════════════
    // PASO 3: VERIFICAR
    // ═══════════════════════════════════════════════════════════════
    console.log('\n┌────────────────────────────────────────────────────────────────────┐');
    console.log('│  📊 PASO 3: VERIFICACIÓN                                          │');
    console.log('└────────────────────────────────────────────────────────────────────┘\n');

    const { count: finalTracks } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true });

    const { count: finalDjTracks } = await supabase
        .from('dj_tracks')
        .select('*', { count: 'exact', head: true });

    console.log(`   tracks:    ${(finalTracks || 0).toLocaleString()} registros`);
    console.log(`   dj_tracks: ${(finalDjTracks || 0).toLocaleString()} registros`);

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║           ✅ PROCESO COMPLETADO                                    ║');
    console.log('╠════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Backup guardado en: ${backupDir.padEnd(43)}║`);
    console.log('║  Base de datos lista para nueva importación                       ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
}

main();
