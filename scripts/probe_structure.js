import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const SFTP_HOST = process.env.HETZNER_HOST;
const SFTP_USER = process.env.HETZNER_USER;
const SFTP_PASS = process.env.HETZNER_PASS;
const SFTP_PORT = parseInt(process.env.HETZNER_PORT || '23', 10);

if (!SFTP_HOST || !SFTP_USER || !SFTP_PASS) {
    console.error("❌ Missing HETZNER_HOST, HETZNER_USER, or HETZNER_PASS in .env");
    process.exit(1);
}

const config = {
    host: SFTP_HOST,
    username: SFTP_USER,
    password: SFTP_PASS,
    port: SFTP_PORT,
};

const sftp = new Client();

async function probe() {
    try {
        console.log(`🔌 Conectando a ${config.host}...`);
        await sftp.connect(config);
        console.log("✅ Conectado!");

        console.log("📂 Listando raíz [.]...");
        const rootList = await sftp.list('.');

        // Filtrar solo directorios
        const folders = rootList.filter(item => item.type === 'd').map(f => f.name);

        console.log("\n--- ESTRUCTURA RAÍZ ---");
        folders.forEach(f => console.log(`📁 ${f}`));

        if (folders.includes('DJPACKS')) {
            console.log(`\n📂 Explorando profundidad de [ BOLICHERO 24 ]...`);
            // Ruta exacta sacada del DB check anterior
            const target = 'DJPACKS/2025/02 FEBRERO 2025/BOLICHERO 24 (ENERO 2025)';
            try {
                const subList = await sftp.list(target);
                console.log(`Contenido de ${target}:`);
                subList.forEach(f => console.log(`  [${f.type}] ${f.name}`));
            } catch (e) {
                console.error("Error leyendo target:", e.message);
            }
        } else {
            console.log("❌ No encontré carpeta DJPACKS");
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await sftp.end();
    }
}

probe();
