import { Play, Heart, Flame } from 'lucide-react';

interface TrendsProps {
  onToggleCrate: (track: any) => void;
  crate: any[];
}

export function Trends({ onToggleCrate, crate }: TrendsProps) {
  
  const trendingPicks = [
    { 
      id: 101, 
      title: "Tech House Essentials", 
      subtitle: "DJ Selection", 
      tag: "HOT", 
      bg: "from-purple-900 to-black",
      img: "https://images.unsplash.com/photo-1571266028243-371695039980?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 102, 
      title: "Melodic Techno Peaks", 
      subtitle: "Afterlife Style", 
      tag: "TRENDING", 
      bg: "from-blue-900 to-black",
      img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 103, 
      title: "Afro House Rituals", 
      subtitle: "Tribal Beats", 
      tag: "NEW", 
      bg: "from-orange-900 to-black",
      img: "https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 104, 
      title: "Latin Mainstage", 
      subtitle: "Festival Season", 
      tag: "VIRAL", 
      bg: "from-red-900 to-black",
      img: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    // CAMBIO: Cambiado de '-mt-10' a 'mt-10' para bajar la sección
    <section className="relative z-10 mt-10 mb-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Título de Sección */}
        <div className="flex items-center gap-3 mb-8">
          <Flame className="text-[#ff0055]" size={28} />
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Hot <span className="text-[#ff0055]">Picks</span>
          </h2>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingPicks.map((item) => (
            <div 
              key={item.id}
              className="group relative h-64 w-full rounded-2xl overflow-hidden border border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-[#ff0055]/50 shadow-lg"
            >
              {/* Imagen de Fondo */}
              <img 
                src={item.img} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
              />
              
              <div className={`absolute inset-0 bg-gradient-to-t ${item.bg} opacity-80 mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

              {/* Contenido */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                
                {/* Cabecera */}
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-[#ff0055] text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-[0_0_10px_rgba(255,0,85,0.4)]">
                    {item.tag}
                  </span>
                  
                  <button className="p-2.5 rounded-full bg-black/20 backdrop-blur-md hover:bg-[#ff0055] transition-colors text-white">
                    <Heart size={16} />
                  </button>
                </div>

                {/* Pie */}
                <div>
                  <h3 className="text-2xl font-black uppercase italic leading-none mb-2 text-white group-hover:text-[#ff0055] transition-colors drop-shadow-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
                    {item.subtitle}
                  </p>
                  
                  {/* Botón Play */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
                      <div className="w-8 h-8 rounded-full bg-[#ff0055] flex items-center justify-center shadow-lg">
                        <Play size={12} fill="currentColor" />
                      </div>
                      Play Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}