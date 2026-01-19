import React from 'react';
import { Package, Download, Music, FolderArchive, Clock } from 'lucide-react';

export function DjPacks() {
  // Estos nombres coinciden con las carpetas de tu servidor Hetzner
  const packs = [
    {
      id: 1,
      title: "Crate Connect",
      description: "Exclusive curated selections from the Crate Connect record pool.",
      tag: "RECORD POOL",
      img: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 2,
      title: "MMP Packs",
      description: "Massive Music Pool latest urban and mainstream transitions.",
      tag: "URBAN",
      img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 3,
      title: "Traxsource Packs",
      description: "Deep House, Soulful and Tech House monthly new releases.",
      tag: "ELECTRONIC",
      img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 4,
      title: "Cuba Remix",
      description: "The best latin remixes and exclusive cuban edits.",
      tag: "LATIN",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 5,
      title: "Unlimited Latin",
      description: "Full collection of tropical, salsa and merengue packs.",
      tag: "TROPICAL",
      img: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 6,
      title: "Da Throwbackz",
      description: "Classic retro gems and old school essentials for your set.",
      tag: "RETRO",
      img: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=400"
    }
  ];

  return (
    <section id="charts" className="py-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#ff0055]/10 border border-[#ff0055]/20 rounded-full w-fit">
            <Package size={14} className="text-[#ff0055]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Cloud Storage Packs</span>
          </div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">
            DJ <span className="text-[#ff0055]">Packs</span>
          </h2>
        </div>
        <div className="hidden md:block">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Updated Weekly • High Quality 320kbps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div 
            key={pack.id} 
            className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#ff0055]/40 transition-all duration-500 shadow-2xl"
          >
            {/* Cabecera con Imagen */}
            <div className="h-52 overflow-hidden relative">
              <img 
                src={pack.img} 
                alt={pack.title} 
                className="w-full h-full object-cover opacity-50 group-hover:scale-110 group-hover:opacity-30 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
              
              {/* Overlay con icono grande */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <FolderArchive className="text-[#ff0055] w-12 h-12" />
              </div>
            </div>

            {/* Contenido flotante */}
            <div className="p-8 relative -mt-12 bg-gradient-to-b from-transparent to-[#0a0a0a]">
              <div className="mb-4">
                <span className="text-[9px] font-black text-[#ff0055] uppercase tracking-widest border border-[#ff0055]/30 px-2 py-1 rounded-md">
                  {pack.tag}
                </span>
              </div>
              
              <h3 className="text-2xl font-black uppercase italic text-white group-hover:text-[#ff0055] transition-colors mb-3 tracking-tighter">
                {pack.title}
              </h3>
              
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8 h-12 line-clamp-2">
                {pack.description}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-600" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">New Content</span>
                </div>

                <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff0055] hover:text-white transition-all shadow-lg active:scale-95">
                  <Download size={14} /> Open Pack
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}