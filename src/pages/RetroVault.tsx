import React, { useMemo } from 'react';
import { LatestUploads } from '../app/components/LatestUploads';
import { usePlayer } from '../context/PlayerContext';
import { useCrate } from '../context/CrateContext';
import { Disc, Sparkles } from 'lucide-react';

interface RetroVaultProps {
    realTracks: any[];
    user: any;
}

export const RetroVault: React.FC<RetroVaultProps> = ({ realTracks, user }) => {
    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const { crate, toggleCrate } = useCrate();

    const retroTracks = useMemo(() => {
        const keywords = ['80s', '90s', '00s', 'old school', 'retro', 'classic', 'back in the day', 'throwback'];
        if (!realTracks) return [];
        return realTracks.filter(t => {
            // Safeguard against missing properties
            const title = t.title || '';
            const artist = t.artist || '';
            const path = t.file_path || t.filename || ''; // Changed t.path to t.file_path

            const text = (title + artist + path).toLowerCase();
            return keywords.some(k => text.includes(k));
        });
    }, [realTracks]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                        <Disc size={32} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                            Retro <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Vault</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">
                            The Golden Era Collection • 80s / 90s / 00s
                        </p>
                    </div>
                </div>
                <div className="h-px bg-white/5 w-full" />
            </div>

            {/* Content using Standard List Component */}
            <section>
                <LatestUploads
                    tracks={retroTracks}
                    selectedGenre={null}
                    onGenreSelect={() => { }}
                    onToggleCrate={toggleCrate}
                    crate={crate}
                    user={user}
                    onPlay={playTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                />
            </section>
        </div>
    );
};
