import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { parse } from 'node-html-parser';
import dotenv from 'dotenv';
dotenv.config();

// Supabase Config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// StorageBox Config
const STORAGE_USER = process.env.HETZNER_USER;
const STORAGE_PASS = process.env.HETZNER_PASS;
const STORAGE_HOST = process.env.HETZNER_HOST;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 📼 RETRO VAULT CONFIG
const POOL_ID = 'RETRO_VAULT';
const TARGET_FOLDERS = [
    '/80s/',
    '/12 INCH/',
    '/DANCE CLASSICS COLLECTION/',
    '/DANCE EURO COLLECTION/',
    '/ITALO_DISCO/'
];

let totalFound = 0;
let batchQueue = [];
const BATCH_SIZE = 200;

async function flushBatch() {
    if (batchQueue.length === 0) return;

    const { error } = await supabase.from('dj_tracks').upsert(batchQueue, {
        onConflict: 'server_path',
        ignoreDuplicates: true
    });

    if (error) {
        console.error('❌ Insert Error:', error.message);
    } else {
        process.stdout.write('.');
    }
    batchQueue = [];
}

async function scanFolder(currentPath) {
    if (!currentPath.endsWith('/')) currentPath += '/';
    const url = `https://${STORAGE_USER}:${STORAGE_PASS}@${STORAGE_HOST}${currentPath}`;

    try {
        const response = await axios.get(url, { timeout: 15000 });
        const root = parse(response.data);
        const items = root.querySelectorAll('a');

        for (const item of items) {
            const href = item.getAttribute('href');
            let name = item.text.trim();

            if (!href || href.startsWith('?')) continue;

            // Skip parent/current dirs
            if (name === 'Parent Directory' || name === '../' || name === './') continue;

            // Decode name for basic check, but keep href logic for recursion
            let decodedName = name;
            try { decodedName = decodeURIComponent(name).trim(); } catch (e) { }

            // Avoid infinite loops with bad relative paths
            const decodedHref = decodeURIComponent(href);
            if (decodedHref === '../' || decodedHref === './' || decodedHref.includes('../')) continue;

            const isFolder = href.endsWith('/');

            // Construct full path
            let fullPath = '';
            if (href.startsWith('/')) {
                fullPath = href;
            } else {
                fullPath = currentPath + href;
            }
            fullPath = fullPath.replace(/\/{2,}/g, '/'); // Normalize

            if (isFolder) {
                await scanFolder(fullPath);
            } else {
                if (!name.match(/\.(mp3|wav|flac|m4a|zip|rar)$/i)) continue;

                totalFound++;
                const originalFolder = currentPath.replace(/\/$/, '');

                // RAW METADATA (Decoded for readability, but no cleaning)
                let finalName = name;
                try { finalName = decodeURIComponent(name).trim(); } catch (e) { }

                batchQueue.push({
                    pool_id: POOL_ID,
                    server_path: fullPath,
                    original_folder: originalFolder,
                    name: finalName, // "My Song.mp3"
                    title: finalName.replace(/\.[^/.]+$/, ""), // "My Song"
                    format: name.match(/\.(zip|rar)$/i) ? 'pack' : 'track',
                    created_at: new Date()
                });

                if (batchQueue.length >= BATCH_SIZE) await flushBatch();
            }
        }

    } catch (e) {
        // Suppress 404s for cleaner logs if some folders are empty/protected behavior
        console.error(`\n⚠️ Error scanning ${currentPath}: ${e.message}`);
    }
}

async function run() {
    console.log(`🚀 STARTING RETRO VAULT IMPORT`);
    console.log(`🎯 Pool ID: ${POOL_ID}`);
    console.log(`📂 Targets: ${TARGET_FOLDERS.join(', ')}`);
    console.log('----------------------------------------');

    for (const folder of TARGET_FOLDERS) {
        console.log(`\n👉 Scanning: ${folder}`);
        await scanFolder(folder);
    }

    await flushBatch(); // Final flush to DB

    console.log(`\n\n✅ IMPORT COMPLETE. Found: ${totalFound} files.`);
}

run();
