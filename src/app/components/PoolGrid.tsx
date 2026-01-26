import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Disc, ArrowLeft } from 'lucide-react';

interface SpecialNames {
    [key: string]: string;
}

interface DateItem {
    drop_month: string;
    drop_day: number;
}

interface DjTrack {
    pool_id: string;
    format: string;
    drop_month: string;
    drop_day: number;
}

const PoolGrid: React.FC = () => {
    const [view, setView] = useState<'brands' | 'dates'>('brands');
    const [selectedPool, setSelectedPool] = useState<string | null>(null);
    const [brandList, setBrandList] = useState<string[]>([]);
    const [availableDates, setAvailableDates] = useState<DateItem[]>([]);
    const [loading, setLoading] = useState(false);

    const specialNames: SpecialNames = {
        "Beatport New Releases": "beatport.png",
        "Transitions": "Transitions.png",
        "Bootlegs": "bootleg.png",
        "Crate Connect": "crate-connect.png",
        "Cuba Remix": "cubaremixes.png",
        "Redrums": "redrum.png",
        "Spin Back Promos": "spinback-promos.png",
        "Bangerz Army": "bangerzarmy.png",
        "Crack 4 DJs": "Crack4DJS.png",
        "Da Throwbackz": "Throwbacks.png",
        "FRP": "FRP.png",
        "HMC": "HMC.png",
        "Kuts": "KUTS.png",
        "MMP": "MMP.png",
        "Platinum Pool": "POOL_Platinum.png",
        "Traxsource New Releases": "traxsource.png",
        "Unlimited Latin": "UnlimitedLatin.png",
        "Latin Throwback": "latin throwback.png",
        "Latin Remixes": "latinremixes.png",
        "Cuban Pool": "Cuban-Pool.png",
        "Dale Mas Bajo": "Dale-Mas-Bajo.png",
        "Elite Remix": "Elite-Remix.png",
        "BPM Supreme": "bpm-supreme.png",
        "DJ City": "dj-city.png"
    };

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('dj_tracks')
                    .select('pool_id')
                    .eq('format', 'pool');

                if (!error && data) {
                    const uniqueBrands = [...new Set(data.map((item: { pool_id: string }) => item.pool_id))];
                    const filteredBrands = uniqueBrands.filter(name =>
                        name && Object.keys(specialNames).includes(name)
                    );
                    setBrandList(filteredBrands.sort());
                }
            } catch (err) {
                console.error("Error fetching brands:", err);
            }
            setLoading(false);
        };
        if (view === 'brands') fetchBrands();
    }, [view]);

    useEffect(() => {
        if (view === 'dates' && selectedPool) {
            const fetchDates = async () => {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('dj_tracks')
                        .select('drop_month, drop_day')
                        .eq('pool_id', selectedPool)
                        .eq('format', 'pool')
                        .order('drop_day', { ascending: false });

                    if (!error && data) {
                        const uniqueDates: DateItem[] = data.filter((v: DateItem, i: number, a: DateItem[]) =>
                            a.findIndex(t => (t.drop_day === v.drop_day && t.drop_month === v.drop_month)) === i
                        );
                        setAvailableDates(uniqueDates);
                    }
                } catch (err) {
                    console.error("Error fetching dates:", err);
                }
                setLoading(false);
            };
            fetchDates();
        }
    }, [view, selectedPool]);

    if (view === 'brands') {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-10">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#ff0055]"></div>
                    </div>
                ) : (
                    brandList.map((name) => {
                        if (!name) return null;
                        const imageName = specialNames[name] || `${name.toLowerCase().replace(/\s/g, '')}.png`;
                        const imagePath = `/pools/${imageName}`;
                        const isFullCover = name === "Bangerz Army";

                        return (
                            <button
                                key={name}
                                onClick={() => { setSelectedPool(name); setView('dates'); }}
                                className="group aspect-square bg-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-500 hover:border-[#ff0055] hover:shadow-[0_0_35px_rgba(255,0,85,0.35)]"
                            >
                                <img
                                    src={imagePath}
                                    alt={name}
                                    className={`w-full h-full transition-all duration-500 opacity-70 group-hover:opacity-100 group-hover:scale-110 ${isFullCover ? 'object-cover' : 'object-contain p-5'
                                        }`}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                                <div style={{ display: 'none' }} className="flex-col items-center justify-center p-4 text-center">
                                    <Disc size={30} className="mx-auto mb-2 text-[#ff0055] opacity-40 group-hover:opacity-100" />
                                    <span className="text-[10px] font-bold uppercase block leading-tight text-gray-400 group-hover:text-white">{name}</span>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pt-10">
            <div className="flex items-center gap-4">
                <button onClick={() => setView('brands')} className="p-3 rounded-full border border-white/10 hover:bg-[#ff0055] hover:border-[#ff0055] transition-all group shadow-2xl">
                    <ArrowLeft size={20} className="group-hover:scale-110 text-white" />
                </button>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    <span className="text-[#ff0055]">{selectedPool}</span> Drops
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {availableDates.map((date, i) => (
                    <div key={i} className="group h-32 bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:border-[#ff0055] hover:shadow-[0_0_25px_rgba(255,0,85,0.2)] hover:scale-105 cursor-pointer">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{date.drop_month}</span>
                        <span className="text-4xl font-black text-white group-hover:text-[#ff0055] transition-colors">{date.drop_day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PoolGrid;
