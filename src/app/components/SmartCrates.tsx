import { useNavigate } from 'react-router-dom';
import { Scissors, Repeat, Mic2, Layers, Disc, Radio, Wand2, Music } from 'lucide-react';

export function SmartCrates() {
    const navigate = useNavigate();

    const crates = [
        { name: 'Intro Edits', icon: Scissors, color: '#ff0055', query: 'intro' },
        { name: 'Redrums', icon: Layers, color: '#ff6b00', query: 'redrum' },
        { name: 'Transitions', icon: Repeat, color: '#ffcc00', query: 'transition' },
        { name: 'Acapellas', icon: Mic2, color: '#00ffcc', query: 'acapella' },
        { name: 'Throwbacks', icon: Disc, color: '#00d4ff', query: 'old school' },
        { name: 'Clean', icon: Wand2, color: '#9d00ff', query: 'clean' },
        { name: 'Instrumentals', icon: Music, color: '#ff00aa', query: 'instrumental' },
        { name: 'Exclusives', icon: Radio, color: '#ffffff', query: 'exclusive' },
    ];

    const handleCrateClick = (query: string) => {
        navigate(`/search?q=${query}`);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
            {crates.map((crate) => {
                const Icon = crate.icon;
                return (
                    <button
                        key={crate.name}
                        onClick={() => handleCrateClick(crate.query)}
                        className="group relative h-24 bg-[#111] border border-white/5 rounded-xl hover:border-[#ff0055] transition-all overflow-hidden flex flex-col items-center justify-center gap-2 hover:bg-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
                        <Icon
                            size={24}
                            className="text-gray-500 group-hover:text-white transition-colors z-10"
                            style={{ color: 'var(--icon-color)' }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white z-10 transition-colors">
                            {crate.name}
                        </span>
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff0055] opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: crate.color }}
                        />
                    </button>
                );
            })}
        </div>
    );
}
