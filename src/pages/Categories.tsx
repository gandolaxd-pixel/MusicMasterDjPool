import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { LatestUploads } from '../app/components/LatestUploads';
import { usePlayer } from '../context/PlayerContext';
import { useCrate } from '../context/CrateContext';
import { useAuth } from '../context/AuthContext';
import { Folder, ChevronRight, Home, FolderOpen, Loader2, Music, HardDrive } from 'lucide-react';

interface CategoriesProps {
    realTracks?: any[];
    user?: any;
}

export const CategoriesPage: React.FC<CategoriesProps> = () => {
    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const { crate, toggleCrate } = useCrate();
    const { user } = useAuth();

    // Navigation state
    const [path, setPath] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Data state
    const [rootPools, setRootPools] = useState<string[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);

    // Load root pools (all unique pool_ids)
    useEffect(() => {
        const loadRootPools = async () => {
            setLoading(true);
            try {
                // Get distinct pool_ids from dj_tracks
                const { data } = await supabase
                    .from('dj_tracks')
                    .select('pool_id')
                    .limit(10000);

                if (data) {
                    const uniquePools = [...new Set(data.map(d => d.pool_id).filter(Boolean))];
                    // Sort alphabetically
                    uniquePools.sort((a, b) => a.localeCompare(b));
                    setRootPools(uniquePools);
                }
            } catch (err) {
                console.error('Error loading pools:', err);
            } finally {
                setLoading(false);
            }
        };

        loadRootPools();
    }, []);

    // Load folder contents when path changes
    useEffect(() => {
        if (path.length === 0) {
            // At root - show pool_ids as folders
            setFolders([]);
            setTracks([]);
            return;
        }

        const loadFolderContents = async () => {
            setLoading(true);
            const poolId = path[0];

            try {
                if (path.length === 1) {
                    // Inside a pool root - get top-level folders from server_path
                    const { data: poolTracks } = await supabase
                        .from('dj_tracks')
                        .select('server_path')
                        .eq('pool_id', poolId)
                        .limit(5000);

                    if (poolTracks) {
                        // Extract unique first-level folders
                        const folderSet = new Set<string>();
                        const directTracks: string[] = [];

                        poolTracks.forEach(t => {
                            const serverPath = t.server_path || '';
                            // Remove leading slash and pool folder if present
                            let relativePath = serverPath;
                            if (relativePath.startsWith('/')) relativePath = relativePath.slice(1);
                            
                            const parts = relativePath.split('/').filter(Boolean);
                            
                            if (parts.length > 1) {
                                // Has subfolder
                                folderSet.add(parts[0]);
                            } else if (parts.length === 1) {
                                // Direct file in root
                                directTracks.push(serverPath);
                            }
                        });

                        setFolders([...folderSet].sort());
                        
                        // Load direct tracks if any
                        if (directTracks.length > 0) {
                            const { data: directTrackData } = await supabase
                                .from('dj_tracks')
                                .select('*')
                                .eq('pool_id', poolId)
                                .in('server_path', directTracks.slice(0, 100));
                            
                            if (directTrackData) {
                                setTracks(directTrackData.map(t => ({
                                    ...t,
                                    title: t.title || t.name,
                                    file_path: t.server_path
                                })));
                            }
                        } else {
                            setTracks([]);
                        }
                    }
                } else {
                    // Deeper navigation - filter by path prefix
                    const pathPrefix = '/' + path.slice(1).join('/');
                    
                    const { data: pathTracks } = await supabase
                        .from('dj_tracks')
                        .select('server_path, name, title, id, artist, bpm, key')
                        .eq('pool_id', poolId)
                        .ilike('server_path', `${pathPrefix}/%`)
                        .limit(5000);

                    if (pathTracks) {
                        const folderSet = new Set<string>();
                        const directTrackPaths: string[] = [];

                        pathTracks.forEach(t => {
                            const serverPath = t.server_path || '';
                            // Get relative path after current path
                            const afterPrefix = serverPath.slice(pathPrefix.length + 1);
                            const parts = afterPrefix.split('/').filter(Boolean);

                            if (parts.length > 1) {
                                // Has more subfolders
                                folderSet.add(parts[0]);
                            } else if (parts.length === 1) {
                                // Direct file in this folder
                                directTrackPaths.push(serverPath);
                            }
                        });

                        setFolders([...folderSet].sort());

                        // Load tracks in this folder
                        if (directTrackPaths.length > 0) {
                            const { data: trackData } = await supabase
                                .from('dj_tracks')
                                .select('*')
                                .eq('pool_id', poolId)
                                .in('server_path', directTrackPaths.slice(0, 200));

                            if (trackData) {
                                setTracks(trackData.map(t => ({
                                    ...t,
                                    title: t.title || t.name,
                                    file_path: t.server_path
                                })));
                            }
                        } else {
                            setTracks([]);
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading folder:', err);
            } finally {
                setLoading(false);
            }
        };

        loadFolderContents();
    }, [path]);

    // Navigation handlers
    const navigateToPool = useCallback((poolId: string) => {
        setPath([poolId]);
    }, []);

    const navigateToFolder = useCallback((folderName: string) => {
        setPath(prev => [...prev, folderName]);
    }, []);

    const navigateUp = useCallback(() => {
        setPath(prev => prev.slice(0, -1));
    }, []);

    const navigateHome = useCallback(() => {
        setPath([]);
    }, []);

    const navigateToBreadcrumb = useCallback((index: number) => {
        setPath(prev => prev.slice(0, index + 1));
    }, []);

    // Decode URL-encoded names for display
    const cleanName = (name: string) => {
        try {
            return decodeURIComponent(name);
        } catch {
            return name;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <HardDrive size={32} className="text-[#ff0055]" />
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                            FTP <span className="text-[#ff0055]">Server</span>
                        </h1>
                    </div>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm bg-white/5 p-3 rounded-lg border border-white/10 overflow-x-auto">
                        <button 
                            onClick={navigateHome} 
                            className="p-1 hover:text-white text-gray-400 transition-colors flex-shrink-0"
                            aria-label="Ir a inicio"
                        >
                            <Home size={16} />
                        </button>
                        {path.map((part, index) => (
                            <React.Fragment key={`${part}-${index}`}>
                                <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                                <button
                                    onClick={() => navigateToBreadcrumb(index)}
                                    className={`font-bold uppercase tracking-wider truncate max-w-[150px] ${
                                        index === path.length - 1 ? 'text-[#ff0055]' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {cleanName(part)}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-[#ff0055]" />
                    </div>
                )}

                {/* Root Level - Show all pools */}
                {!loading && path.length === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">
                            {rootPools.length} carpetas en el servidor
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {rootPools.map(pool => (
                                <button
                                    key={pool}
                                    onClick={() => navigateToPool(pool)}
                                    className="flex flex-col items-center justify-center gap-3 p-6 bg-[#111] border border-white/5 rounded-xl hover:border-[#ff0055] hover:bg-[#ff0055]/5 transition-all group"
                                >
                                    <Folder 
                                        size={36} 
                                        className="text-[#ff6b00] group-hover:text-[#ff0055] transition-colors" 
                                        fill="currentColor" 
                                        fillOpacity={0.2} 
                                    />
                                    <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-full text-center">
                                        {cleanName(pool)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Folder Navigation */}
                {!loading && path.length > 0 && (
                    <>
                        {/* Folders Grid */}
                        {(folders.length > 0 || path.length > 0) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Back Button */}
                                <button
                                    onClick={navigateUp}
                                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                                >
                                    <FolderOpen size={32} className="text-gray-500 group-hover:text-white transition-colors" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">← Atrás</span>
                                </button>

                                {/* Subfolders */}
                                {folders.map(folder => (
                                    <button
                                        key={folder}
                                        onClick={() => navigateToFolder(folder)}
                                        className="flex flex-col items-center justify-center gap-3 p-6 bg-[#111] border border-white/5 rounded-xl hover:border-[#ff0055] hover:bg-[#ff0055]/5 transition-all group"
                                    >
                                        <Folder 
                                            size={32} 
                                            className="text-[#ff6b00] group-hover:text-[#ff0055] transition-colors" 
                                            fill="currentColor" 
                                            fillOpacity={0.2} 
                                        />
                                        <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-full text-center">
                                            {cleanName(folder)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Tracks List */}
                        {tracks.length > 0 && (
                            <div className="border-t border-white/10 pt-8 animate-in fade-in duration-700">
                                <div className="flex items-center gap-2 mb-6">
                                    <Music size={18} className="text-[#ff0055]" />
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Tracks</h2>
                                    <span className="text-xs text-gray-500 font-mono">({tracks.length})</span>
                                </div>
                                <LatestUploads
                                    tracks={tracks}
                                    selectedGenre={null}
                                    onGenreSelect={() => {}}
                                    onToggleCrate={toggleCrate}
                                    crate={crate}
                                    user={user}
                                    onPlay={playTrack}
                                    currentTrack={currentTrack}
                                    isPlaying={isPlaying}
                                    loading={false}
                                />
                            </div>
                        )}

                        {/* Empty State */}
                        {folders.length === 0 && tracks.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                                <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Carpeta vacía</p>
                                <button 
                                    onClick={navigateUp}
                                    className="mt-4 text-xs text-[#ff0055] hover:underline uppercase tracking-widest"
                                >
                                    ← Volver
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
