import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track } from '../types';

import { getTrackUrl } from '../utils/urlUtils';

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    queue: Track[];
    playTrack: (track: Track) => void;
    playQueue: (tracks: Track[], startIndex?: number) => void;
    togglePlay: () => void;
    play: () => void;
    pause: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
    token?: string;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Auth state
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | undefined>(undefined);

    // Player state - CRITICAL: These were missing!
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Get Session Token for Audio Auth
    useEffect(() => {
        import('../supabase').then(({ supabase }) => {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    setToken(session.access_token);
                    setUser(session.user);
                }
            });

            supabase.auth.onAuthStateChange((_event, session) => {
                if (session) {
                    setToken(session.access_token);
                    setUser(session.user);
                } else {
                    setToken(undefined);
                    setUser(null);
                }
            });
        });
    }, []);


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
            // Generate Stream URL using central utility + SECURITY TOKEN
            // We force recalculation here to ensure token is fresh
            if (!normalizedTrack.streamUrl || token) {
                normalizedTrack.streamUrl = getTrackUrl(normalizedTrack, false, token);
            }

            setCurrentTrack(normalizedTrack);
            // If playing a single track, it becomes the only item in queue or just current
            // For simplicity, let's say playing a single track clears queue or adds to it?
            // Let's just set it as current and clear queue to avoid confusion unless we want to keep context
            setQueue([normalizedTrack]);
            setCurrentIndex(0);
            setIsPlaying(true);
        }
    };

    const playQueue = (tracks: Track[], startIndex = 0) => {
        if (!tracks || tracks.length === 0) return;

        // Normalize all
        const normalizedTracks = tracks.map(t => ({
            ...t,
            id: t.id || t.name || 'unknown-id',
            title: t.title || t.name || 'Unknown Title',
            streamUrl: getTrackUrl(t, false, token), // Always refresh with token
            file_path: t.file_path || t.server_path || '',
        }));

        setQueue(normalizedTracks);
        setCurrentIndex(startIndex);
        setCurrentTrack(normalizedTracks[startIndex]);
        setIsPlaying(true);
    };

    const nextTrack = () => {
        if (queue.length === 0) return;
        const nextIndex = currentIndex + 1;
        if (nextIndex < queue.length) {
            setCurrentIndex(nextIndex);
            setCurrentTrack(queue[nextIndex]);
            setIsPlaying(true);
        }
    };

    const prevTrack = () => {
        if (queue.length === 0) return;
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            setCurrentIndex(prevIndex);
            setCurrentTrack(queue[prevIndex]);
            setIsPlaying(true);
        } else {
            // Optional: restart current track if at beginning?
            // For now just do nothing or maybe reset time
        }
    };

    const togglePlay = () => setIsPlaying(!isPlaying);
    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(false);

    return (
        <PlayerContext.Provider value={{ currentTrack, isPlaying, queue, playTrack, playQueue, togglePlay, play, pause, nextTrack, prevTrack, token }}>
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
