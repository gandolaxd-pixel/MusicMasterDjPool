import axios from 'axios';
import { parse } from 'node-html-parser';
import dotenv from 'dotenv';
dotenv.config();

const STORAGE_USER = process.env.HETZNER_USER;
const STORAGE_PASS = process.env.HETZNER_PASS;
const STORAGE_HOST = process.env.HETZNER_HOST;

if (!STORAGE_USER || !STORAGE_PASS || !STORAGE_HOST) {
    console.error("❌ Missing HETZNER_USER, HETZNER_PASS, or HETZNER_HOST in .env");
    process.exit(1);
}

async function listRoot() {
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');
    const url = `https://${STORAGE_HOST}/`; // Root

    console.log(`🔌 Conectando a ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` }
        });

        const root = parse(response.data);
        const links = root.querySelectorAll('a');

        console.log("\n📂 CARPETAS EN LA RAÍZ DEL SERVIDOR:");
        console.log("=====================================");

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href.includes('..') || href.includes('?')) continue;

            const decodedName = decodeURIComponent(href);
            if (decodedName.endsWith('/')) {
                console.log(`📁 ${decodedName}`);
            }
        }
        console.log("=====================================");

    } catch (error) {
        console.error("❌ Error de conexión:", error.message);
    }
}

listRoot();
