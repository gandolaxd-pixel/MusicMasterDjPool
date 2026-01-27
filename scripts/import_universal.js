
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { parse } from 'node-html-parser';
import dotenv from 'dotenv';
dotenv.config();

// Configuración Supabase - USAR SERVICE_ROLE para bypasear RLS
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mnfcbeasyebrgxhfitiv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // ← FIX: usar SERVICE_ROLE

// Configuración StorageBox
const STORAGE_USER = process.env.HETZNER_USER || 'u529624-sub1';
const STORAGE_PASS = process.env.HETZNER_PASS || 'Gandola2026!';
const STORAGE_HOST = process.env.HETZNER_HOST || 'u529624-sub1.your-storagebox.de';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Estado Global
let totalFound = 0;
let totalInserted = 0;
let batchQueue = [];
const BATCH_SIZE = 100;

// --- HIERARCHY LOGIC ---
const MONTHS = {
    'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4, 'MAY': 5, 'JUNE': 6,
    'JULY': 7, 'AUGUST': 8, 'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
};

function detectMonth(pathParts, filename) {
    const fullString = pathParts.join(' ').toUpperCase() + ' ' + filename.toUpperCase();

    // 1. Explicit Folder in Path
    for (const part of pathParts) {
        if (MONTHS[part.toUpperCase()]) return part.toUpperCase();
    }

    // 2. String Match
    for (const month of Object.keys(MONTHS)) {
        if (fullString.includes(month)) return month;
    }

    // 3. Week Logic
    const weekMatch = fullString.match(/WEEK\s?(\d+)/);
    if (weekMatch) {
        const week = parseInt(weekMatch[1]);
        if (week >= 48) return 'DECEMBER';
        if (week >= 44) return 'NOVEMBER';
        if (week >= 40) return 'OCTOBER';
        if (week >= 35) return 'SEPTEMBER';
        if (week >= 31) return 'AUGUST';
        if (week >= 26) return 'JULY';
        if (week >= 22) return 'JUNE';
        if (week >= 17) return 'MAY';
        if (week >= 13) return 'APRIL';
        if (week >= 9) return 'MARCH';
        if (week >= 5) return 'FEBRUARY';
        return 'JANUARY';
    }

    return 'COLLECTIONS';
}

function extractFolder(pathParts, month) {
    if (pathParts[1] && pathParts[1].toUpperCase() === month) {
        if (/^\d+$/.test(pathParts[2])) {
            return pathParts[3] || pathParts[2];
        }
        return pathParts[2] || 'Uncategorized';
    }
    if (pathParts[1]) return pathParts[1];
    return 'General';
}

function calculateOriginalFolder(fullPath) {
    // SPECIAL HANDLING FOR DJPACKS to preserve /DJPACKS/YEAR structure
    if (fullPath.includes('/DJPACKS') || fullPath.includes('DJPACKS/')) {
        const parts = fullPath.split('/').filter(p => p !== '');
        parts.pop(); // Remove filename
        return parts.join('/');
    }

    const parts = fullPath.split('/').filter(p => p !== '');
    const filename = parts[parts.length - 1];
    const month = detectMonth(parts, filename);
    const folder = extractFolder(parts, month);
    return `${month}/${folder}`;
}

/**
 * Inserta un lote de tracks en Supabase
 */
