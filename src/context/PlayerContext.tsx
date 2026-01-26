import React, { createContext, useContext, useState } from 'react';
import { Track } from '../types';

import { getTrackUrl } from '../utils/urlUtils';

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    play: () => void;
    pause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playTrack = (track: Track) => {
        // Normalizar track para asegurar compatibilidad
        // Si viene del componente DJPacks, a veces trae 'name' en lugar de 'title'
        const normalizedTrack: Track = {
            ...track,
            id: track.id || track.name || 'unknown-id',
            title: track.title || track.name || 'Unknown Title',
            file_path: track.file_path || track.server_path || '',
        };

        if (currentTrack && (currentTrack.id === normalizedTrack.id || currentTrack.title === normalizedTrack.title)) {
            setIsPlaying(!isPlaying);
        } else {
            // Generate Stream URL using central utility
            if (!normalizedTrack.streamUrl) {
                normalizedTrack.streamUrl = getTrackUrl(normalizedTrack);
            }
            setCurrentTrack(normalizedTrack);
            setIsPlaying(true);
        }
    };

    const togglePlay = () => setIsPlaying(!isPlaying);
    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(false);

    return (
        <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlay, play, pause }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
