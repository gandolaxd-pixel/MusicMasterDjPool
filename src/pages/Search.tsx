import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LatestUploads } from '../app/components/LatestUploads';
import { EmptyState } from '../app/components/EmptyState';
import { SearchFilters } from '../app/components/SearchFilters';
import { usePlayer } from '../context/PlayerContext';
import { useSearch } from '../context/SearchContext';
import { useCrate } from '../context/CrateContext';

interface SearchPageProps {
    user: any;
}

export const SearchPage: React.FC<SearchPageProps> = ({ user }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(query);

    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const { serverTracks, totalServerTracks, hasMore, loadMore, search, loading, error, resetSearch } = useSearch();
    const { crate, toggleCrate } = useCrate();

    useEffect(() => {
        setSearchTerm(query);
    }, [query]);

    useEffect(() => {
        const term = searchTerm.trim();
        const timeoutId = window.setTimeout(() => {
            if (term === query) return;
            if (!term) {
                setSearchParams({});
                return;
            }
            setSearchParams({ q: term });
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm, query, setSearchParams]);

    useEffect(() => {
        if (!query.trim()) {
            resetSearch();
            return;
        }

        const timeoutId = window.setTimeout(() => {
            search(query);
        }, 350);

        return () => window.clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]); // Only re-run when query changes, functions are stable

    return (
        <section className="space-y-12 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-8">
                <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                    Search <span className="text-[#ff0055]">Results</span>
                    <span className="ml-4 text-sm text-gray-500 font-normal">({totalServerTracks} found)</span>
                    </h2>
                    {loading && (
                        <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">Buscando…</p>
                    )}
                    {error && (
                        <p className="mt-2 text-xs uppercase tracking-widest text-red-400">Error: {error}</p>
                    )}
                </div>
                <button type="button" onClick={() => navigate('/')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full" aria-label="Volver al inicio">
                    ← Back
                </button>
            </div>

            <SearchFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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
                loading={loading}
            />

            {!loading && query.trim() && serverTracks.length === 0 && !error && (
                <EmptyState
                    title="No hay resultados"
                    description={`No encontramos resultados para “${query}”. Prueba con otro artista, título o pack.`}
                />
            )}
            {!loading && error && serverTracks.length === 0 && (
                <EmptyState
                    title="Error al buscar"
                    description="No se pudo completar la búsqueda. Intenta nuevamente."
                />
            )}

            {hasMore && (
                <button
                    onClick={() => loadMore()}
                    className="mx-auto block bg-white/5 border border-white/10 px-8 py-3 rounded-full hover:bg-[#ff0055] transition-all font-bold uppercase text-xs tracking-widest disabled:opacity-50"
                    disabled={loading}
                >
                    Load More Results
                </button>
            )}
        </section>
    );
};
