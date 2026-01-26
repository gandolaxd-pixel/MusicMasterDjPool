import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LatestUploads } from '../app/components/LatestUploads';
import { usePlayer } from '../context/PlayerContext';
import { useSearch } from '../context/SearchContext';
import { useCrate } from '../context/CrateContext';

interface SearchPageProps {
    user: any;
}

export const SearchPage: React.FC<SearchPageProps> = ({ user }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const { serverTracks, totalServerTracks, hasMore, loadMore, search } = useSearch();
    const { crate, toggleCrate } = useCrate();

    useEffect(() => {
        if (query) {
            search(query);
        }
    }, [query]);

    return (
        <section className="space-y-12 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-8">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                    Search <span className="text-[#ff0055]">Results</span>
                    <span className="ml-4 text-sm text-gray-500 font-normal">({totalServerTracks} found)</span>
                </h2>
                <button onClick={() => navigate('/')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full">
                    ← Back
                </button>
            </div>

            <LatestUploads
                tracks={serverTracks}
                selectedGenre={null}
                onGenreSelect={() => { }}
                onToggleCrate={toggleCrate}
                crate={crate}
                user={user}
                onPlay={playTrack}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
            />

            {hasMore && (
                <button
                    onClick={() => loadMore()}
                    className="mx-auto block bg-white/5 border border-white/10 px-8 py-3 rounded-full hover:bg-[#ff0055] transition-all font-bold uppercase text-xs tracking-widest"
                >
                    Load More Results
                </button>
            )}
        </section>
    );
};
