import React, { useRef } from 'react';
import { Zap } from 'lucide-react';

interface TrendsProps {
  onToggleCrate: (track: any) => void;
  crate: any[];
}

export function Trends({ onToggleCrate, crate }: TrendsProps) {
  
  const trendingPicks = [
    { id: 101, title: "Reggaeton Banger", artist: "Exclusive Remix", tag: "HOT", img: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200" },
    { id: 102, title: "Urban Latin Pack", artist: "Pro Edit v2", tag: "TRENDING", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200" },
    { id: 103, title: "Dembow Classics", artist: "Club Hype", tag: "NEW", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200" },
    { id: 104, title: "Tech House Latin", artist: "Dubai Special", tag: "VIRAL", img: "https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&q=80&w=200" },
    { id: 105, title: "Afro House Beats", artist: "Tribal Ritual", tag: "HOT", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=200" }
  ];

  // Duplicamos para asegurar que siempre haya contenido
  const marqueeItems = [...trendingPicks, ...trendingPicks, ...trendingPicks, ...trendingPicks];

  return (
    <section className="relative w-full bg-[#080808] border-y border-white/5 py-6 mt-10 mb-10 overflow-hidden">
      
      {/* Indicador Fijo */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-[#080808]/90 backdrop-blur-lg flex items-center px-8 border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.8)] pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap size={16} className="text-[#ff0055] fill-[#ff0055]" />
            <div className="absolute inset-0 bg-[#ff0055] blur-md opacity-40 animate-pulse"></div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Hot Picks</span>
        </div>
      </div>

      {/* Contenedor con Scroll del Trackpad */}
      <div className="flex overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing">
        <div className="flex animate-marquee items-center gap-16 pl-52 pr-20 hover:pause-marquee">
          {marqueeItems.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="group flex items-center gap-5 flex-shrink-0"
            >
              {/* Esfera */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#ff0055] group-hover:shadow-[0_0_20px_rgba(255,0,85,0.3)] transition-all duration-500">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    draggable="false"
                  />
                </div>
                <div className="absolute -top-1 -right-1 bg-[#ff0055] text-[7px] font-black px-1.5 py-0.5 rounded-full text-white">
                  {item.tag}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col select-none">
                <h3 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-[#ff0055] transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  {item.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        /* Ocultar barra de scroll para Macbook */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}