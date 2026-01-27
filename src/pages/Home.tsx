import { CinematicHero } from '../app/components/CinematicHero';
import { SmartCrates } from '../app/components/SmartCrates';
import { LatestUploads } from '../app/components/LatestUploads';
import { Trends } from '../app/components/Trends';
import { usePlayer } from '../context/PlayerContext';
import { useCrate } from '../context/CrateContext';
import { Database, Activity, Clock, Zap } from 'lucide-react';

interface HomePageProps {
    realTracks: any[];
    selectedGenre: string | null;
    onGenreSelect: (genre: string | null) => void;
    user: any;
    featuredPack?: any; // Nuevo prop para el pack destacado
    loading?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ user, realTracks, selectedGenre, onGenreSelect, featuredPack, loading }) => {
    const { playTrack, playQueue, currentTrack, isPlaying } = usePlayer();
    const { crate, toggleCrate } = useCrate();

    // Helper to get tracks from a pack
    const handlePlayPack = async () => {
        if (!featuredPack) {
            // Fallback default behavior
            playTrack(realTracks[0]);
            return;
        }

        try {
            const { supabase } = await import('../supabase');
            // Use 'tracks' table for consistency (migrated data)
            const folderPath = featuredPack.original_folder || featuredPack.folder;
            const { data } = await supabase
                .from('tracks')
                .select('*')
                .eq('folder', folderPath)
                .limit(50); // Get tracks for the queue

            if (data && data.length > 0) {
                // Map to player track format
                const queue = data.map(song => ({
                    ...song,
                    title: song.title || song.name,
                    file_path: song.file_path || song.server_path,
                }));
                playQueue(queue);
            } else {
                console.warn("No songs found in this pack to play.");
            }
        } catch (err) {
            console.error("Error playing pack:", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* 1. CINEMATIC HERO (Featured Content) - Visual Hook */}
            <div className="relative z-10">
                <CinematicHero
                    onPlay={handlePlayPack}
                    pack={featuredPack}
                    loading={loading}
                />
            </div>

            {/* 2. HYBRID DASHBOARD CONTENT */}
            <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 space-y-8 pb-32">

                {/* A. LIVE STATS BAR (Restored from Pro Dashboard) */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#ff0055]/20 text-[#ff0055] rounded-lg animate-pulse"><Database size={18} /></div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black leading-none">43.2k</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Total Tracks</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><Activity size={18} /></div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black leading-none">128</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Added Today</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg"><Clock size={18} /></div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black leading-none">2m</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Last Update</span>
                        </div>
                    </div>
                </div>

                {/* B. SMART CRATES (Utility) */}
                <div>
                    <h3 className="text-gray-500 font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-[#ff0055]" /> Quick Access
                    </h3>
                    <SmartCrates />
                </div>

                {/* C. TRENDS MARQUEE (Visual Break) */}
                <div className="py-4">
                    <Trends tracks={realTracks} />
                </div>

                {/* D. DATA LIST (Pro Utility) */}
                <section id="latest">
                    <LatestUploads
                        tracks={realTracks.slice(0, 50)}
                        selectedGenre={selectedGenre}
                        onGenreSelect={onGenreSelect}
                        onToggleCrate={toggleCrate}
                        crate={crate}
                        user={user}
                        onPlay={playTrack}
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                    />
                </section>
            </div>
        </div>
    );
};
