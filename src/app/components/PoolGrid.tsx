import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Disc, ArrowLeft, Folder, Home, ChevronRight } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useCrate } from '../../context/CrateContext';
import { useAuth } from '../../context/AuthContext';
import { LatestUploads } from './LatestUploads';

interface SpecialNames {
    [key: string]: string;
}

const PoolGrid: React.FC = () => {
    // Navigation State - supports unlimited depth
    const [path, setPath] = useState<string[]>([]); // ["Beatport", "BEATPORT2025", "MONTHS", "DECEMBER", ...]
    const [currentLevel, setCurrentLevel] = useState<'brands' | 'navigation' | 'tracks'>('brands');

    // Data State
    const [brandList, setBrandList] = useState<string[]>([]);
    const [folderItems, setFolderItems] = useState<string[]>([]);
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

    // Load brands on mount
    useEffect(() => {
        if (currentLevel === 'brands') {
            const allPools = Object.keys(specialNames).sort();
            const unique = Array.from(new Set(allPools));
            setBrandList(unique);
        }
    }, [currentLevel]);

    // Navigate folder structure based on server_path
    useEffect(() => {
        if (currentLevel === 'navigation' && path.length > 0) {
            const fetchFolderContents = async () => {
                setLoading(true);
                const brand = path[0];

                // Build the path prefix to search
                // path[0] = "Beatport" (brand name)
                // path[1+] = folder levels from server_path

                let searchPrefix = '';
                if (brand === 'Beatport') {
                    // Always start with /BEATPORT2025/ for this brand
                    const root = 'BEATPORT2025';
                    const subPath = path.slice(1).join('/');
                    searchPrefix = `/${root}/${subPath ? subPath + '/' : ''}`;
                }

                // Optimized "Skip Scan" Strategy for large folders
                // Instead of fetching 34k rows, we fetch 1 row, identify the folder, and skip to the next one.
                const folderSet = new Set<string>();
                const filesAtLevel: any[] = [];
                let hasMore = true;
                let currentSkipMarker = searchPrefix;

                // Add a iteration limit to prevent infinite loops in case of weird data
                let safetyLimit = 0;
                const MAX_ITEMS = 500; // Expected max distinct folders/files in a single view

                while (hasMore && safetyLimit < MAX_ITEMS) {
                    safetyLimit++;

                    const { data, error } = await supabase
                        .from('dj_tracks')
                        .select('server_path, name') // We can fetch name now, it's cheap (1 row)
                        .eq('pool_id', 'BEATPORT')
                        .ilike('server_path', `${searchPrefix}%`)
                        .gt('server_path', currentSkipMarker)
                        .order('server_path', { ascending: true })
                        .limit(1);

                    if (error || !data || data.length === 0) {
                        hasMore = false;
                    } else {
                        const item = data[0];
                        const serverPath = item.server_path;

                        if (!serverPath) {
                            hasMore = false;
                            continue;
                        }

                        const pathParts = serverPath.split('/').filter(Boolean);
                        const prefixDepth = searchPrefix.split('/').filter(Boolean).length;

                        // Check depth
                        if (pathParts.length > prefixDepth) {
                            const nextPart = pathParts[prefixDepth];

                            // Is it a folder or a file?
                            if (pathParts.length > prefixDepth + 1) {
                                // It's a folder (e.g. "01")
                                folderSet.add(nextPart);
                                // Skip EVERYTHING inside this folder
                                currentSkipMarker = `${searchPrefix}${nextPart}/\uffff`;
                            } else {
                                // It's a file at this level
                                filesAtLevel.push(item);
                                // Skip THIS file
                                currentSkipMarker = serverPath;
                            }
                        } else {
                            // Should not happen if logic is correct
                            currentSkipMarker = serverPath + '/\uffff';
                        }
                    }
                }

                // We use these variables in the UI logic below
                // const sortedFolders ...
                // const filesAtLevel ... are already populated

                // Sort folders: put MONTHS first, then BEATPORT COLLECTION, then alphabetically
                const sortedFolders = Array.from(folderSet).sort((a, b) => {
                    if (a === 'MONTHS') return -1;
                    if (b === 'MONTHS') return 1;
                    if (a.includes('COLLECTION')) return -1;
                    if (b.includes('COLLECTION')) return 1;
                    // Numeric sort for days (01, 02, 10...)
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return numA - numB;
                    }
                    return a.localeCompare(b);
                });

                if (sortedFolders.length > 0) {
                    setFolderItems(sortedFolders);
                    setTrackList([]);
                } else if (filesAtLevel.length > 0) {
                    // We're at a leaf folder with tracks
                    setFolderItems([]);

                    // Fetch full track data for this folder (now we need full rows)
                    const folderPath = searchPrefix;
                    const { data: tracks } = await supabase
                        .from('dj_tracks')
                        .select('*')
                        .eq('pool_id', 'BEATPORT')
                        .ilike('server_path', `${folderPath}%`)
                        //.limit(500) // Limit tracks per folder to avoid heavy render
                        .order('name');

                    if (tracks) {
                        // Filter only files in this exact folder
                        const exactFiles = tracks.filter(t => {
                            const parts = t.server_path.split('/').filter(Boolean);
                            return parts.length === prefixDepth + 1; // File directly in this folder
                        });

                        const mapped = exactFiles.map((item: any) => ({
                            ...item,
                            pool_origin: item.pool_id,
                            file_path: item.server_path,
                            title: item.title || item.name,
                        }));
                        setTrackList(mapped);
                        setCurrentLevel('tracks');
                    }
                }
            }
            setLoading(false);
        };
        fetchFolderContents();
    }
    }, [currentLevel, path]);

