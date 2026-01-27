/**
 * DJPOOLS IMPORTER - Assigns tracks to specific pools based on folder names
 * 
 * Structure: /DJPOOLS/2025/MONTHS/JAN/01/[Pool Name - DATE]/[files]
 * 
 * Usage: node scripts/import_djpools_v2.js DJPOOLS/2025
 */

import 'dotenv/config';
import axios from 'axios';
import { parse } from 'node-html-parser';
import { createClient } from '@supabase/supabase-js';

// Config
const STORAGE_USER = process.env.HETZNER_USER;
const STORAGE_PASS = process.env.HETZNER_PASS;
const STORAGE_HOST = process.env.HETZNER_HOST;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Pool name mapping - normalize folder names to pool IDs in the website
// Based on images in public/pools/
const POOL_MAPPINGS = {
    // Direct matches from public/pools/
    '8th wonder': '8th Wonder',
    'acapellas': 'Acapellas',
    'all in one': 'All In One',
    'america remix': 'America Remix',
    'beatfreakz': 'Beatfreakz',
    'beatjunkies': 'BeatJunkies',
    'beat junkies': 'BeatJunkies',
    'bootlegs': 'Bootlegs',
    'bootleg': 'Bootlegs',
    'bpm supreme': 'BPM Supreme',
    'bpm latino': 'BPM Latino',
    'california remix': 'California Remix',
    'club killers': 'Club Killers',
    'crack 4 djs': 'Crack 4 DJs',
    'crate connect': 'Crate Connect',
    'crooklyn clan': 'Crooklyn Clan',
    'cuba remix': 'Cuba Remix',
    'cuban': 'Cuba Remix',
    'dale mas bajo': 'Dale Mas Bajo',
    'dj city': 'DJ City',
    'dmp': 'DMP',
    'digital music pool': 'DMP',
    'da throwbackz': 'Throwbacks',
    'throwback': 'Throwbacks',
    'da zone': 'Da Zone',
    'doing the damage': 'Doing The Damage',
    'ddp': 'DDP',
    'dms': 'DMS',
    'elite remix': 'Elite Remix',
    'europa remix': 'Europa Remix',
    'extended latino': 'Extended Latino',
    'frp': 'FRP',
    'heavy hits': 'Heavy Hits',
    'hmc': 'HMC',
    'hyperz': 'Hyperz',
    'instrumentals': 'Instrumentals',
    'intensa': 'Intensa',
    'jestei pool': 'Jestei Pool',
    'just play': 'Just Play',
    'kuts': 'Kuts',
    'latin box': 'Latin Box',
    'latin remixes': 'Latin Remixes',
    'latino remix': 'Latin Remixes',
    'latin throwback': 'Latin Throwback',
    'mymp3pool': 'MyMP3Pool',
    'mmp': 'MMP',
    'plr': 'PLR',
    'platinum': 'Platinum',
    'pool platinum': 'Platinum',
    'promo only': 'Promo Only',
    'redrums': 'Redrums',
    'redrum': 'Redrums',
    'remix planet': 'Remix Planet',
    'runderground': 'RunderGround',
    'spinback': 'Spinback Promos',
    'the mash up': 'The Mash Up',
    'transitions': 'Transitions',
    'traxsource': 'Traxsource',
    'unlimited latin': 'Unlimited Latin',
    'xtendamix': 'Xtendamix',
    'zipdj': 'ZipDJ',
    'partybreaks': 'All In One',
    'mixinit': 'Mixinit',
    'goodfellas': 'Mixinit',
    'bangerz': 'Bangerz Army',
    'barbangerz': 'BarBangerz',
};

// Stats
let totalFound = 0;
let totalInserted = 0;
let batchQueue = [];
const BATCH_SIZE = 50;

/**
 * Extract pool name from folder name
 * Example: "DJ City - JAN 01 2025" => "DJ City"
 */
function extractPoolName(folderName) {
    // Remove date pattern like "- JAN 01 2025" or "[December 2024]"
    let cleanName = folderName
        .replace(/\s*-\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{1,2}\s+\d{4}\s*$/i, '')
        .replace(/\s*\[.*?\]\s*/g, '')
        .replace(/\s+Part\.?\s*\d+/i, '')
        .trim();

    // Try to find in mappings
    const lowerName = cleanName.toLowerCase();
    for (const [key, value] of Object.entries(POOL_MAPPINGS)) {
        if (lowerName.includes(key)) {
            return value;
        }
    }

    // If not found, use the cleaned name as-is
    return cleanName || 'Other';
}

