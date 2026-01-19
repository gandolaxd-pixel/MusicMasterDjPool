import React from 'react';
import { Zap, Disc, ArrowRight } from 'lucide-react';

interface TrendsProps {
  onToggleCrate: (track: any) => void;
  crate: any[];
}

export function Trends({ onToggleCrate, crate }: TrendsProps) {
  
  const trendingPicks = [
    { id: 101, title: "Tech House Essentials", subtitle: "DJ Selection", tag: "HOT" },
    { id: 102, title: "Melodic Techno Peaks", subtitle: "Afterlife Style", tag: "TRENDING" },
    { id: 103, title: "Afro House Rituals", subtitle: "Tribal Beats", tag: "NEW" },
    { id: 104, title: "Latin Mainstage", subtitle: "Festival Season", tag: "VIRAL" }
  ];

  // Duplicamos el array para que el efecto infinito no tenga saltos
  const marqueeItems = [...trendingPicks, ...trendingPicks];

  return (
    <section className="relative w-full bg-[#0a0a0a] border-y border-white/5 py-3 overflow-hidden mt-10 mb-10">
      
      {/* Etiqueta fija "LIVE" a la izquierda */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-[#0a0a0a] flex items-center px-6 border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0055] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff0055]"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Hot Picks</span>
        </div>
      </div>

      {/* Contenedor de la Animación */}
      <div className="flex no-scrollbar overflow-hidden select-none">
        <div className="flex animate-marquee whitespace-nowrap items-center gap-16 pl-44">
          {marqueeItems.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="group flex items-center gap-6 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            >
              {/* Tag pequeño estilo neón */}
              <span className="text-[8px] font-black text-[#ff0055] border border-[#ff0055]/30 bg-[#ff0055]/5 px-2 py-0.5 rounded uppercase tracking-tighter">
                {item.tag}
              </span>

              {/* Texto del Track */}
              <div className="flex items-baseline gap-3">
                <h3 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-[#ff0055] transition-colors">
                  {item.title}
                </h3>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  {item.subtitle}
                </span>
              </div>

              {/* Separador visual */}
              <Disc size={14} className="text-white/10 group-hover:text-[#ff0055] group-hover:animate-spin-slow transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Inyección de CSS para la animación */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}