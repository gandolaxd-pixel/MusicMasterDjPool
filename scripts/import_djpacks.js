
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { parse } from 'node-html-parser';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const STORAGE_USER = process.env.HETZNER_USER || 'u529624-sub1';
const STORAGE_PASS = process.env.HETZNER_PASS || 'Gandola2026!';
const STORAGE_HOST = process.env.HETZNER_HOST || 'u529624-sub1.your-storagebox.de';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let totalFound = 0;
let totalInserted = 0;
let batchQueue = [];
const BATCH_SIZE = 10;

// ... inside scanFolderRecursive ...

// This script aims to preserve the folder structure: DJPACKS/YEAR/...
function calculateDjPackFolder(fullPath) {
    // Input: /DJPACKS/2025/JANUARY/packname/song.mp3
    // Desired Original Folder: DJPACKS/2025/JANUARY/packname
    const parts = fullPath.split('/').filter(p => p !== '');
    // Remove filename
    parts.pop();
    return parts.join('/');
}

async function flushBatch(poolName) {
    if (batchQueue.length === 0) return;

    const tracksToInsert = batchQueue.map(track => {
        const nameWithoutExt = track.filename.replace(/\.(mp3|wav|flac|zip|rar|aiff|m4a)$/i, '');
        const publicUrl = `https://${STORAGE_HOST}${track.fullPath}`;

        return {
            name: track.filename,
            title: nameWithoutExt,
            server_path: track.fullPath,
            file_url: publicUrl,
            original_folder: track.calculatedFolder,
            format: 'pack', // We mark these as packs
            pool_id: poolName,
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
    batchQueue = [];
}

async function scanFolderRecursive(folderPath, startPath, poolName) {
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');
    const cleanPath = folderPath.replace(/([^:]\/)\/+/g, "$1");
    const url = `https://${STORAGE_HOST}${cleanPath}`;

    try {
        const response = await axios.get(url, { headers: { 'Authorization': `Basic ${auth}` }, timeout: 20000 });
        const root = parse(response.data);
        const links = root.querySelectorAll('a');
        const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aiff', '.zip', '.rar'];

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href.includes('..') || href.includes('?')) continue;

            const decodedName = decodeURIComponent(href);
            let subfolderName = decodedName.endsWith('/') ? decodedName.slice(0, -1) : decodedName;

            if (decodedName.endsWith('/')) {
                // Recursive scan
                let nextPath = decodedName.startsWith('/') ? decodedName.slice(0, -1) : `${folderPath}/${subfolderName}`;

                // Avoid infinite loops, Trash, 0DAYS, COLLECTIONS or going up
                // STRICT SECURITY: Must stay within startPath
                if (!nextPath.startsWith(startPath)) continue;

                const upperPath = nextPath.toUpperCase();
                if (nextPath === folderPath ||
                    upperPath.includes('.TRASH') ||
                    upperPath.includes('$RECYCLE.BIN') ||
                    upperPath.includes('0DAYS') ||
                    upperPath.includes('COLLECTIONS')
                ) continue;

                process.stdout.write(`\r📂 Scanning: ${nextPath.substring(0, 50)}... `);
                await scanFolderRecursive(nextPath, startPath, poolName);
            } else {
                // File
                const hasExtension = audioExtensions.some(ext => decodedName.toLowerCase().endsWith(ext));
                if (hasExtension) {
                    let fullPath = decodedName.startsWith('/') ? decodedName : `${folderPath}/${decodedName}`;

                    batchQueue.push({
                        filename: decodedName.split('/').pop(),
                        fullPath: fullPath,
                        calculatedFolder: calculateDjPackFolder(fullPath)
                    });
                    totalFound++;
                    process.stdout.write('.'); // Dot for found
                    if (batchQueue.length >= BATCH_SIZE) await flushBatch(poolName);
                }
            }
        }
    } catch (error) {
        // console.error(`Error scanning ${folderPath}: ${error.message}`);
    }
}

async function main() {
    const year = process.argv[2];
    if (!year) {
        console.error("Usage: node scripts/import_djpacks.js <YEAR>");
        process.exit(1);
    }

    const startFolder = `/DJPACKS/${year}`;
    console.log(`🚀 IMPORTING DJ PACKS (${year})`);
    console.log(`📂 Target: ${startFolder}`);

    await scanFolderRecursive(startFolder, startFolder, 'DJPACKS');
    await flushBatch('DJPACKS');

    console.log(`\n✅ Done. Inserted: ${totalInserted}`);
}

main();
