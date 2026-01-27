// Script para eliminar dj_tracks en lotes más pequeños
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log('\n🗑️  Eliminando dj_tracks en lotes pequeños...\n');

    let totalDeleted = 0;
    let attempts = 0;
    const maxAttempts = 200; // Evitar loop infinito

    while (attempts < maxAttempts) {
        attempts++;

        // Obtener un lote pequeño de IDs
        const { data, error: fetchError } = await supabase
            .from('dj_tracks')
            .select('id')
            .limit(500);

        if (fetchError) {
            console.log(`Error obteniendo: ${fetchError.message}`);
            break;
        }

        if (!data || data.length === 0) {
            console.log('\n✅ No quedan más registros');
            break;
        }

        const ids = data.map(r => r.id);

        // Eliminar este lote
        const { error: delError } = await supabase
            .from('dj_tracks')
            .delete()
            .in('id', ids);

        if (delError) {
            console.log(`Error eliminando lote: ${delError.message}`);
            // Intentar de a uno
            for (const id of ids) {
                await supabase.from('dj_tracks').delete().eq('id', id);
                totalDeleted++;
            }
        } else {
            totalDeleted += ids.length;
        }

        process.stdout.write(`   Eliminados: ${totalDeleted.toLocaleString()} registros (intento ${attempts})...\r`);
    }

    // Verificar
    const { count } = await supabase
        .from('dj_tracks')
        .select('*', { count: 'exact', head: true });

    console.log(`\n\n📊 Estado final de dj_tracks: ${(count || 0).toLocaleString()} registros restantes`);

    if ((count || 0) === 0) {
        console.log('\n✅ TABLA dj_tracks COMPLETAMENTE VACIADA\n');
    } else {
        console.log(`\n⚠️  Quedan ${count} registros. Ejecuta el script de nuevo si es necesario.\n`);
    }
}

main();
