import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PoolGrid from '../app/components/PoolGrid';
import { supabase } from '../supabase';
import { LatestUploads } from '../app/components/LatestUploads';
import { usePlayer } from '../context/PlayerContext';
import { useCrate } from '../context/CrateContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface PacksPageProps {
    user: any;
}

export const PacksPage: React.FC<PacksPageProps> = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const folderParam = searchParams.get('folder');
    
    const [packTracks, setPackTracks] = useState<any[]>([]);
    const [packName, setPackName] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const { crate, toggleCrate } = useCrate();
    const { user } = useAuth();

    // If we have a folder param, load the tracks from that pack
    useEffect(() => {
        if (!folderParam) {
            setPackTracks([]);
            setPackName('');
            return;
        }

        const loadPackTracks = async () => {
            setLoading(true);
            try {
                // Get pack name from folder path
                const parts = folderParam.split('/').filter(Boolean);
                setPackName(parts[parts.length - 1] || 'Pack');

                // Search for tracks inside this folder
                const { data } = await supabase
                    .from('dj_tracks')
                    .select('*')
                    .eq('pool_id', 'DJPACKS')
                    .ilike('server_path', `${folderParam}/%`)
                    .neq('format', 'pack')
                    .order('name')
                    .limit(200);

                if (data) {
                    const mapped = data.map((t: any) => ({
                        ...t,
                        title: t.title || t.name,
                        file_path: t.file_path || t.server_path,
                        pool_origin: 'DJPACKS'
                    }));
                    setPackTracks(mapped);
                }
            } catch (err) {
                console.error('Error loading pack tracks:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPackTracks();
    }, [folderParam]);

    const handleBack = () => {
        setSearchParams({});
    };

    // If we have a folder param, show the pack contents
    if (folderParam) {
        return (
            <div className="animate-in fade-in duration-700 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Volver a packs"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                {decodeURIComponent(packName)}
                            </h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                                {packTracks.length} tracks in this pack
                            </p>
                        </div>
                    </div>
                </div>

                {/* Track list */}
                <LatestUploads
                    tracks={packTracks}
                    selectedGenre={null}
                    onGenreSelect={() => {}}
                    onToggleCrate={toggleCrate}
                    crate={crate}
                    user={user}
                    onPlay={playTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    loading={loading}
                />
            </div>
        );
    }

    // Default: show full pack grid
    return (
        <div className="animate-in fade-in duration-700">
            <PoolGrid initialPool="DJPACKS" />
        </div>
    );
};
