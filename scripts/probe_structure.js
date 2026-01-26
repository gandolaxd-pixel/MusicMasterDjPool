import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno si existen, sino usar las que vimos en server.js
// Para este script de prueba usaremos las credenciales directas para asegurar conexión rápida
const config = {
    host: "u529624-sub1.your-storagebox.de",
    username: "u529624-sub1",
    password: "Gandola2026!",
    port: 23, // Hetzner Storage Box suele usar puerto 23 para SFTP o 22. Probaremos 23 primero.
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
