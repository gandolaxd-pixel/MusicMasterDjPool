import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
    'https://mnfcbeasyebrgxhfitiv.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZmNiZWFzeWVicmd4aGZpdGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjYyNTYsImV4cCI6MjA4NDAwMjI1Nn0.a7bHJtuGUMSQkEJXKwN43v9s97t384NUrEMBD49trA8'
);

async function importData() {
    try {
        const rawData = JSON.parse(fs.readFileSync('./rutas_reales_djpacks.json', 'utf8'));
        console.log(`🚀 Iniciando importación masiva de ${rawData.length} canciones...`);

        const tracksToInsert = rawData.map(item => {
            const publicUrl = `https://u529624-sub1.your-storagebox.de${item.full_path}`;
            
            return {
                name: item.name,
                title: item.name,
                server_path: item.full_path,
                file_url: publicUrl, // ✅ Soluciona la restricción de file_url
                original_folder: item.folder.replace(/^\/DJPACKS\//, ''), 
                format: 'file',
                pool_id: 'DJPACKS',
                drop_month: '2026-01',
                drop_day: '19' 
            };
        });

        const BATCH_SIZE = 500;
        for (let i = 0; i < tracksToInsert.length; i += BATCH_SIZE) {
            const batch = tracksToInsert.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('dj_tracks').insert(batch);
            
            if (error) {
                console.error(`❌ Error en lote iniciando en ${i}:`, error.message);
            } else {
                const progress = Math.min(i + BATCH_SIZE, tracksToInsert.length);
                console.log(`✅ Progreso: ${progress} / ${rawData.length} completados.`);
            }
        }

        console.log("🏁 ¡Importación terminada con éxito!");

    } catch (err) {
        console.error("❌ Error crítico:", err.message);
    }
}

importData();