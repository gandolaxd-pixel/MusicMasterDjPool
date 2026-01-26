import Client from 'ssh2-sftp-client';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// 1. CONFIGURACIÓN
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
// Nota: Para escribir en BD necesitamos la SERVICE_ROLE_KEY si las RLS están activas. 
// Asumiremos que ANON_KEY tiene permisos o el usuario proveerá la SERVICE_KEY en .env
// Por seguridad en frontend projects suele estar solo la ANON. 
// Si falla, pediremos la SERVICE_KEY.

const SFTP_CONFIG = {
    host: "u529624-sub1.your-storagebox.de",
    username: "u529624-sub1",
    password: "Gandola2026!",
    port: 23,
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
});

const sftp = new Client();

async function syncPacks() {
    try {
        console.log("🔌 Conectando a SFTP...");
        await sftp.connect(SFTP_CONFIG);
        console.log("✅ Conectado a SFTP");

        console.log("📂 Iniciando escaneo de [ DJPACKS ]...");

        // Nivel 1: Años (2025, 2026)
        const years = (await sftp.list('DJPACKS')).filter(i => i.type === 'd').map(i => i.name);

        for (const year of years) {
            console.log(`\n📅 Procesando Año: ${year}`);

            // Nivel 2: Meses
            const yearPath = `DJPACKS/${year}`;
            const months = (await sftp.list(yearPath)).filter(i => i.type === 'd').map(i => i.name);

            for (const month of months) {
                console.log(`  📅 Mes: ${month}`);

                // Nivel 3: Packs (Carpetas reales)
                const monthPath = `${yearPath}/${month}`;
                const packs = (await sftp.list(monthPath)).filter(i => i.type === 'd').map(i => i.name);

                for (const packName of packs) {
                    const packPath = `${monthPath}/${packName}`;
                    console.log(`    📦 Sincronizando Pack: ${packName}`);

                    // 1. Insertar Pack (Comprobando existencia manual para evitar error de constraint)
                    // 1. Insertar Pack (Comprobando existencia manual para evitar error de constraint)
                    const originalFolder = `/${year}/${month}/${packName}`;
                    const packRecord = {
                        name: packName,
                        title: packName, // Fixed: Added title
                        original_folder: originalFolder,
                        server_path: `/${packPath}`,
                        format: 'pack',
                        created_at: new Date().toISOString()
                    };

                    // Check if exists
                    const { data: existingPack } = await supabase.from('dj_tracks').select('id').eq('original_folder', originalFolder).maybeSingle();

                    if (!existingPack) {
                        const { error: packErr } = await supabase.from('dj_tracks').insert(packRecord);
                        if (packErr) console.error("Error insertando Pack:", packErr.message);
                    }

                    // 2. Listar canciones dentro del Pack (RECURSIVO)
                    // Función helper para obtener archivos recursivamente
                    async function getFilesResursive(dirPath) {
                        let allFiles = [];
                        try {
                            const items = await sftp.list(dirPath);
                            for (const item of items) {
                                const itemPath = `${dirPath}/${item.name}`;
                                if (item.type === '-') {
                                    allFiles.push({ ...item, fullPath: itemPath });
                                } else if (item.type === 'd') {
                                    // Recursión para subcarpetas
                                    const subFiles = await getFilesResursive(itemPath);
                                    allFiles = allFiles.concat(subFiles);
                                }
                            }
                        } catch (e) { console.error(`Error leyendo ${dirPath}:`, e.message); }
                        return allFiles;
                    }

                    const files = await getFilesResursive(packPath);

                    if (files.length > 0) {
                        // Traer todos los server_paths existentes de este pack de una vez
                        const { data: existingFiles } = await supabase
                            .from('dj_tracks')
                            .select('server_path')
                            .eq('original_folder', originalFolder);

                        const existingPaths = new Set(existingFiles ? existingFiles.map(f => f.server_path) : []);

                        // Insertar en lotes de 100 para no saturar
                        const newTracks = files
                            .map(f => ({
                                name: f.name,
                                title: f.name,
                                original_folder: originalFolder,
                                server_path: `/${f.fullPath}`, // Ruta completa vps
                                format: 'file',
                                created_at: new Date().toISOString()
                            }))
                            .filter(t => !existingPaths.has(t.server_path));

                        if (newTracks.length > 0) {
                            // Chunking
                            const chunkSize = 100;
                            for (let i = 0; i < newTracks.length; i += chunkSize) {
                                const chunk = newTracks.slice(i, i + chunkSize);
                                const { error: trackErr } = await supabase.from('dj_tracks').insert(chunk);
                                if (trackErr) console.error("Error insertando chunk:", trackErr.message);
                            }
                            console.log(`      ✅ ${newTracks.length} nuevas canciones guardadas (incluyendo subcarpetas).`);
                        } else {
                            // console.log(`      ⏩ ${files.length} canciones ya estaban sincronizadas.`);
                        }
                    }
                }
            }
        }

    } catch (e) {
        console.error("❌ Error Fatal:", e);
    } finally {
        await sftp.end();
        console.log("👋 Sincronización finalizada.");
    }
}

syncPacks();
