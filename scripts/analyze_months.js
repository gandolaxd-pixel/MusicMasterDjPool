// Ver distribución de meses importados
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log('\n📊 DISTRIBUCIÓN DE MONTHS EN dj_tracks\n');

    // Obtener todos los original_folder
    let allFolders = [];
    let offset = 0;
    const batchSize = 1000;

    while (offset < 70000) {
        const { data } = await supabase
            .from('dj_tracks')
            .select('original_folder, server_path')
            .range(offset, offset + batchSize - 1);

        if (!data || data.length === 0) break;
        allFolders = allFolders.concat(data);
        offset += batchSize;
    }

    console.log(`Total registros analizados: ${allFolders.length.toLocaleString()}\n`);

    // Analizar por MES (primer nivel de original_folder)
    const monthCounts = {};
    allFolders.forEach(d => {
        if (d.original_folder) {
            const parts = d.original_folder.split('/').filter(Boolean);
            const month = parts[0] || 'UNKNOWN';
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
    });

    console.log('📁 Por MES (original_folder nivel 1):');
    Object.entries(monthCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([month, count]) => {
            console.log(`   ${month.padEnd(25)} ${count.toLocaleString().padStart(8)} tracks`);
        });

    // Analizar por server_path para ver estructura real
    const pathPatterns = {};
    allFolders.forEach(d => {
        if (d.server_path) {
            // Extraer /BEATPORT2025/MONTHS/MES
            const match = d.server_path.match(/\/BEATPORT2025\/MONTHS\/([^/]+)/);
            if (match) {
                const month = match[1];
                pathPatterns[month] = (pathPatterns[month] || 0) + 1;
            } else if (d.server_path.includes('BEATPORT COLLECTION')) {
                pathPatterns['BEATPORT COLLECTIONS'] = (pathPatterns['BEATPORT COLLECTIONS'] || 0) + 1;
            }
        }
    });

    console.log('\n📁 Por MONTHS en server_path:');
    Object.entries(pathPatterns)
        .sort((a, b) => b[1] - a[1])
        .forEach(([pattern, count]) => {
            console.log(`   ${pattern.padEnd(30)} ${count.toLocaleString().padStart(8)} tracks`);
        });
}

main();
