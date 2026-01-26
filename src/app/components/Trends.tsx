import { Zap, Download } from 'lucide-react';
import { useMemo } from 'react';

// Fake User Database
const FAKE_USERS = [
  { name: "DJ Lucaz", avatar: "https://i.pravatar.cc/150?u=20" },
  { name: "Mariano Franco", avatar: "https://i.pravatar.cc/150?u=21" },
  { name: "DJ K-Libre", avatar: "https://i.pravatar.cc/150?u=22" },
  { name: "Alex Mix", avatar: "https://i.pravatar.cc/150?u=23" },
  { name: "DJ Tuto", avatar: "https://i.pravatar.cc/150?u=24" },
  { name: "Matias J.", avatar: "https://i.pravatar.cc/150?u=25" },
  { name: "DJ Shadow", avatar: "https://i.pravatar.cc/150?u=26" },
  { name: "Urban Killaz", avatar: "https://i.pravatar.cc/150?u=27" },
  { name: "DJ Flow", avatar: "https://i.pravatar.cc/150?u=28" },
  { name: "Remix King", avatar: "https://i.pravatar.cc/150?u=29" },
  { name: "DJ Nova", avatar: "https://i.pravatar.cc/150?u=30" },
  { name: "SoundMaster", avatar: "https://i.pravatar.cc/150?u=31" },
];

interface TrendsProps {
  tracks: any[];
}

export function Trends({ tracks }: TrendsProps) {

  // Generate fake activity feed based on real tracks
  const activities = useMemo(() => {
    if (!tracks || tracks.length === 0) return [];

    // Create 10 fake activities
    return Array.from({ length: 10 }).map((_, i) => {
      const user = FAKE_USERS[i % FAKE_USERS.length];
      const track = tracks[i % tracks.length];
      return {
        id: i,
        user,
        track,
        action: "downloaded",
        time: `${Math.floor(Math.random() * 59) + 1}m Is`
      };
    });
  }, [tracks]);

  // If no tracks yet, show some placeholders
  const displayItems = activities.length > 0 ? activities : [
    { id: 999, user: FAKE_USERS[0], track: { title: "Loading...", artist: "..." }, action: "joined" }
  ];

  // Duplicamos para el efecto marquee infinito
  const marqueeItems = [...displayItems, ...displayItems];

  return (
    <section className="relative w-full bg-[#080808] border-y border-white/5 py-4 mt-6 mb-8 overflow-hidden">

      {/* Indicador Fijo */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-[#080808]/90 backdrop-blur-lg flex items-center px-6 border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.8)] pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap size={14} className="text-[#ff0055] fill-[#ff0055]" />
            <div className="absolute inset-0 bg-[#ff0055] blur-md opacity-40 animate-pulse"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live <span className="text-[#ff0055]">Feed</span></span>
        </div>
      </div>

      {/* Contenedor Marquee */}
      <div className="flex overflow-hidden">
        <div className="flex animate-marquee items-center gap-12 pl-48 hover:pause-marquee">
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center gap-3 flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity select-none"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                  <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-[#080808]"></div>
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-300">{item.user.name}</span>
                  <span className="text-[9px] text-gray-500 uppercase font-medium">downloaded</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download size={10} className="text-[#ff0055]" />
                  <span className="text-[11px] font-bold text-white max-w-[150px] truncate">{item.track.title || item.track.name}</span>
                </div>
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
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}