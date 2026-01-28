import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data } = await supabase.from('dj_tracks').select('pool_id').not('pool_id', 'in', '("DJPACKS","BEATPORT")');
    const counts = {};
    if (data) data.forEach(t => counts[t.pool_id] = (counts[t.pool_id] || 0) + 1);

    // Known good pools (PascalCase usually) from our script mapping
    const known = [
        '8th Wonder', 'Acapellas', 'All In One', 'America Remix', 'Beatfreakz', 'BeatJunkies', 'Bootlegs', 'BPM Supreme', 'BPM Latino',
        'California Remix', 'Club Killers', 'Crack 4 DJs', 'Crate Connect', 'Crooklyn Clan', 'Cuba Remix', 'Dale Mas Bajo',
        'Da Zone', 'DDP', 'DJ City', 'DMP', 'DMS', 'Doing The Damage', 'Elite Remix', 'Europa Remix', 'Extended Latino', 'FRP',
        'Heavy Hits', 'HMC', 'Hyperz', 'Instrumentals', 'Intensa', 'Jestei Pool', 'Just Play', 'Kuts', 'Latin Box', 'Latin Remixes',
        'Latin Throwback', 'Mixinit', 'MMP', 'MyMP3Pool', 'Platinum', 'PLR', 'Promo Only', 'Redrums', 'Remix Planet', 'RunderGround',
        'Spinback Promos', 'The Mash Up', 'Throwbacks', 'Transitions', 'Traxsource', 'Unlimited Latin', 'Xtendamix', 'ZipDJ',
        'Bangerz Army', 'BarBangerz'
    ];

    const suspicious = [];
    Object.keys(counts).forEach(p => {
        if (!known.includes(p)) suspicious.push({ pool: p, count: counts[p] });
    });

    console.log('=== POOLS NO RECONOCIDOS (POSIBLES SIN ASIGNAR/BAJA CALIDAD) ===');
    if (suspicious.length === 0) console.log('¡Ninguno! Todos coincide con la lista conocida.');
    else suspicious.sort((a, b) => b.count - a.count).forEach(x => console.log(`${x.pool}: ${x.count}`));

    console.log('\n=== TOP 20 POOLS VERIFICADOS ===');
    Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(x => console.log(`${x[0]}: ${x[1]}`));
}
run();
