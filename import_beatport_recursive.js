import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { parse } from 'node-html-parser';

// Configuración
const SUPABASE_URL = 'https://mnfcbeasyebrgxhfitiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZmNiZWFzeWVicmd4aGZpdGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjYyNTYsImV4cCI6MjA4NDAwMjI1Nn0.a7bHJtuGUMSQkEJXKwN43v9s97t384NUrEMBD49trA8';

const STORAGE_USER = 'u529624-sub1';
const STORAGE_PASS = 'Gandola2026!';
const STORAGE_HOST = 'u529624-sub1.your-storagebox.de';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Carpetas a escanear
const BEATPORT_FOLDERS = [
    '/BEATPORT2025',
    '/BEATPORT2026'
];

/**
 * Escanea RECURSIVAMENTE una carpeta del servidor Hetzner via HTTP
 * Explora todas las subcarpetas automáticamente
 */
async function scanFolderRecursive(folderPath, baseFolder, allTracks = []) {
    console.log(`📂 Escaneando: ${folderPath}`);

    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');
    const url = `https://${STORAGE_HOST}${folderPath}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` }
        });

        const html = response.data;
        const root = parse(html);

        const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aiff'];
        const links = root.querySelectorAll('a');

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href.includes('..') || href.includes('?')) continue;

            const decodedName = decodeURIComponent(href);

            // Si termina en /, es una subcarpeta → RECURSIÓN
            if (decodedName.endsWith('/')) {
                const subfolderName = decodedName.slice(0, -1);
                const subfolderPath = `${folderPath}/${subfolderName}`;

                // 🔁 Llamada recursiva para explorar subcarpeta
                await scanFolderRecursive(subfolderPath, baseFolder, allTracks);

            } else {
                // Es un archivo
                const hasAudioExt = audioExtensions.some(ext => decodedName.toLowerCase().endsWith(ext));

                if (hasAudioExt) {
                    const subfolder = folderPath.replace(baseFolder, '').replace(/^\//, '');
                    allTracks.push({
                        filename: decodedName,
                        fullPath: `${folderPath}/${decodedName}`,
                        subfolder: subfolder || 'root'
                    });
                }
            }
        }

        return allTracks;

    } catch (error) {
        console.error(`❌ Error escaneando ${folderPath}:`, error.message);
        return allTracks;
    }
}

/**
 * Extrae metadatos básicos del nombre del archivo
 */
function parseTrackName(filename) {
    // Remover extensión
    const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|m4a|aiff)$/i, '');

    // Intentar extraer BPM (ej: "128 BPM")
    const bpmMatch = nameWithoutExt.match(/(\d{2,3})\s?bpm/i);
    const bpm = bpmMatch ? parseInt(bpmMatch[1]) : null;

    // Intentar extraer KEY (ej: "Am", "C#m")
    const keyMatch = nameWithoutExt.match(/\b([A-G][#b]?m?)\b/);
    const key = keyMatch ? keyMatch[1] : null;

    return {
        title: nameWithoutExt,
        bpm,
        key
    };
}

/**
 * Importa tracks a Supabase
 */
async function importTracks(tracks, folderName) {
    console.log(`\n💾 Importando ${tracks.length} tracks de ${folderName}...`);

    // Determinar mes/día del drop basado en el nombre de carpeta
    const year = folderName.includes('2025') ? '2025' : '2026';
    const dropMonth = `${year}-01`; // Enero por defecto
    const dropDay = 1;

    const tracksToInsert = tracks.map(track => {
        const { title, bpm, key } = parseTrackName(track.filename);
        const publicUrl = `https://${STORAGE_HOST}${track.fullPath}`;

        return {
            name: track.filename,
            title: title,
            artist: 'Various Artists', // Por defecto
            server_path: track.fullPath,
            file_url: publicUrl,
            original_folder: `${folderName}/${track.subfolder}`,
            format: 'pool',
            pool_id: 'Beatport New Releases',
            genre: 'Electronic', // Por defecto
            bpm: bpm,
            key: key,
            drop_month: dropMonth,
            drop_day: dropDay,
            created_at: new Date().toISOString()
        };
    });

    // Insertar en lotes de 500
    const BATCH_SIZE = 500;
    let inserted = 0;

    for (let i = 0; i < tracksToInsert.length; i += BATCH_SIZE) {
        const batch = tracksToInsert.slice(i, i + BATCH_SIZE);

        const { data, error } = await supabase
            .from('dj_tracks')
            .insert(batch);

        if (error) {
            console.error(`❌ Error en lote ${i}:`, error.message);
        } else {
            inserted += batch.length;
            console.log(`✅ Insertados: ${inserted} / ${tracksToInsert.length}`);
        }
    }

    return inserted;
}

/**
 * Main función
 */
async function main() {
    console.log('🎵 BEATPORT RECURSIVE IMPORT SCRIPT\n');
    console.log('='.repeat(50));
    console.log('📌 Este script explorará TODAS las subcarpetas');
    console.log('='.repeat(50) + '\n');

    let totalTracks = 0;

    for (const folder of BEATPORT_FOLDERS) {
        console.log(`\n🔍 Iniciando escaneo recursivo de: ${folder}`);

        const tracks = await scanFolderRecursive(folder, folder, []);
        console.log(`\n✓ Encontrados ${tracks.length} archivos en total (incluyendo subcarpetas)`);

        if (tracks.length > 0) {
            const inserted = await importTracks(tracks, folder);
            totalTracks += inserted;
        }

        // Esperar un segundo entre carpetas para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`🏁 IMPORTACIÓN COMPLETADA`);
    console.log(`📊 Total de tracks importados: ${totalTracks}`);
    console.log('='.repeat(50));
}

main().catch(console.error);
