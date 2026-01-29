/**
 * IMPORTACIÓN COMPLETA DEL SERVIDOR FTP
 * 
 * Este script escanea TODAS las carpetas del servidor recursivamente
 * e importa tanto las carpetas como los tracks a Supabase.
 * 
 * Uso: node scripts/import_full_ftp.js
 * 
 * Para importar solo ciertas carpetas:
 * node scripts/import_full_ftp.js "ALBUMS" "CHARTS" "0DAYS"
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { parse } from 'node-html-parser';

// Configuración Supabase
const SUPABASE_URL = 'https://mnfcbeasyebrgxhfitiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZmNiZWFzeWVicmd4aGZpdGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjU0NTAsImV4cCI6MjA2MzYwMTQ1MH0.sPYetHeQ89yRFqJmrahpLiqWnpBOoSbSoJMfeMr5xGg';

// Configuración servidor FTP/Storage
const STORAGE_USER = 'u529624-sub1';
const STORAGE_PASS = 'Gandola2026!';
const STORAGE_HOST = 'u529624-sub1.your-storagebox.de';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Extensiones de audio válidas
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a', '.aiff', '.aac', '.ogg'];

// Carpetas a ignorar
const IGNORE_FOLDERS = ['.Trash-1000', '.trash', '@eaDir', '.DS_Store', 'core'];

// Contadores globales
let totalFolders = 0;
let totalTracks = 0;
let errors = [];

/**
 * Obtiene el listado de una carpeta del servidor
 */
async function listFolder(folderPath) {
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');
    const url = `https://${STORAGE_HOST}${encodeURI(folderPath)}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` },
            timeout: 30000
        });

        const html = response.data;
        const root = parse(html);
        const links = root.querySelectorAll('a');

        const items = { folders: [], files: [] };

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href.includes('..') || href.includes('?') || href === '/') continue;

            const decodedName = decodeURIComponent(href);
            const cleanName = decodedName.replace(/\/$/, '');

            // Ignorar carpetas del sistema
            if (IGNORE_FOLDERS.some(ignore => cleanName.toLowerCase().includes(ignore.toLowerCase()))) {
                continue;
            }

            if (decodedName.endsWith('/')) {
                items.folders.push(cleanName);
            } else {
                const isAudio = AUDIO_EXTENSIONS.some(ext => 
                    cleanName.toLowerCase().endsWith(ext)
                );
                if (isAudio) {
                    items.files.push(cleanName);
                }
            }
        }

        return items;
    } catch (error) {
        console.error(`❌ Error listando ${folderPath}:`, error.message);
        errors.push({ path: folderPath, error: error.message });
        return { folders: [], files: [] };
    }
}

/**
 * Extrae metadatos del nombre del archivo
 */
