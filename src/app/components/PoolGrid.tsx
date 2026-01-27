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
        "Beatport": "beatport.png", // Simplified Key
        "Beatport New Releases": "beatport.png", // Legacy Key
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
            // Filter duplicates/legacy if needed, or just show unique keys
            const unique = Array.from(new Set(allPools));
            setBrandList(unique);
        }
    }, [view]);

    // 1. FETCH YEARS (POOL_IDs)
    useEffect(() => {
        if (view === 'years' && selectedBrand) {
            const fetchYears = async () => {
                setLoading(true);
                // Search for pools matching the brand (e.g. "Beatport%")
                // If brand is "Beatport", look for "Beatport 2025", "Beatport 2026"
                const searchTerm = selectedBrand.includes('Beatport') ? 'Beatport%' : `${selectedBrand}%`;

                const { data } = await supabase
                    .from('dj_tracks')
                    .select('pool_id')
                    .ilike('pool_id', searchTerm);

                if (data) {
                    // Extract unique pool_ids
                    const uniquePools = Array.from(new Set(data.map(item => item.pool_id).filter(Boolean)));
                    setYearList(uniquePools.sort().reverse());
                }
                setLoading(false);
            };
            fetchYears();
        }
    }, [view, selectedBrand]);

    // 2. FETCH MONTHS (New Level)
    useEffect(() => {
        if (view === 'months' && selectedPoolId) {
            const fetchMonths = async () => {
                setLoading(true);
                // Fetch all original_folder values for this pool
                const { data } = await supabase
                    .from('dj_tracks')
                    .select('original_folder')
                    .eq('pool_id', selectedPoolId);

                if (data) {
                    // Extract Month part (Prefix before first slash)
                    // Format: "DECEMBER/Folder Name"
                    const months = new Set<string>();
                    data.forEach(item => {
                        if (item.original_folder) {
                            const parts = item.original_folder.split('/');
                            if (parts.length > 0 && parts[0]) {
                                months.add(parts[0].toUpperCase());
                            }
                        }
                    });

                    // define month order
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
                // Fetch folders starting with the selected month
                const { data } = await supabase
                    .from('dj_tracks')
                    .select('original_folder')
                    .eq('pool_id', selectedPoolId)
                    .ilike('original_folder', `${selectedMonth}/%`); // Efficient prefix search

                if (data) {
                    const uniqueFolders = new Set<string>();
                    data.forEach(item => {
                        if (item.original_folder) {
                            // Extract just the folder name part (after the month)
                            // "DECEMBER/Folder Name" -> "Folder Name"
                            const part = item.original_folder.substring(selectedMonth.length + 1); // +1 for slash
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
                // Reconstruct full original_folder path
                const fullFolderPath = `${selectedMonth}/${selectedFolder}`;

                const { data } = await supabase
                    .from('dj_tracks')
                    .select('*')
                    .eq('pool_id', selectedPoolId)
                    .eq('original_folder', fullFolderPath)
                    .order('created_at', { ascending: false });

                if (data) {
                    // Normalize data
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
        // Special logic for Beatport as requested
        if (brand.toLowerCase().includes('beatport')) {
            setView('years');
        } else {
            // For now, default others to old 'dates' view or 'years' if strictly following new schema
            // If only 1 year exists (e.g. "Club Killers"), it works fine.
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
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8 px-4">
                    Select <span className="text-[#ff0055]">Pool</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {brandList.map((name) => {
                        // Skip legacy "Beatport New Releases" if "Beatport" exists to avoid duplicates, 
                        // logic can be refined but simpler to just show what's in specialNames
                        if (name === 'Beatport New Releases') return null; // Hide legacy key in favor of "Beatport"

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
            <div className="flex items-center gap-4 px-4">
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

            {/* YEARS VIEW */}
            {view === 'years' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                    {loading ? <div className="text-white">Loading identifiers...</div> : yearList.map((yearPool) => (
                        <button
                            key={yearPool}
                            onClick={() => { setSelectedPoolId(yearPool); setView('months'); }}
                            className="h-32 bg-[#111] border border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 hover:border-[#ff0055] transition-all group"
                        >
                            <span className="text-2xl font-black text-white group-hover:text-[#ff0055] uppercase">{yearPool}</span>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">{yearPool.includes('20') ? 'Annual Collection' : 'Pool Archive'}</span>
                        </button>
                    ))}
                    {!loading && yearList.length === 0 && <p className="text-gray-500">No collections found.</p>}
                </div>
            )}

            {/* MONTHS VIEW */}
            {view === 'months' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                    {loading ? <div className="text-white">Loading months...</div> : monthList.map((month) => (
                        <button
                            key={month}
                            onClick={() => { setSelectedMonth(month); setView('folders'); }}
                            className="p-8 bg-[#111] border border-white/10 rounded-2xl text-center hover:bg-white/5 hover:border-[#ff0055] transition-all group"
                        >
                            <span className="text-xl font-bold text-gray-300 group-hover:text-white group-hover:scale-110 block transition-transform">{month}</span>
                        </button>
                    ))}
                    {!loading && monthList.length === 0 && <p className="text-gray-500">No months found (Running reorganization...).</p>}
                </div>
            )}

            {/* FOLDERS VIEW */}
            {view === 'folders' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                    {loading ? <div className="text-white">Loading folders...</div> : folderList.map((folder) => {
                        // Clean folder name display
                        // The folder name is already cleaned by the fetchFolders logic
                        const displayName = folder;

                        return (
                            <button
                                key={folder}
                                onClick={() => { setSelectedFolder(folder); setView('tracks'); }}
                                className="p-6 bg-[#111] border border-white/10 rounded-xl flex items-center gap-4 hover:bg-white/5 hover:border-[#ff0055] transition-all text-left group"
                            >
                                <div className="p-3 bg-white/5 rounded-lg text-gray-400 group-hover:text-[#ff0055] group-hover:bg-[#ff0055]/10">
                                    <Folder size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white truncate group-hover:text-[#ff0055] transition-colors">{displayName}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{selectedPoolId}</p>
                                </div>
                            </button>
                        );
                    })}
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
