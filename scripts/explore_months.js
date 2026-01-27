// Explorar MONTHS en detalle
import axios from 'axios';
import { parse } from 'node-html-parser';
import dotenv from 'dotenv';

dotenv.config();

const STORAGE_USER = process.env.HETZNER_USER;
const STORAGE_PASS = process.env.HETZNER_PASS;
const STORAGE_HOST = process.env.HETZNER_HOST;

async function listFolder(folderPath) {
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');
    const url = `https://${STORAGE_HOST}${folderPath}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` },
            timeout: 20000
        });

        const root = parse(response.data);
        const links = root.querySelectorAll('a');

        const items = [];
        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href.includes('..') || href.includes('?')) continue;
            items.push(decodeURIComponent(href));
        }
        return items;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

async function main() {
    console.log('\n📂 Explorando /BEATPORT2025/MONTHS/\n');

    const months = await listFolder('/BEATPORT2025/MONTHS');
    console.log('Meses encontrados:');
    months.filter(m => m.endsWith('/')).forEach(m => console.log(`   📁 ${m}`));

    // Explorar primer mes
    const firstMonth = months.find(m => m.endsWith('/') && !m.startsWith('/'));
    if (firstMonth) {
        console.log(`\n📂 Contenido de MONTHS/${firstMonth}:\n`);
        const monthItems = await listFolder(`/BEATPORT2025/MONTHS/${firstMonth.replace(/\/$/, '')}`);
        monthItems.slice(0, 15).forEach(item => {
            console.log(`   ${item.endsWith('/') ? '📁' : '🎵'} ${item}`);
        });
        if (monthItems.length > 15) console.log(`   ... y ${monthItems.length - 15} más`);
    }

    console.log('\n📂 Explorando /BEATPORT2025/BEATPORT COLLECTION AND CHARTS/\n');
    const charts = await listFolder('/BEATPORT2025/BEATPORT COLLECTION AND CHARTS');
    charts.filter(c => c.endsWith('/')).slice(0, 10).forEach(c => console.log(`   📁 ${c}`));
    if (charts.filter(c => c.endsWith('/')).length > 10) {
        console.log(`   ... y ${charts.filter(c => c.endsWith('/')).length - 10} carpetas más`);
    }
}

main();