function parseTrackName(filename) {
    const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|m4a|aiff|aac|ogg)$/i, '');
    
    // Intentar extraer BPM
    const bpmMatch = nameWithoutExt.match(/(\d{2,3})\s?bpm/i);
    const bpm = bpmMatch ? parseInt(bpmMatch[1]) : null;

    // Intentar extraer KEY
    const keyMatch = nameWithoutExt.match(/\b([A-G][#b]?m?)\b/);
    const key = keyMatch ? keyMatch[1] : null;

    // Intentar separar artista - título
    let artist = 'Unknown Artist';
    let title = nameWithoutExt;
    
    if (nameWithoutExt.includes(' - ')) {
        const parts = nameWithoutExt.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
    }

    return { title, artist, bpm, key };
}

/**
 * Inserta carpetas en dj_folders
 */
async function insertFolders(folders) {
    if (folders.length === 0) return;

    const BATCH_SIZE = 500;
    
    for (let i = 0; i < folders.length; i += BATCH_SIZE) {
        const batch = folders.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
            .from('dj_folders')
            .upsert(batch, { onConflict: 'pool_id,parent_path,name' });

        if (error) {
            console.error(`❌ Error insertando folders:`, error.message);
        }
    }
}

/**
 * Inserta tracks en dj_tracks
 */
async function insertTracks(tracks) {
    if (tracks.length === 0) return 0;

    const BATCH_SIZE = 500;
    let inserted = 0;

    for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
        const batch = tracks.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
            .from('dj_tracks')
            .upsert(batch, { onConflict: 'pool_id,server_path' });

        if (error) {
            console.error(`❌ Error insertando tracks:`, error.message);
        } else {
            inserted += batch.length;
        }
    }

    return inserted;
}

/**
 * Escanea recursivamente una carpeta y todas sus subcarpetas
 */
async function scanRecursive(folderPath, poolId, allFolders = [], allTracks = [], depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}📂 ${folderPath}`);

    const items = await listFolder(folderPath);

    // Procesar archivos de audio
    for (const file of items.files) {
        const { title, artist, bpm, key } = parseTrackName(file);
        const serverPath = `${folderPath}/${file}`;

        allTracks.push({
            name: file,
            title: title,
            artist: artist,
            server_path: serverPath,
            original_folder: folderPath,
            pool_id: poolId,
            format: 'track',
            bpm: bpm,
            key: key,
            created_at: new Date().toISOString()
        });
    }

    // Procesar subcarpetas
    for (const subfolder of items.folders) {
        const subfolderPath = `${folderPath}/${subfolder}`;
        
        allFolders.push({
            name: subfolder,
            parent_path: folderPath,
            pool_id: poolId,
            created_at: new Date().toISOString()
        });

        // Recursión para subcarpetas
        await scanRecursive(subfolderPath, poolId, allFolders, allTracks, depth + 1);
        
        // Pequeña pausa para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { folders: allFolders, tracks: allTracks };
}

/**
 * Procesa una carpeta raíz completa
 */
async function processRootFolder(rootFolderName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 PROCESANDO: ${rootFolderName}`);
    console.log(`${'='.repeat(60)}\n`);

    const startTime = Date.now();
    const poolId = rootFolderName.toUpperCase().replace(/\s+/g, '_');
    const folderPath = `/${rootFolderName}`;

    // Insertar la carpeta raíz
    await insertFolders([{
        name: rootFolderName,
        parent_path: '/',
        pool_id: poolId,
        created_at: new Date().toISOString()
    }]);

    // Escanear recursivamente
    const { folders, tracks } = await scanRecursive(folderPath, poolId, [], [], 0);

    console.log(`\n📊 Encontrados: ${folders.length} carpetas, ${tracks.length} tracks`);

    // Insertar en base de datos
    if (folders.length > 0) {
        console.log(`💾 Guardando ${folders.length} carpetas...`);
        await insertFolders(folders);
        totalFolders += folders.length;
    }

    if (tracks.length > 0) {
        console.log(`💾 Guardando ${tracks.length} tracks...`);
        const inserted = await insertTracks(tracks);
        totalTracks += inserted;
        console.log(`✅ Insertados: ${inserted} tracks`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Tiempo: ${elapsed}s`);

    return { folders: folders.length, tracks: tracks.length };
}

/**
 * Obtiene lista de carpetas raíz del servidor
 */
async function getRootFolders() {
    console.log('📡 Obteniendo lista de carpetas del servidor...\n');
    
    const items = await listFolder('/');
    return items.folders.filter(f => !IGNORE_FOLDERS.includes(f));
}

/**
 * Main
 */
async function main() {
    console.log('\n' + '═'.repeat(60));
    console.log('   🎵 IMPORTACIÓN COMPLETA DEL SERVIDOR FTP');
    console.log('═'.repeat(60) + '\n');

    // Obtener argumentos de línea de comandos (carpetas específicas a importar)
    const args = process.argv.slice(2);
    
    let foldersToProcess;
    
    if (args.length > 0) {
        // Importar solo las carpetas especificadas
        foldersToProcess = args;
        console.log(`📌 Importando carpetas específicas: ${foldersToProcess.join(', ')}\n`);
    } else {
        // Obtener todas las carpetas raíz
        foldersToProcess = await getRootFolders();
        console.log(`📌 Se encontraron ${foldersToProcess.length} carpetas raíz\n`);
        console.log('Carpetas a procesar:');
        foldersToProcess.forEach(f => console.log(`  • ${f}`));
        console.log('');
    }

    const startTime = Date.now();

    // Procesar cada carpeta
    for (let i = 0; i < foldersToProcess.length; i++) {
        const folder = foldersToProcess[i];
        console.log(`\n[${i + 1}/${foldersToProcess.length}] Procesando ${folder}...`);
        
        try {
            await processRootFolder(folder);
        } catch (err) {
            console.error(`❌ Error procesando ${folder}:`, err.message);
            errors.push({ path: folder, error: err.message });
        }

        // Pausa entre carpetas raíz
        if (i < foldersToProcess.length - 1) {
            console.log('\n⏳ Pausa de 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Resumen final
    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n' + '═'.repeat(60));
    console.log('   📊 RESUMEN DE IMPORTACIÓN');
    console.log('═'.repeat(60));
    console.log(`   ✅ Carpetas importadas: ${totalFolders}`);
    console.log(`   ✅ Tracks importados: ${totalTracks}`);
    console.log(`   ⏱️  Tiempo total: ${totalTime} minutos`);
    
    if (errors.length > 0) {
        console.log(`   ❌ Errores: ${errors.length}`);
        errors.forEach(e => console.log(`      • ${e.path}: ${e.error}`));
    }
    
    console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
