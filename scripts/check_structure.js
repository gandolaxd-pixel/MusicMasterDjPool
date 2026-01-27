// Script para verificar estructura de los datos importados
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log('\n📊 ESTRUCTURA DE DATOS IMPORTADOS\n');

    // Ver ejemplos de registros
    const { data: samples } = await supabase
        .from('dj_tracks')
        .select('*')
        .limit(5);

    if (samples && samples.length > 0) {
        console.log('📄 Ejemplo de registro:\n');
        const sample = samples[0];
        console.log('Campos del registro:');
        Object.keys(sample).forEach(key => {
            console.log(`   ${key}: ${sample[key]}`);
        });
    }

    // Ver valores únicos de format
    const { data: formats } = await supabase
        .from('dj_tracks')
        .select('format')
        .limit(1000);

    const uniqueFormats = [...new Set(formats?.map(f => f.format))];
    console.log('\n📁 Valores únicos de "format":');
    uniqueFormats.forEach(f => console.log(`   - ${f}`));

    // Ver estructura de server_path
    const { data: paths } = await supabase
        .from('dj_tracks')
        .select('server_path')
        .limit(100);

    console.log('\n📁 Ejemplos de server_path:');
    paths?.slice(0, 10).forEach(p => console.log(`   ${p.server_path?.substring(0, 80)}...`));
}

main();
