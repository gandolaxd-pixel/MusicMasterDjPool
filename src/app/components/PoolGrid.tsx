import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Disc, ArrowLeft, Folder } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useCrate } from '../../context/CrateContext';
import { useAuth } from '../../context/AuthContext';
import { LatestUploads } from './LatestUploads';

interface SpecialNames {
    [key: string]: string;
}

const PoolGrid: React.FC = () => {
    // Navigation State
    const [view, setView] = useState<'brands' | 'years' | 'months' | 'folders' | 'tracks'>('brands');

    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null); // "Beatport 2025"
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    // Data State
    const [brandList, setBrandList] = useState<string[]>([]);
    const [yearList, setYearList] = useState<string[]>([]); // ["Beatport 2025", "Beatport 2026"]
    const [monthList, setMonthList] = useState<string[]>([]);
    const [folderList, setFolderList] = useState<string[]>([]);
    const [trackList, setTrackList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Context
    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const { crate, toggleCrate } = useCrate();
    const { user } = useAuth();

    const specialNames: SpecialNames = {
        "Beatport": "beatport.png",
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
        "BPM Supreme": "bpmsupreme.png",
        "DJ City": "djcity.png",
        "8th Wonder": "8thwonder.png",
        "Beat Junkies": "beatjunkies.png",
        "BPM Latino": "bpmlatino.png",
        "Club Killers": "clubkillers.png",
        "Crooklyn Clan": "crooklynclan.png",
        "Digital DJ Pool": "ddp.png",
        "DMS": "dms.png",
        "Direct Music Service": "dms.png",
        "Heavy Hits": "heavyhits.png",
        "Hyperz": "hyperz.png",
        "My Mp3 Pool": "mymp3pool.png",
        "Remix Planet": "remixplanet.png",
        "The Mash Up": "themashup.png",
        "Are You Kiddy": "areyoukidy.png",
        "DMP": "dmp.png"
    };

    useEffect(() => {
        if (view === 'brands') {
            const allPools = Object.keys(specialNames).sort();
            const unique = Array.from(new Set(allPools));
            setBrandList(unique);
        }
    }, [view]);

    // 1. FETCH YEARS
    useEffect(() => {
        if (view === 'years' && selectedBrand) {
            const fetchYears = async () => {
                setLoading(true);
                const searchTerm = selectedBrand.includes('Beatport') ? 'Beatport%' : `${selectedBrand}%`;

                const { data } = await supabase
                    .from('dj_tracks')
                    .select('pool_id')
                    .ilike('pool_id', searchTerm);

                if (data) {
                    const uniquePools = Array.from(new Set(data.map(item => item.pool_id).filter(Boolean)));
                    setYearList(uniquePools.sort().reverse());
                }
                setLoading(false);
            };
            fetchYears();
        }
    }, [view, selectedBrand]);

    // 2. FETCH MONTHS
    useEffect(() => {
        if (view === 'months' && selectedPoolId) {
            const fetchMonths = async () => {
                setLoading(true);
                const { data } = await supabase
                    .from('dj_tracks')
                    .select('original_folder')
                    .eq('pool_id', selectedPoolId);

                if (data) {
                    const months = new Set<string>();
                    data.forEach(item => {
                        if (item.original_folder) {
                            const parts = item.original_folder.split('/');
                            if (parts.length > 0 && parts[0]) {
                                months.add(parts[0].toUpperCase());
                            }
                        }
                    });

                    const monthOrder: { [key: string]: number } = {
                        'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4, 'MAY': 5, 'JUNE': 6,
                        'JULY': 7, 'AUGUST': 8, 'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
                    };

                    const sortedMonths = Array.from(months).sort((a, b) => {
                        const orderA = monthOrder[a] || 99;
                        const orderB = monthOrder[b] || 99;
                        if (orderA !== orderB) return orderA - orderB;
                        return a.localeCompare(b);
                    });

                    setMonthList(sortedMonths);
                }
                setLoading(false);
            };
            fetchMonths();
        }
    }, [view, selectedPoolId]);

    // 3. FETCH FOLDERS
    useEffect(() => {
        if (view === 'folders' && selectedPoolId && selectedMonth) {
            const fetchFolders = async () => {
                setLoading(true);
                const { data } = await supabase
                    .from('dj_tracks')
                    .select('original_folder')
                    .eq('pool_id', selectedPoolId)
                    .ilike('original_folder', `${selectedMonth}/%`);

                if (data) {
                    const uniqueFolders = new Set<string>();
                    data.forEach(item => {
                        if (item.original_folder) {
                            const part = item.original_folder.substring(selectedMonth.length + 1);
                            if (part) uniqueFolders.add(part);
                        }
                    });
                    setFolderList(Array.from(uniqueFolders).sort());
                }
                setLoading(false);
            };
            fetchFolders();
        }
    }, [view, selectedPoolId, selectedMonth]);

    // 4. FETCH TRACKS
    useEffect(() => {
        if (view === 'tracks' && selectedFolder && selectedPoolId && selectedMonth) {
            const fetchTracks = async () => {
                setLoading(true);
                const fullFolderPath = `${selectedMonth}/${selectedFolder}`;

                const { data } = await supabase
                    .from('dj_tracks')
                    .select('*')
                    .eq('pool_id', selectedPoolId)
                    .eq('original_folder', fullFolderPath)
                    .order('created_at', { ascending: false });

                if (data) {
                    const mapped = data.map((item: any) => ({
                        ...item,
                        pool_origin: item.pool_id,
                        file_path: item.server_path,
                        title: item.title || item.name,
                    }));

                    setTrackList(mapped);
                }
                setLoading(false);
            };
            fetchTracks();
        }
    }, [view, selectedFolder, selectedPoolId, selectedMonth]);

    // --- NAVIGATION HANDLERS ---

    const handleBrandClick = (brand: string) => {
        setSelectedBrand(brand);
        if (brand.toLowerCase().includes('beatport')) {
            setView('years');
        } else {
            setView('years');
        }
    };

    const handleBack = () => {
        if (view === 'tracks') setView('folders');
        else if (view === 'folders') setView('months');
        else if (view === 'months') setView('years');
        else if (view === 'years') setView('brands');
    };

    // --- RENDERERS ---



    if (view === 'brands') {
        return (
            <div className="pt-10">
                <div className="flex justify-between items-end mb-8 px-4">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        Select <span className="text-[#ff0055]">Pool</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {brandList.map((name) => {
                        // Skip legacy "Beatport New Releases"
                        if (name === 'Beatport New Releases') return null;

                        const imageName = specialNames[name] || `${name.toLowerCase().replace(/\s/g, '')}.png`;
                        const imagePath = `/pools/${imageName}`;
                        const isFullCover = name === "Bangerz Army";

                        return (
                            <button
                                key={name}
                                onClick={() => handleBrandClick(name)}
                                className="group aspect-square bg-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-500 hover:border-[#ff0055] hover:shadow-[0_0_35px_rgba(255,0,85,0.35)]"
                            >
                                <img
                                    src={imagePath}
                                    alt={name}
                                    className={`w-full h-full transition-all duration-500 opacity-70 group-hover:opacity-100 group-hover:scale-110 ${isFullCover ? 'object-cover' : 'object-contain p-5'}`}
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
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pt-10 pb-20">
            {/* Common Header for Inner Views */}
            <div className="flex items-center justify-between gap-4 px-4">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-3 rounded-full border border-white/10 hover:bg-[#ff0055] hover:border-[#ff0055] transition-all group shadow-2xl">
                        <ArrowLeft size={20} className="group-hover:scale-110 text-white" />
                    </button>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                        {view === 'years' && <><span className="text-[#ff0055]">{selectedBrand}</span> Collections</>}
                        {view === 'months' && <><span className="text-[#ff0055]">{selectedPoolId}</span> Archives</>}
                        {view === 'folders' && <><span className="text-[#ff0055]">{selectedMonth}</span> Folders</>}
                        {view === 'tracks' && <><span className="text-[#ff0055]">{selectedFolder}</span> Tracks</>}
                    </h2>
                </div>

            </div>

            {/* YEARS VIEW */}
            {view === 'years' && (
                <div className="flex flex-col gap-2 px-4">
                    {loading ? (
                        <div className="py-20 text-center text-gray-600 font-black text-[10px] uppercase animate-pulse tracking-widest">Loading...</div>
                    ) : yearList.map((yearPool) => (
                        <div
                            key={yearPool}
                            onClick={() => { setSelectedPoolId(yearPool); setView('months'); }}
                            className="group flex items-center justify-between bg-[#0a0a0a] border-l-4 border-white/5 p-4 rounded-xl cursor-pointer hover:border-[#ff0055]/50 hover:bg-[#121212] transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 transition-colors text-gray-600 group-hover:text-[#ff0055]">
                                    <Folder size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white uppercase truncate max-w-[200px] md:max-w-md">{yearPool}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-[#ff0055] uppercase tracking-widest">year</span>
                                        <span className="w-1 h-1 bg-gray-800 rounded-full" />
                                        <span className="text-[9px] font-bold text-gray-600 uppercase">{yearPool.includes('20') ? 'Annual Collection' : 'Pool Archive'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 text-gray-800 group-hover:text-[#ff0055] transition-colors"><Folder size={18} /></div>
                        </div>
                    ))}
                    {!loading && yearList.length === 0 && <p className="text-gray-500">No collections found.</p>}
                </div>
            )}

            {/* MONTHS VIEW */}
            {view === 'months' && (
                <div className="flex flex-col gap-2 px-4">
                    {loading ? (
                        <div className="py-20 text-center text-gray-600 font-black text-[10px] uppercase animate-pulse tracking-widest">Loading months...</div>
                    ) : monthList.map((month) => (
                        <div
                            key={month}
                            onClick={() => { setSelectedMonth(month); setView('folders'); }}
                            className="group flex items-center justify-between bg-[#0a0a0a] border-l-4 border-white/5 p-4 rounded-xl cursor-pointer hover:border-[#ff0055]/50 hover:bg-[#121212] transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 transition-colors text-gray-600 group-hover:text-[#ff0055]">
                                    <Folder size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white uppercase truncate max-w-[200px] md:max-w-md">{month}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-[#ff0055] uppercase tracking-widest">month</span>
                                        <span className="w-1 h-1 bg-gray-800 rounded-full" />
                                        <span className="text-[9px] font-bold text-gray-600 uppercase">Library Folder</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 text-gray-800 group-hover:text-[#ff0055] transition-colors"><Folder size={18} /></div>
                        </div>
                    ))}
                    {!loading && monthList.length === 0 && <p className="text-gray-500">No months found (Running reorganization...).</p>}
                </div>
            )}

            {/* FOLDERS VIEW */}
            {view === 'folders' && (
                <div className="flex flex-col gap-2 px-4">
                    {loading ? (
                        <div className="py-20 text-center text-gray-600 font-black text-[10px] uppercase animate-pulse tracking-widest">Loading folders...</div>
                    ) : folderList.map((folder) => (
                        <div
                            key={folder}
                            onClick={() => { setSelectedFolder(folder); setView('tracks'); }}
                            className="group flex items-center justify-between bg-[#0a0a0a] border-l-4 border-white/5 p-4 rounded-xl cursor-pointer hover:border-[#ff0055]/50 hover:bg-[#121212] transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 transition-colors text-[#ff0055] group-hover:bg-[#ff0055]/10">
                                    <Disc size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white uppercase truncate max-w-[200px] md:max-w-md">{folder}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-[#ff0055] uppercase tracking-widest">pack</span>
                                        <span className="w-1 h-1 bg-gray-800 rounded-full" />
                                        <span className="text-[9px] font-bold text-gray-600 uppercase">{selectedMonth}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 text-gray-800 group-hover:text-[#ff0055] transition-colors"><Folder size={18} /></div>
                        </div>
                    ))}
                </div>
            )}

            {/* TRACKS VIEW */}
            {view === 'tracks' && (
                <div className="px-4">
                    {loading ? (
                        <div className="text-white">Loading tracks...</div>
                    ) : (
                        <LatestUploads
                            tracks={trackList}
                            selectedGenre={null}
                            onGenreSelect={() => { }}
                            user={user}
                            onPlay={playTrack}
                            currentTrack={currentTrack}
                            isPlaying={isPlaying}
                            onToggleCrate={toggleCrate}
                            crate={crate}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default PoolGrid;
