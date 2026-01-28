#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing SUPABASE credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debug() {
    console.log('\n=== DEBUG RETRO VAULT ===\n');

    // 1. Ver estructura de dj_folders para RETRO VAULT
    console.log('1. dj_folders con parent_path que contiene "RETRO" o "80":');
    const { data: folders1 } = await supabase
        .from('dj_folders')
        .select('*')
        .ilike('parent_path', '%RETRO%')
        .limit(20);
    console.log(JSON.stringify(folders1, null, 2));

    console.log('\n2. dj_folders con parent_path que contiene "80S":');
    const { data: folders2 } = await supabase
        .from('dj_folders')
        .select('*')
        .ilike('parent_path', '%80S%')
        .limit(20);
    console.log(JSON.stringify(folders2, null, 2));

    // 2. Ver tracks de RETRO_VAULT
    console.log('\n3. Primeros 10 tracks de RETRO_VAULT:');
    const { data: tracks } = await supabase
        .from('dj_tracks')
        .select('id, name, server_path, pool_id, original_folder')
        .eq('pool_id', 'RETRO_VAULT')
        .limit(10);
    console.log(JSON.stringify(tracks, null, 2));

    // 3. Buscar tracks con "1000" en server_path
    console.log('\n4. Tracks con "1000" en server_path (RETRO_VAULT):');
    const { data: tracks1000 } = await supabase
        .from('dj_tracks')
        .select('id, name, server_path, pool_id')
        .eq('pool_id', 'RETRO_VAULT')
        .ilike('server_path', '%1000%')
        .limit(10);
    console.log(JSON.stringify(tracks1000, null, 2));

    // 4. Contar total de tracks RETRO_VAULT
    const { count } = await supabase
        .from('dj_tracks')
        .select('*', { count: 'exact', head: true })
        .eq('pool_id', 'RETRO_VAULT');
    console.log('\n5. Total tracks RETRO_VAULT:', count);

    // 5. Ver todos los pool_id únicos
    console.log('\n6. Pool IDs únicos en dj_tracks:');
    const { data: pools } = await supabase
        .from('dj_tracks')
        .select('pool_id')
        .limit(1000);
    const uniquePools = [...new Set(pools?.map(p => p.pool_id))];
    console.log(uniquePools);
}

debug().catch(console.error);
