// Script para verificar y eliminar tracks de Beatport 2025
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🔍 Buscando tracks de Beatport 2025...\n');

    // Primero, veamos qué patrones de carpeta tenemos para Beatport
    const { data: samples, error: sampleError } = await supabase
        .from('tracks')
        .select('folder, file_path')
        .ilike('folder', '%beatport%')
        .limit(10);

    if (sampleError) {
        console.error('Error:', sampleError.message);
        return;
    }

    console.log('📁 Ejemplos de carpetas Beatport encontradas:');
    samples?.forEach(s => console.log('  -', s.folder));

    // Contar totales por patrón
    console.log('\n📊 Contando registros...\n');

    // Beatport 2025
    const { count: countBeatport2025 } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .ilike('folder', '%beatport%2025%');

    console.log(`🎵 Beatport 2025: ${countBeatport2025 || 0} tracks`);

    // Beatport general
    const { count: countBeatportTotal } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .ilike('folder', '%beatport%');

    console.log(`🎵 Beatport Total: ${countBeatportTotal || 0} tracks`);

    // También buscar en file_path por si el folder no tiene el año
    const { count: countByPath } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .ilike('file_path', '%beatport%2025%');

    console.log(`🎵 Beatport 2025 (por file_path): ${countByPath || 0} tracks`);

    console.log('\n✅ Script de verificación completado.');
    console.log('Para eliminar, ejecuta: node scripts/delete_beatport_2025.js --delete');
}

main();
