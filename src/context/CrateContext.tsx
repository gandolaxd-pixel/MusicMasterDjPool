import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track } from '../types';

interface CrateContextType {
    crate: Track[];
    toggleCrate: (track: Track) => void;
    removeFromCrate: (trackId: string) => void;
    clearCrate: () => void;
    isInCrate: (trackId: string) => boolean;
}

const CrateContext = createContext<CrateContextType | undefined>(undefined);

export const CrateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [crate, setCrate] = useState<Track[]>([]);

    // 1. Cargar inicial desde localStorage
    useEffect(() => {
        const saved = localStorage.getItem('dj_crate');
        if (saved) {
            try {
                setCrate(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing crate from storage", e);
            }
        }
    }, []);

    // 2. Guardar en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('dj_crate', JSON.stringify(crate));
    }, [crate]);

    const toggleCrate = (track: Track) => {
        setCrate(prev => {
            const exists = prev.find(t => t.id === track.id);
            if (exists) {
                return prev.filter(t => t.id !== track.id);
            }
            // Limite opcional para evitar localStorage overflow
            if (prev.length >= 100) {
                alert("Crate is full (max 100 tracks)");
                return prev;
            }
            return [...prev, track];
        });
    };

    const removeFromCrate = (trackId: string) => {
        setCrate(prev => prev.filter(t => t.id !== trackId));
    };

    const clearCrate = () => setCrate([]);

    const isInCrate = (trackId: string) => crate.some(t => t.id === trackId);

    return (
        <CrateContext.Provider value={{ crate, toggleCrate, removeFromCrate, clearCrate, isInCrate }}>
            {children}
        </CrateContext.Provider>
    );
};

export const useCrate = () => {
    const context = useContext(CrateContext);
    if (context === undefined) {
        throw new Error('useCrate must be used within a CrateProvider');
    }
    return context;
};
