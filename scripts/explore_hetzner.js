// Script para explorar estructura de Beatport 2025 en Hetzner
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

async function listFolder(folderPath) {
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');
    const url = `https://${STORAGE_HOST}${folderPath}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` },
            timeout: 20000
        });

        const html = response.data;
        const root = parse(html);
        const links = root.querySelectorAll('a');

        const items = [];
        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href.includes('..') || href.includes('?')) continue;
            items.push(decodeURIComponent(href));
        }

        return items;
    } catch (error) {
        console.error(`Error listando ${folderPath}:`, error.message);
        return [];
    }
}

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║           📂 EXPLORANDO ESTRUCTURA EN HETZNER                      ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    // Primero listar la raíz
    console.log('📂 Carpetas en la raíz del Storage Box:\n');
    const rootItems = await listFolder('/');

    rootItems.forEach(item => {
        if (item.endsWith('/')) {
            console.log(`   📁 ${item}`);
        }
    });

    // Buscar carpeta Beatport
    const beatportFolder = rootItems.find(item =>
        item.toLowerCase().includes('beatport') && item.endsWith('/')
    );

    if (beatportFolder) {
        console.log(`\n\n📂 Contenido de ${beatportFolder}:\n`);
        const beatportPath = beatportFolder.startsWith('/') ? beatportFolder : '/' + beatportFolder;
        const beatportItems = await listFolder(beatportPath.replace(/\/$/, ''));

        beatportItems.forEach(item => {
            console.log(`   ${item.endsWith('/') ? '📁' : '🎵'} ${item}`);
        });

        // Si hay subcarpetas, explorar la primera
        const subfolders = beatportItems.filter(i => i.endsWith('/'));
        if (subfolders.length > 0) {
            console.log(`\n📂 Primera subcarpeta (${subfolders[0]}):\n`);
            const subPath = `${beatportPath}${subfolders[0]}`.replace(/\/+/g, '/').replace(/\/$/, '');
            const subItems = await listFolder(subPath);
            subItems.slice(0, 10).forEach(item => {
                console.log(`   ${item.endsWith('/') ? '📁' : '🎵'} ${item}`);
            });
            if (subItems.length > 10) {
                console.log(`   ... y ${subItems.length - 10} más`);
            }
        }
    } else {
        console.log('\n⚠️  No se encontró carpeta Beatport en la raíz.');
        console.log('Carpetas disponibles:');
        rootItems.filter(i => i.endsWith('/')).forEach(i => console.log(`   - ${i}`));
    }

    console.log('\n');
}

main();
