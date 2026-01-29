import React, { createContext, useContext, useState, useCallback } from 'react';
import { Track } from '../types';


interface SearchContextType {
    serverTracks: Track[];
    totalServerTracks: number;
    hasMore: boolean;
    serverPage: number;
    loading: boolean;
    lastSearchTerm: string;
    error: string | null;
    search: (term: string, page?: number) => Promise<void>;
    loadMore: () => Promise<void>;
    resetSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [serverTracks, setServerTracks] = useState<Track[]>([]);
    const [totalServerTracks, setTotalServerTracks] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [serverPage, setServerPage] = useState(1);
    const [lastSearchTerm, setLastSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (term: string, page: number = 1) => {
        if (!term.trim()) return;

        setLoading(true);
        setError(null);
        if (page === 1) setLastSearchTerm(term);

        try {
            // Búsqueda directa en Supabase (tabla dj_tracks)
            const { supabase } = await import('../supabase');

            // Usamos ilike para búsqueda insensible a mayúsculas
            const { data, error, count } = await supabase
                .from('dj_tracks')
                .select('*', { count: 'exact' })
                .ilike('name', `%${term}%`)
                .range((page - 1) * 50, page * 50 - 1);

            if (error) throw error;

            const rawResults = data || [];

            // Normalize DB results to Frontend properties
            const results = rawResults.map((t: any) => ({
                ...t,
                name: t.title || t.name || 'Unknown',
                artist: t.artist || 'Unknown Artist',
                file_path: t.file_path,
                id: t.id
            }));

            setServerPage(page);
            setHasMore(rawResults.length === 50);
            setTotalServerTracks(count || 0);

            if (page === 1) {
                setServerTracks(results as unknown as Track[]);
            } else {
                setServerTracks(prev => [...prev, ...results as unknown as Track[]]);
            }

        } catch (e: any) {
            console.error("Error searching:", e);
            setError(e.message || 'Error connecting to database');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (hasMore && !loading) {
            setServerPage(prev => {
                const nextPage = prev + 1;
                // Use lastSearchTerm from closure, search with next page
                search(lastSearchTerm, nextPage);
                return nextPage;
            });
        }
    }, [hasMore, loading, lastSearchTerm, search]);

    const resetSearch = useCallback(() => {
        setServerTracks([]);
        setTotalServerTracks(0);
        setHasMore(true);
        setServerPage(1);
        setLastSearchTerm('');
        setError(null);
    }, []);

    return (
        <SearchContext.Provider value={{
            serverTracks,
            totalServerTracks,
            hasMore,
            serverPage,
            loading,
            lastSearchTerm,
            error,
            search,
            loadMore,
            resetSearch
        }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
