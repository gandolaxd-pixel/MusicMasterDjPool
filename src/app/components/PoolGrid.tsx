import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Disc, ArrowLeft, Folder, Home, ChevronRight } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useCrate } from '../../context/CrateContext';
import { useAuth } from '../../context/AuthContext';
import { LatestUploads } from './LatestUploads';

import { SPECIAL_NAMES, MONTH_MAP, POOL_ID_MAP } from '../../constants/poolData';

interface PoolGridProps {
    initialPool?: string;
    overridePoolId?: string;
}

// BUILD: 2026-01-29-v2 - Force browser reload
const PoolGrid: React.FC<PoolGridProps> = ({ initialPool, overridePoolId }) => {
    // Navigation State - supports unlimited depth
    const [path, setPath] = useState<string[]>(initialPool ? [initialPool] : []);
    const [currentLevel, setCurrentLevel] = useState<'brands' | 'navigation' | 'tracks'>(initialPool ? 'navigation' : 'brands');

    // Data State
    const [brandList, setBrandList] = useState<string[]>([]);
    const [folderItems, setFolderItems] = useState<string[]>([]);
    const [trackList, setTrackList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Context
    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const { crate, toggleCrate } = useCrate();
    const { user } = useAuth();

    // Load brands on mount (skip if initialPool is set)
    useEffect(() => {
        if (overridePoolId === 'RETRO_VAULT') {
            if (path.length === 0) {
                setBrandList([]);
                setCurrentLevel('navigation');
                // Carpetas raíz de RETRO_VAULT según la DB
                setFolderItems([
                    '80s',
                    '12 INCH',
                    'DANCE CLASSICS COLLECTION',
                    'DANCE EURO COLLECTION',
                    'ITALO_DISCO'
                ]);
            }
            return;
        }

        if (!initialPool && currentLevel === 'brands') {
            const allPools = Object.keys(SPECIAL_NAMES).sort();
            const unique = Array.from(new Set(allPools));
            setBrandList(unique);
        }
    }, [currentLevel, initialPool, overridePoolId, path.length]);

    // Navigate folder structure based on server_path
    useEffect(() => {
        if (currentLevel === 'navigation' && path.length > 0) {
            const fetchFolderContents = async () => {
                setLoading(true);
                const brand = path[0];

                // Determine pool_id based on current brand or override
                // Use POOL_ID_MAP to translate UI names to actual database pool_ids
                let poolId = 'BEATPORT';
                if (overridePoolId) poolId = overridePoolId;
                else if (brand === 'DJPACKS') {
                    if (path.includes('SOUTH AMERICA DJ PACKS')) poolId = 'SOUTH AMERICA';
                    else poolId = 'DJPACKS';
                }
                else if (brand === 'BEATPORT') poolId = 'BEATPORT';
                else poolId = POOL_ID_MAP[brand] || brand; // Map UI name to pool_id

                // --- VIRTUAL NAVIGATION FOR DJ POOLS (Club Killers, DDP, etc) ---
                // Estos pools NO usan dj_folders, navegan por drop_month/drop_day
                if (!['DJPACKS', 'BEATPORT', 'SOUTH AMERICA', 'RETRO_VAULT'].includes(poolId)) {
                    // Level 1: Years (Root)
                    if (path.length === 1) {
                        setFolderItems(['2026', '2025']);
                        setTrackList([]);
                        setLoading(false);
                        return;
                    }

                    // Level 2: Months (passed Year)
                    if (path.length === 2) {
                        const year = path[1];
                        const { data } = await supabase
                            .from('dj_tracks')
                            .select('drop_month')
                            .eq('pool_id', poolId)
                            .ilike('original_folder', `%${year}%`)
                            .order('drop_month')
                            .limit(1000);

                        if (data && data.length > 0) {
                            const uniqueMonths = Array.from(new Set(data.filter(d => d.drop_month).map(d => d.drop_month)))
                                .sort((a, b) => (MONTH_MAP[a] || 99) - (MONTH_MAP[b] || 99));
                            setFolderItems(uniqueMonths);
                        } else {
                            setFolderItems([]);
                        }
                        setTrackList([]);
                        setLoading(false);
                        return;
                    }

                    // Level 3: Days (passed Month)
                    if (path.length === 3) {
                        const year = path[1];
                        const month = path[2];

                        const { data } = await supabase
                            .from('dj_tracks')
                            .select('drop_day')
                            .eq('pool_id', poolId)
                            .ilike('original_folder', `%${year}%`)
                            .eq('drop_month', month)
                            .order('drop_day', { ascending: true })
                            .limit(500);

                        if (data && data.length > 0) {
                            const uniqueDays = Array.from(new Set(data.map(d => d.drop_day?.toString()))).filter(Boolean).sort((a, b) => parseInt(a!) - parseInt(b!));
                            setFolderItems(uniqueDays);
                        } else {
                            setFolderItems([]);
                        }
                        setTrackList([]);
                        setLoading(false);
                        return;
                    }

                    // Level 4: Tracks (passed Day)
                    if (path.length >= 4) {
                        const year = path[1];
                        const month = path[2];
                        const day = parseInt(path[3]);

                        const { data: tracks } = await supabase
                            .from('dj_tracks')
                            .select('id, name, title, server_path, pool_id, original_folder, drop_month, drop_day')
                            .eq('pool_id', poolId)
                            .ilike('original_folder', `%${year}%`)
                            .eq('drop_month', month)
                            .eq('drop_day', day)
                            .order('name')
                            .limit(500);

                        if (tracks && tracks.length > 0) {
                            const mapped = tracks.map((item: any) => ({
                                ...item,
                                pool_origin: item.pool_id,
                                file_path: item.server_path,
                                title: item.title || item.name,
                            }));
                            setTrackList(mapped);
                            setFolderItems([]);
                            setCurrentLevel('tracks');
                        } else {
                            setTrackList([]);
                        }
                        setLoading(false);
                        return;
                    }
                }

                // --- EXISTING LOGIC FOR DJPACKS / BEATPORT / RETRO (Indexed Folders) ---

                let searchPrefix = '';

                // BEATPORT: Mostrar años primero
                if (brand === 'BEATPORT' && path.length === 1) {
                    // Nivel raíz de BEATPORT -> mostrar años disponibles
                    setFolderItems(['2026', '2025']);
                    setTrackList([]);
                    setLoading(false);
                    return;
                }

                if (overridePoolId === 'RETRO_VAULT') {
                    // Path viene como ['RETRO VAULT', '80S', 'subfolder...']
                    // Pero server_path en DB es '/80s/subfolder...' (sin 'RETRO VAULT')
                    // Quitar 'RETRO VAULT' del path si existe
                    const pathWithoutBrand = path[0]?.toUpperCase() === 'RETRO VAULT' 
                        ? path.slice(1) 
                        : path;
                    const relativePath = pathWithoutBrand.join('/');
                    searchPrefix = `/${relativePath}`;
                    console.log('[RETRO_VAULT] path:', path, '-> searchPrefix:', searchPrefix);
                }
                else if (brand === 'DJPACKS') {
                    // Custom mapping for SOUTH AMERICA
                    if (path.includes('SOUTH AMERICA DJ PACKS')) {
                        const relativePath = path.slice(path.indexOf('SOUTH AMERICA DJ PACKS') + 1).join('/');
                        searchPrefix = `/REMIXEN/${relativePath}`;
                    } else {
                        searchPrefix = `/${path.join('/')}`;
                    }
                }
                else if (brand === 'BEATPORT' && path.length > 1) {
                    // BEATPORT 2025 structure is /BEATPORT2025 not /BEATPORT/2025
                    const year = path[1];
                    const rest = path.slice(2);
                    if (rest.length > 0) {
                        searchPrefix = `/BEATPORT${year}/${rest.join('/')}`;
                    } else {
                        searchPrefix = `/BEATPORT${year}`;
                    }
                }
                else {
                    // Fallback
                    searchPrefix = `/${path.join('/')}`;
                }

                // Ensure valid prefix
                searchPrefix = searchPrefix.replace(/\/+/g, '/').replace(/\/+$/, '') + '/';
                const prefixDepth = searchPrefix.split('/').filter(Boolean).length;

                // 🚀 SUPER FAST INDEXED NAVIGATION (10TB Scale)
                // 1. First check if there are subfolders in 'dj_folders' index
                const folderSet = new Set<string>();

                // Query cache table logic
                // Ensure root '/' is handled correctly
                const parentPathToQuery = searchPrefix === '/' ? '/' : searchPrefix.replace(/\/$/, '');

                const { data: cachedFolders, error: folderError } = await supabase
                    .from('dj_folders')
                    .select('name')
                    .eq('parent_path', parentPathToQuery)
                    .order('name')
                    .limit(500);

                if (folderError) {
                    console.error('Error fetching folders:', folderError);
                }

                console.log('[DEBUG] cachedFolders:', cachedFolders?.length, 'parentPathToQuery:', parentPathToQuery);
                
                if (cachedFolders && cachedFolders.length > 0) {
                    cachedFolders.forEach(f => folderSet.add(f.name));
                } else {
                    // Si no hay carpetas en dj_folders, buscar tracks directamente
                    let trackPoolId = 'BEATPORT';
                    if (overridePoolId === 'RETRO_VAULT') {
                        trackPoolId = 'RETRO_VAULT';
                    } else if (brand === 'DJPACKS') {
                        trackPoolId = path.includes('SOUTH AMERICA DJ PACKS') ? 'SOUTH AMERICA' : 'DJPACKS';
                    } else if (brand === 'BEATPORT') {
                        trackPoolId = 'BEATPORT';
                    }

                    // Buscar tracks directamente con ILIKE
                    const searchPattern = searchPrefix + '%';
                    console.log('[DEBUG] Buscando tracks, pool:', trackPoolId, 'pattern:', searchPattern);
                    
                    const { data: directTracks, error: tracksError } = await supabase
                        .from('dj_tracks')
                        .select('id, name, title, server_path, pool_id, original_folder')
                        .eq('pool_id', trackPoolId)
                        .ilike('server_path', searchPattern)
                        .order('name')
                        .limit(500);

                    console.log('[DEBUG] directTracks:', directTracks?.length, 'error:', tracksError);

                    if (directTracks && directTracks.length > 0) {
                        const mapped = directTracks.map((item: any) => ({
                            ...item,
                            pool_origin: item.pool_id,
                            file_path: item.server_path,
                            title: item.title || item.name,
                        }));
                        setTrackList(mapped);
                        setFolderItems([]);
                        setCurrentLevel('tracks');
                        setLoading(false);
                        return;
                    } else {
                        console.log('[DEBUG] No tracks found! Showing empty state');
                    }
                }

                // INJECT CUSTOM FOLDER FOR DJPACKS ROOT
                if (brand === 'DJPACKS' && path.length === 1) { // path is just ['DJPACKS']
                    folderSet.add('SOUTH AMERICA DJ PACKS');
                }

                // 2. Sort folders
                const sortedFolders = Array.from(folderSet)
                    .filter(name => name !== 'DJPACKS') // HIDE DJPACKS from general view
                    .sort((a, b) => {
                        if (a === 'MONTHS') return -1;
                        if (b === 'MONTHS') return 1;
                        if (a.includes('COLLECTION')) return -1;
                        if (b.includes('COLLECTION')) return 1;
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
                } else {
                    // 3. Fallback: No folders found in index? Check for FILES in dj_tracks.
                    setFolderItems([]);

                    const folderPath = searchPrefix;
                    // Determine pool_id based on current context
                    let trackPoolId = 'BEATPORT';
                    if (overridePoolId === 'RETRO_VAULT') {
                        trackPoolId = 'RETRO_VAULT';
                    } else if (brand === 'DJPACKS') {
                        if (path.includes('SOUTH AMERICA DJ PACKS')) {
                            trackPoolId = 'SOUTH AMERICA';
                        } else {
                            trackPoolId = 'DJPACKS';
                        }
                    } else if (brand === 'BEATPORT') {
                        trackPoolId = 'BEATPORT';
                    } else {
                        trackPoolId = brand;
                    }

                    // Buscar tracks con ILIKE (funciona con paths URL-encoded)
                    const searchPattern = folderPath + '%';
                    console.log('[DEBUG Fallback] pool:', trackPoolId, 'pattern:', searchPattern);
                    
                    const { data: tracks, error: tracksError } = await supabase
                        .from('dj_tracks')
                        .select('id, name, title, server_path, pool_id, original_folder, drop_month, drop_day, created_at')
                        .eq('pool_id', trackPoolId)
                        .ilike('server_path', searchPattern)
                        .order('name')
                        .limit(500);

                    if (tracksError) {
                        console.error('Error fetching tracks:', tracksError);
                    }
                    
                    console.log('[DEBUG Fallback] tracks found:', tracks?.length);

                    if (tracks && tracks.length > 0) {
                        // Filtrar solo archivos del nivel actual (no de subcarpetas)
                        const tracksToShow = tracks.filter((t: any) => {
                            if (!t.server_path) return false;
                            const trackParts = t.server_path.split('/').filter(Boolean);
                            // El track debe estar exactamente un nivel debajo del prefix
                            return trackParts.length === prefixDepth + 1;
                        });

                        if (tracksToShow.length > 0) {
                            const mapped = tracksToShow.map((item: any) => ({
                                ...item,
                                pool_origin: item.pool_id,
                                file_path: item.server_path,
                                title: item.title || item.name,
                            }));
                            setTrackList(mapped);
                            setCurrentLevel('tracks');
                        } else {
                            // Si no hay tracks en este nivel exacto, mostrar todos los del path
                            const allMapped = tracks.map((item: any) => ({
                                ...item,
                                pool_origin: item.pool_id,
                                file_path: item.server_path,
                                title: item.title || item.name,
                            }));
                            setTrackList(allMapped);
                            setCurrentLevel('tracks');
                        }
                    } else {
                        setTrackList([]);
                        console.log('No tracks found for path:', folderPath, 'poolId:', trackPoolId);
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

    const cleanDisplayName = (name: string) => {
        if (!name) return '';
        try {
            // Only decode URI components, NO removing branding
            return decodeURIComponent(name).trim();
        } catch (e) {
            return name;
        }
    };

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

                        const imageName = SPECIAL_NAMES[name] || `${name.toLowerCase().replace(/\s/g, '')}.png`;
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
                                    loading="lazy"
                                    decoding="async"
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
                {/* Hide home button when using initialPool (no brands view to return to) */}
                {!initialPool && (
                    <button onClick={goHome} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
                        <Home size={18} />
                    </button>
                )}
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
                            {cleanDisplayName(p)}
                        </button>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-4">
                <div className="flex items-center gap-4">
                    {/* Hide back button at root level when using initialPool */}
                    {!(initialPool && path.length === 1) && (
                        <button onClick={handleBack} className="p-3 rounded-full border border-white/10 hover:bg-[#ff0055] hover:border-[#ff0055] transition-all group shadow-2xl">
                            <ArrowLeft size={20} className="group-hover:scale-110 text-white" />
                        </button>
                    )}
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                        <span className="text-[#ff0055]">{cleanDisplayName(path[path.length - 1] || '')}</span>
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
                                        <h3 className="text-sm font-bold text-gray-200 group-hover:text-white uppercase truncate max-w-[200px] md:max-w-md">
                                            {cleanDisplayName(folder)}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-[#ff0055] uppercase tracking-widest">folder</span>
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
