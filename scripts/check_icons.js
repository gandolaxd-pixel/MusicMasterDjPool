import fs from 'fs';

const files = fs.readdirSync('public/pools').map(f => f.toLowerCase().replace('.png', '').replace(/-/g, '').replace(/_/g, '').replace(/ /g, ''));
const activePools = [
    '8th Wonder', 'Acapellas', 'All In One', 'America Remix', 'Beatfreakz', 'BeatJunkies', 'Bootlegs', 'BPM Supreme', 'BPM Latino', 'California Remix', 'Club Killers', 'Crack 4 DJs', 'Crate Connect', 'Crooklyn Clan', 'Cuba Remix', 'Dale Mas Bajo', 'Da Zone', 'DDP', 'DJ City', 'DMP', 'DMS', 'Doing The Damage', 'Elite Remix', 'Europa Remix', 'Extended Latino', 'FRP', 'Heavy Hits', 'HMC', 'Hyperz', 'Instrumentals', 'Intensa', 'Jestei Pool', 'Just Play', 'Kuts', 'Latin Box', 'Latin Remixes', 'Latin Throwback', 'Mixinit', 'MMP', 'MyMP3Pool', 'Platinum', 'PLR', 'Promo Only', 'Redrums', 'Remix Planet', 'RunderGround', 'Spinback Promos', 'The Mash Up', 'Throwbacks', 'Transitions', 'Traxsource', 'Unlimited Latin', 'Xtendamix', 'ZipDJ', 'Bangerz Army', 'BarBangerz'
];

console.log('=== ICONOS FALTANTES ===');

// Manual overrides from PoolGrid.tsx
const overrides = {
    'Bootlegs': 'bootleg',
    'Promo Only': 'promoonly',
    'Spinback Promos': 'spinbackpromos',
    'Latin Throwback': 'latinthrowback',
    'Redrums': 'redrum'
};

activePools.forEach(pool => {
    let normalized = pool.toLowerCase().replace(/-/g, '').replace(/_/g, '').replace(/ /g, '');

    // Check override
    if (overrides[pool]) {
        normalized = overrides[pool];
    }

    const exists = files.includes(normalized) || files.some(f => f.includes(normalized));
    if (!exists) {
        console.log(`- ${pool} (se necesita: ${normalized}.png)`);
    }
});
