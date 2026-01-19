import React from 'react';
import { Zap } from 'lucide-react';

interface TrendsProps {
  onToggleCrate: (track: any) => void;
  crate: any[];
}

export function Trends({ onToggleCrate, crate }: TrendsProps) {
  
  const trendingPicks = [
    { 
      id: 101, 
      title: "Tech House Essentials", 
      artist: "DJ Selection", 
      tag: "HOT", 
      img: "https://images.unsplash.com/photo-1571266028243-371695039980?auto=format&fit=crop&q=80&w=200"
    },
    { 
      id: 102, 
      title: "Melodic Techno Peaks", 
      artist: "Afterlife Style", 
      tag: "TRENDING", 
      img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200"
    },
    { 
      id: 103, 
      title: "Afro House Rituals", 
      artist: "Tribal Beats", 
      tag: "NEW", 
      img: "https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&q=80&w=200"
    },
    { 
      id: 104, 
      title: "Latin Mainstage", 
      artist: "Festival Season", 
      tag: "VIRAL", 
      img: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=200"
    }
  ];

  const marqueeItems = [...trendingPicks, ...trendingPicks, ...trendingPicks];

  return (
    <section className="relative w-full bg-[#080808] border-y border-white/5 py-6 overflow-hidden mt-10 mb-10">
      
      {/* Indicador de sección fijo */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-[#080808]/90 backdrop-blur-md flex items-center px-8 border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          <Zap size={16} className="text-[#ff0055] fill-[#ff0055] animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Hot Picks</span>
        </div>
      </div>

      {/* Contenedor del movimiento */}
      <div className="flex overflow-hidden">
        <div className="flex animate-marquee items-center gap-16 pl-52">
          {marqueeItems.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="group flex items-center gap-5 cursor-pointer"
            >
              {/* Esfera con Imagen */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#ff0055] transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Badge de Tag sobre la esfera */}
                <div className="absolute -top-1 -right-1 bg-[#ff0055] text-[7px] font-black px-1.5 py-0.5 rounded-full text-white shadow-lg">
                  {item.tag}
                </div>
              </div>

              {/* Información de la canción */}
              <div className="flex flex-col min-w-[150px]">
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
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}