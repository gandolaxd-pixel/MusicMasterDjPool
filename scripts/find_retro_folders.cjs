const axios = require('axios');
const { parse } = require('node-html-parser');
require('dotenv').config();

const u = process.env.HETZNER_USER;
const p = process.env.HETZNER_PASS;
const h = process.env.HETZNER_HOST;

const KEYWORDS = ['12 INCH', 'DANCE EURO', 'ITALO', '80s', 'Retro'];
const BASE_PATHS = ['/', '/VA%20ALBUMS/', '/REMIXEN/'];

async function scan(basePath, depth = 0) {
    if (depth > 2) return; // Don't go too deep

    try {
        const url = `https://${u}:${p}@${h}${basePath}`;
        // console.log(`Scanning: ${basePath}`);
        const res = await axios.get(url, { timeout: 10000 });
        const root = parse(res.data);
        const links = root.querySelectorAll('a');

        for (const link of links) {
            const href = link.getAttribute('href');
            let name = link.text.trim();
            try { name = decodeURIComponent(name); } catch (e) { }

            if (!href || href.startsWith('?') || name === 'Parent Directory' || name === '../') continue;

            // Check match
            const upper = name.toUpperCase();
            if (KEYWORDS.some(k => upper.includes(k.toUpperCase()))) {
                console.log(`✅ MATCH: ${basePath}${href}`);
            }

            // Recurse if folder
            if (href.endsWith('/')) {
                await scan(basePath + href, depth + 1);
            }
        }
    } catch (e) {
        // console.error(`Err ${basePath}: ${e.message}`);
    }
}

async function run() {
    console.log("🔍 Searching for Retro Folders...");
    for (const p of BASE_PATHS) {
        await scan(p);
    }
    console.log("🏁 Done.");
}

run();
