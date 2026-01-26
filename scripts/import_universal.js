import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { parse } from 'node-html-parser';

// Configuración Supabase
const SUPABASE_URL = 'https://mnfcbeasyebrgxhfitiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZmNiZWFzeWVicmd4aGZpdGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjYyNTYsImV4cCI6MjA4NDAwMjI1Nn0.a7bHJtuGUMSQkEJXKwN43v9s97t384NUrEMBD49trA8';

// Configuración StorageBox
const STORAGE_USER = 'u529624-sub1';
const STORAGE_PASS = 'Gandola2026!';
const STORAGE_HOST = 'u529624-sub1.your-storagebox.de';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado Global
let totalFound = 0;
let totalInserted = 0;
let batchQueue = [];
const BATCH_SIZE = 100;

/**
 * Inserta un lote de tracks en Supabase
 */
async function flushBatch(poolName, folderName) {
    if (batchQueue.length === 0) return;

    const tracksToInsert = batchQueue.map(track => {
        const nameWithoutExt = track.filename.replace(/\.(mp3|wav|flac|zip|rar|aiff|m4a)$/i, '');
        const publicUrl = `https://${STORAGE_HOST}${track.fullPath}`;

        // Intentar adivinar fecha
        const dropMatch = track.fullPath.match(/202[0-9]\/[0-1][0-9]/);
        const dropMonth = dropMatch ? dropMatch[0].replace('/', '-') : new Date().toISOString().slice(0, 7);

        return {
            name: track.filename,
            title: nameWithoutExt,
            // artists: 'Various Artists', // REMOVED: Column does not exist in DB
            server_path: track.fullPath,
            file_url: publicUrl,
            original_folder: folderName,
            format: 'file',
            pool_id: poolName,
            // pool_origin: poolName, // REMOVED: Not in DB
            // genre: 'Electronic',   // REMOVED: Not in DB
            drop_month: dropMonth,
            drop_day: new Date().getDate(),
            created_at: new Date().toISOString()
        };
    });

    const { error } = await supabase.from('dj_tracks').insert(tracksToInsert);

    if (error) {
        console.error(`\n❌ Error insertando lote: ${error.message}`);
    } else {
        totalInserted += batchQueue.length;
        process.stdout.write(`+`);
    }

    batchQueue = []; // Limpiar cola
}

/**
 * Escanea recursivamente y encola inserciones
 */
async function scanFolderRecursive(folderPath, baseFolder, poolName) {
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');
    // Ensure no double slashes in URL
    const cleanPath = folderPath.replace(/([^:]\/)\/+/g, "$1");
    const url = `https://${STORAGE_HOST}${cleanPath}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` },
            timeout: 20000
        });

        const html = response.data;
        const root = parse(html);
        const links = root.querySelectorAll('a');
        const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aiff', '.zip', '.rar'];

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href.includes('..') || href.includes('?')) continue;

            const decodedName = decodeURIComponent(href);
            let subfolderName = decodedName.endsWith('/') ? decodedName.slice(0, -1) : decodedName;

            if (decodedName.endsWith('/')) {
                // Es Subcarpeta

                // Evitar:
                // 1. Carpetas de sistema (.profile, .trash)
                // 2. Nombres vacíos 
                // 3. Root path '/' (already handled by startswith check logic below usually)
                if (!subfolderName || subfolderName.trim() === '' || subfolderName.startsWith('.')) continue;

                // CORRECCIÓN TRAYECTORIA ROBUSTA:
                let nextPath;
                if (decodedName.startsWith('/')) {
                    // El servidor devuelve ruta absoluta (ej: /BEATPORT2025/Folder)
                    // Usamos esa ruta directamente.
                    nextPath = decodedName.slice(0, -1); // Sin slash final para consistencia
                } else {
                    // El servidor devuelve relativa (Folder/)
                    // Concatenamos
                    nextPath = `${folderPath}/${subfolderName}`;
                }

                // Evitar bucles: si nextPath es igual a folderPath o contiene // dobles raros, skip
                if (nextPath === folderPath || nextPath.length <= folderPath.length && folderPath.startsWith(nextPath)) {
                    // Caso raro de recursión hacia arriba
                    continue;
                }

                // Log Informativo (Path relativo para no ensuciar)
                // Si nextPath empieza con baseFolder, mostrar solo lo que sigue
                let displayPath = nextPath;
                if (nextPath.startsWith(baseFolder)) {
                    displayPath = nextPath.slice(baseFolder.length);
                }

                process.stdout.write(`\r📂 ${displayPath.substring(0, 60)}... `);

                await scanFolderRecursive(nextPath, baseFolder, poolName);
            } else {
                // Es Archivo
                const hasExtension = audioExtensions.some(ext => decodedName.toLowerCase().endsWith(ext));
                if (hasExtension) {
                    // Construir fullPath correcto según si es absoluto o relativo
                    let fullPath;
                    if (decodedName.startsWith('/')) {
                        fullPath = decodedName;
                    } else {
                        fullPath = `${folderPath}/${decodedName}`;
                    }

                    batchQueue.push({
                        filename: decodedName.split('/').pop(), // Solo el nombre final
                        fullPath: fullPath,
                        subfolder: 'root' // Simplification
                    });

                    totalFound++;

                    if (batchQueue.length >= BATCH_SIZE) {
                        await flushBatch(poolName, baseFolder);
                    }
                }
            }
        }
    } catch (error) {
        // Ignorar errores menores para no detener el flujo masivo
        // console.error(`\n⚠️ Error leyendo ${folderPath}: ${error.code || error.message}`);
    }
}

/**
 * MAIN
 */
async function main() {
    const args = process.argv.slice(2);
    const folder = args[0];
    const pool = args[1];

    if (!folder || !pool) {
        console.error("Uso: node scripts/import_universal.js <CARPETA> <POOL_NAME>");
        process.exit(1);
    }

    const targetFolder = folder.startsWith('/') ? folder : '/' + folder;

    console.log(`🚀 IMPORTADOR OPTIMIZADO V3 (FIXED PATHS & SCHEMA)`);
    console.log(`📂 Objetivo: ${targetFolder}`);
    console.log(`📡 Pool: ${pool}`);
    console.log("-----------------------------------------");
    console.log("Iniciando escaneo... ");

    await scanFolderRecursive(targetFolder, targetFolder, pool);

    // Insertar remanentes
    await flushBatch(pool, targetFolder);

    console.log(`\n\n🏁 FINALIZADO.`);
    console.log(`Archivos encontrados: ${totalFound}`);
    console.log(`Archivos insertados: ${totalInserted}`);
}

main();
