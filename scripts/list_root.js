import axios from 'axios';
import { parse } from 'node-html-parser';

const STORAGE_USER = 'u529624-sub1';
const STORAGE_PASS = 'Gandola2026!';
const STORAGE_HOST = 'u529624-sub1.your-storagebox.de';

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