async function flushBatch() {
    if (batchQueue.length === 0) return;

    const tracksToInsert = batchQueue.map(track => {
        const nameWithoutExt = track.filename.replace(/\.(mp3|wav|flac|zip|rar|aiff|m4a)$/i, '');
        const publicUrl = `https://${STORAGE_HOST}${track.fullPath}`;

        return {
            name: track.filename,
            title: nameWithoutExt,
            server_path: track.fullPath,
            file_url: publicUrl,
            original_folder: track.originalFolder,
            pool_id: track.poolId,
            format: 'file',
            drop_month: track.dropMonth,
            // Extract first number from day (handles "11 Y 12" case)
            drop_day: parseInt(track.dropDay) || 1,
            created_at: new Date().toISOString()
        };
    });

    // Use UPSERT to prevent duplicates
    const { error } = await supabase.from('dj_tracks').upsert(tracksToInsert, {
        onConflict: 'server_path',
        ignoreDuplicates: true
    });

    if (error) {
        console.error(`\n❌ Error insertando lote: ${error.message}`);
    } else {
        totalInserted += batchQueue.length;
        process.stdout.write(`+`);
    }

    batchQueue = [];
}

async function scanFolder(folderPath) {
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');
    const cleanPath = folderPath.replace(/([^:]\/)\/\/+/g, "$1");
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const url = `https://${STORAGE_HOST}${encodedPath}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` },
            timeout: 60000
        });

        const html = response.data;
        const root = parse(html);
        const links = root.querySelectorAll('a');
        const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aiff', '.zip', '.rar'];

        const items = [];
        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href === '../' || href.startsWith('?')) continue;

            const decodedName = decodeURIComponent(href);
            items.push({
                name: decodedName,
                isFolder: href.endsWith('/'),
                href: href
            });
        }

        return items;
    } catch (error) {
        console.error(`\n⚠️ Error scanning ${cleanPath}: ${error.message}`);
        return [];
    }
}

async function processPoolFolder(poolFolderPath, poolName, monthName, dayNum) {
    const items = await scanFolder(poolFolderPath);
    const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aiff'];

    for (const item of items) {
        if (item.isFolder) {
            // Recurse into subfolders - use name not href
            const subfolderName = item.name.replace(/\/$/, '');
            if (subfolderName && !subfolderName.includes('/')) {
                await processPoolFolder(`${poolFolderPath}${subfolderName}/`, poolName, monthName, dayNum);
            }
        } else {
            const ext = item.name.toLowerCase();
            if (audioExtensions.some(e => ext.endsWith(e))) {
                const fullPath = `${poolFolderPath}${item.name}`;

                batchQueue.push({
                    filename: item.name,
                    fullPath: fullPath,
                    originalFolder: poolFolderPath,
                    poolId: poolName,
                    dropMonth: monthName,
                    dropDay: dayNum
                });

                totalFound++;

                if (batchQueue.length >= BATCH_SIZE) {
                    await flushBatch();
                }
            }
        }
    }
}

async function scanDJPools(basePath) {
    console.log(`\n📂 Scanning: ${basePath}`);

    // Get MONTHS folder
    const monthsPath = `${basePath}/MONTHS/`;
    const months = await scanFolder(monthsPath);

    for (const month of months) {
        if (!month.isFolder) continue;
        // Use just the folder name, not the full href
        const monthName = month.name.replace(/\/$/, '');
        if (!monthName || monthName.includes('/')) continue; // Skip if it's a parent link

        console.log(`\n📅 Month: ${monthName}`);

        // Get days in month
        const monthPath = `${monthsPath}${monthName}/`;
        const days = await scanFolder(monthPath);

        for (const day of days) {
            if (!day.isFolder) continue;
            const dayNum = day.name.replace(/\/$/, '');
            if (!dayNum || dayNum.includes('/')) continue;

            process.stdout.write(`  Day ${dayNum}: `);

            // Get pools for this day
            const dayPath = `${monthPath}${dayNum}/`;
            const pools = await scanFolder(dayPath);

            for (const pool of pools) {
                if (!pool.isFolder) continue;
                const poolFolderName = pool.name.replace(/\/$/, '');
                if (!poolFolderName || poolFolderName.includes('/')) continue;

                const poolName = extractPoolName(poolFolderName);
                const poolPath = `${dayPath}${poolFolderName}/`;

                await processPoolFolder(poolPath, poolName, monthName, dayNum);
            }

            console.log('');
        }
    }
}

async function main() {
    const folder = process.argv[2];

    if (!folder) {
        console.error("Usage: node scripts/import_djpools.js DJPOOLS/2025");
        process.exit(1);
    }

    const targetFolder = folder.startsWith('/') ? folder : '/' + folder;

    console.log(`🚀 DJPOOLS IMPORTER (Pool Assignment)`);
    console.log(`📂 Target: ${targetFolder}`);
    console.log(`-----------------------------------------`);

    await scanDJPools(targetFolder);
    await flushBatch();

    console.log(`\n=========================================`);
    console.log(`✅ COMPLETE!`);
    console.log(`📊 Found: ${totalFound} files`);
    console.log(`💾 Inserted: ${totalInserted} tracks`);
    console.log(`=========================================`);
}

main().catch(console.error);
