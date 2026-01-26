import React from 'react';
import DJPacks from '../app/components/DjPacks';
import { usePlayer } from '../context/PlayerContext';

interface PacksPageProps {
    user: any;
    isPlaying?: boolean;
    currentTrack?: any;
    onPlay?: (track: any) => void;
}

export const PacksPage: React.FC<PacksPageProps> = ({
    user
}) => {
    const { playTrack, currentTrack, isPlaying } = usePlayer();

    return (
        <div className="animate-in fade-in duration-700">
            <DJPacks
                user={user}
                isPlaying={isPlaying}
                currentTrack={currentTrack}
                onPlay={playTrack}
            />
        </div>
    );
};