async function flushBatch(poolName) {
    if (batchQueue.length === 0) return;

    const tracksToInsert = batchQueue.map(track => {
        const nameWithoutExt = track.filename.replace(/\.(mp3|wav|flac|zip|rar|aiff|m4a)$/i, '');
        const publicUrl = `https://${STORAGE_HOST}${track.fullPath}`;

        // Intentar adivinar fecha (drop_month) para metadatos extra
        const dropMatch = track.fullPath.match(/202[0-9]\/[0-1][0-9]/);
        const dropMonth = dropMatch ? dropMatch[0].replace('/', '-') : new Date().toISOString().slice(0, 7);

        return {
            name: track.filename,
            title: nameWithoutExt,
            server_path: track.fullPath,
            file_url: publicUrl,
            original_folder: track.calculatedFolder, // Usar la carpeta calculada individualmente
            format: poolName === 'DJPACKS' ? 'pack' : 'file',
            pool_id: poolName,
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
    const cleanPath = folderPath.replace(/([^:]\/)\/+/g, "$1");
    // Encode each path segment to handle special chars like #, ?, etc.
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const url = `https://${STORAGE_HOST}${encodedPath}`;

    const MAX_RETRIES = 3;
    let response;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            response = await axios.get(url, {
                headers: { 'Authorization': `Basic ${auth}` },
                timeout: 60000 // 60 second timeout
            });
            break; // Success, exit retry loop
        } catch (retryError) {
            if (attempt === MAX_RETRIES) {
                console.log(`\n⚠️ Failed after ${MAX_RETRIES} attempts: ${cleanPath}`);
                return; // Give up on this folder
            }
            console.log(`\n🔄 Retry ${attempt}/${MAX_RETRIES} for: ${cleanPath.substring(0, 50)}...`);
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
        }
    }

    try {

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
                if (!subfolderName || subfolderName.trim() === '' || subfolderName.startsWith('.')) continue;

                let nextPath;
                if (decodedName.startsWith('/')) {
                    nextPath = decodedName.slice(0, -1);
                } else {
                    nextPath = `${folderPath}/${subfolderName}`;
                }

                if (nextPath === folderPath || nextPath.length <= folderPath.length && folderPath.startsWith(nextPath)) {
                    continue;
                }

                let displayPath = nextPath;
                if (nextPath.startsWith(baseFolder)) {
                    displayPath = nextPath.slice(baseFolder.length);
                }

                // SECURITY EXCLUSION
                const upperPath = nextPath.toUpperCase();
                if (upperPath.includes('.TRASH') ||
                    upperPath.includes('$RECYCLE.BIN') ||
                    upperPath.includes('0DAYS') ||
                    upperPath.includes('COLLECTIONS')) {
                    continue;
                }

                process.stdout.write(`\r📂 ${displayPath.substring(0, 60)}... `);

                await scanFolderRecursive(nextPath, baseFolder, poolName);
            } else {
                // Es Archivo
                const hasExtension = audioExtensions.some(ext => decodedName.toLowerCase().endsWith(ext));
                if (hasExtension) {
                    let fullPath;
                    if (decodedName.startsWith('/')) {
                        fullPath = decodedName;
                    } else {
                        fullPath = `${folderPath}/${decodedName}`;
                    }

                    // CALCULAR JERARQUÍA AQUÍ
                    const calculatedFolder = calculateOriginalFolder(fullPath);

                    batchQueue.push({
                        filename: decodedName.split('/').pop(),
                        fullPath: fullPath,
                        calculatedFolder: calculatedFolder
                    });

                    totalFound++;

                    if (batchQueue.length >= BATCH_SIZE) {
                        await flushBatch(poolName);
                    }
                }
            }
        }
    } catch (error) {
        console.log(`\n❌ Error parsing folder ${cleanPath}: ${error.message}`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const folder = args[0];
    const pool = args[1];

    if (!folder || !pool) {
        console.error("Uso: node scripts/import_universal.js <CARPETA> <POOL_NAME>");
        process.exit(1);
    }

    const targetFolder = folder.startsWith('/') ? folder : '/' + folder;

    console.log(`🚀 IMPORTADOR OPTIMIZADO V4 (HIERARCHY SUPPORT)`);
    console.log(`📂 Objetivo: ${targetFolder}`);
    console.log(`📡 Pool: ${pool}`);
    console.log("-----------------------------------------");
    console.log("Iniciando escaneo... ");

    await scanFolderRecursive(targetFolder, targetFolder, pool);

    await flushBatch(pool);

    console.log(`\n\n🏁 FINALIZADO.`);
    console.log(`Archivos encontrados: ${totalFound}`);
    console.log(`Archivos insertados: ${totalInserted}`);
}

main();