// --- NAVIGATION HANDLERS ---

const handleBrandClick = (brand: string) => {
    setPath([brand]);
    setCurrentLevel('navigation');
};

const handleFolderClick = (folder: string) => {
    setPath([...path, folder]);
};

const handleBack = () => {
    if (path.length <= 1) {
        setPath([]);
        setCurrentLevel('brands');
    } else {
        const newPath = [...path];
        newPath.pop();
        setPath(newPath);
        if (currentLevel === 'tracks') {
            setCurrentLevel('navigation');
        }
    }
};

const goHome = () => {
    setPath([]);
    setCurrentLevel('brands');
    setFolderItems([]);
    setTrackList([]);
};

// --- RENDERERS ---

if (currentLevel === 'brands') {
    return (
        <div className="pt-10">
            <div className="flex justify-between items-end mb-8 px-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                    Select <span className="text-[#ff0055]">Pool</span>
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {brandList.map((name) => {
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
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 px-4 overflow-x-auto py-2 border-b border-white/5 pb-6">
            <button onClick={goHome} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
                <Home size={18} />
            </button>
            {path.map((p, i) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                    <ChevronRight size={14} className="text-gray-800" />
                    <button
                        onClick={() => {
                            const newPath = path.slice(0, i + 1);
                            setPath(newPath);
                            setCurrentLevel('navigation');
                        }}
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${i === path.length - 1 ? 'text-[#ff0055]' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        {p}
                    </button>
                </div>
            ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-4">
                <button onClick={handleBack} className="p-3 rounded-full border border-white/10 hover:bg-[#ff0055] hover:border-[#ff0055] transition-all group shadow-2xl">
                    <ArrowLeft size={20} className="group-hover:scale-110 text-white" />
                </button>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    <span className="text-[#ff0055]">{path[path.length - 1]}</span>
                    {currentLevel === 'tracks' ? ' Tracks' : ' Contents'}
                </h2>
            </div>
        </div>

        {/* FOLDER NAVIGATION VIEW */}
        {currentLevel === 'navigation' && (
            <div className="flex flex-col gap-2 px-4">
                {loading ? (
                    <div className="py-20 text-center text-gray-600 font-black text-[10px] uppercase animate-pulse tracking-widest">Loading...</div>
                ) : folderItems.length > 0 ? (
                    folderItems.map((folder) => (
                        <div
                            key={folder}
                            onClick={() => handleFolderClick(folder)}
                            className="group flex items-center justify-between bg-[#0a0a0a] border-l-4 border-white/5 p-4 rounded-xl cursor-pointer hover:border-[#ff0055]/50 hover:bg-[#121212] transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 transition-colors text-gray-600 group-hover:text-[#ff0055]">
                                    <Folder size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white uppercase truncate max-w-[200px] md:max-w-md">{folder}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-[#ff0055] uppercase tracking-widest">folder</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 text-gray-800 group-hover:text-[#ff0055] transition-colors"><Folder size={18} /></div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 py-10 text-center">No folders found at this level.</p>
                )}
            </div>
        )}

        {/* TRACKS VIEW */}
        {currentLevel === 'tracks' && (
            <div className="px-4">
                {loading ? (
                    <div className="text-white">Loading tracks...</div>
                ) : trackList.length > 0 ? (
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
                ) : (
                    <p className="text-gray-500 py-10 text-center">No tracks found in this folder.</p>
                )}
            </div>
        )}
    </div>
);
};

export default PoolGrid;
