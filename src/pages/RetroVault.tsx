import React from 'react';
import PoolGrid from '../app/components/PoolGrid';
import { Disc } from 'lucide-react';

interface RetroVaultProps {
    realTracks: any[];
    user: any;
}

export const RetroVault: React.FC<RetroVaultProps> = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 mb-4">
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

            {/* Folder Navigation (using PoolGrid logic) */}
            <section className="min-h-[60vh]">
                <PoolGrid overridePoolId="RETRO_VAULT" />
            </section>
        </div>
    );
};
