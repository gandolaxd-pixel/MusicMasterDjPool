import { Play, TrendingUp, TrendingDown, Minus, Lock, Download } from 'lucide-react';
import { useState, useMemo } from 'react';

// Mapa de colores consistente
const GENRE_COLORS: Record<string, string> = {
  'House': '#ff0055',
  'Tech House': '#ff6b00',
  'Afro House': '#ffcc00',
  'Hip Hop': '#00ffcc',
  'Open Format': '#00d4ff',
  'Latin': '#9d00ff',
};

const chartCategories = ['Overall', 'House', 'Hip Hop', 'Latin', 'Afro House'];

// Datos estáticos (Mantenemos tus datos para consistencia)
const chartsData = {
  Overall: [
    { position: 1, title: 'Midnight Pulse (Extended)', artist: 'Marco Carola', bpm: 128, genre: 'Tech House', trend: 'up', movement: 3 },
    { position: 2, title: 'Summer Breeze', artist: 'Black Coffee', bpm: 122, genre: 'Afro House', trend: 'up', movement: 5 },
    { position: 3, title: 'Club Fever', artist: 'Fisher', bpm: 125, genre: 'House', trend: 'same', movement: 0 },
    { position: 4, title: 'Urban Nights', artist: 'DJ Premier', bpm: 95, genre: 'Hip Hop', trend: 'down', movement: 1 },
    { position: 5, title: 'Latin Fire (DJ Edit)', artist: 'Bad Bunny', bpm: 98, genre: 'Latin', trend: 'up', movement: 2 },
    { position: 6, title: 'Deep Rhythm', artist: 'Dixon', bpm: 120, genre: 'Tech House', trend: 'new', movement: 0 },
    { position: 7, title: 'Soul Sensation', artist: 'Kerri Chandler', bpm: 124, genre: 'House', trend: 'up', movement: 4 },
    { position: 8, title: 'Trap Wave', artist: 'Metro Boomin', bpm: 140, genre: 'Hip Hop', trend: 'down', movement: 2 },
    { position: 9, title: 'Tribal Drums', artist: 'Themba', bpm: 123, genre: 'Afro House', trend: 'up', movement: 6 },
    { position: 10, title: 'Reggaeton Heat', artist: 'J Balvin', bpm: 96, genre: 'Latin', trend: 'same', movement: 0 },
  ],
  House: [
    { position: 1, title: 'Club Fever', artist: 'Fisher', bpm: 125, genre: 'House', trend: 'up', movement: 1 },
    { position: 2, title: 'Soul Sensation', artist: 'Kerri Chandler', bpm: 124, genre: 'House', trend: 'same', movement: 0 },
    { position: 3, title: 'Dance Floor Anthem', artist: 'Chris Lake', bpm: 126, genre: 'House', trend: 'up', movement: 3 },
    { position: 4, title: 'Groove Theory', artist: 'Green Velvet', bpm: 128, genre: 'House', trend: 'new', movement: 0 },
    { position: 5, title: 'Bass Revolution', artist: 'Solardo', bpm: 127, genre: 'House', trend: 'down', movement: 2 },
  ],
  'Hip Hop': [
    { position: 1, title: 'Urban Nights', artist: 'DJ Premier', bpm: 95, genre: 'Hip Hop', trend: 'up', movement: 2 },
    { position: 2, title: 'Trap Wave', artist: 'Metro Boomin', bpm: 140, genre: 'Hip Hop', trend: 'same', movement: 0 },
    { position: 3, title: 'Street Anthem', artist: 'DJ Khaled', bpm: 85, genre: 'Hip Hop', trend: 'up', movement: 1 },
    { position: 4, title: 'Boom Bap Classic', artist: 'The Alchemist', bpm: 92, genre: 'Hip Hop', trend: 'new', movement: 0 },
    { position: 5, title: 'Club Banger', artist: 'Mustard', bpm: 100, genre: 'Hip Hop', trend: 'down', movement: 3 },
  ],
  Latin: [
    { position: 1, title: 'Latin Fire (DJ Edit)', artist: 'Bad Bunny', bpm: 98, genre: 'Latin', trend: 'up', movement: 1 },
    { position: 2, title: 'Reggaeton Heat', artist: 'J Balvin', bpm: 96, genre: 'Latin', trend: 'same', movement: 0 },
    { position: 3, title: 'Perreo Intenso', artist: 'Karol G', bpm: 94, genre: 'Latin', trend: 'up', movement: 4 },
    { position: 4, title: 'Salsa Remix', artist: 'Marc Anthony', bpm: 102, genre: 'Latin', trend: 'new', movement: 0 },
    { position: 5, title: 'Bachata Nights', artist: 'Romeo Santos', bpm: 120, genre: 'Latin', trend: 'down', movement: 1 },
  ],
  'Afro House': [
    { position: 1, title: 'Summer Breeze', artist: 'Black Coffee', bpm: 122, genre: 'Afro House', trend: 'up', movement: 2 },
    { position: 2, title: 'Tribal Drums', artist: 'Themba', bpm: 123, genre: 'Afro House', trend: 'same', movement: 0 },
    { position: 3, title: 'African Spirit', artist: 'Shimza', bpm: 121, genre: 'Afro House', trend: 'up', movement: 3 },
    { position: 4, title: 'Jungle Rhythm', artist: 'Culoe De Song', bpm: 120, genre: 'Afro House', trend: 'new', movement: 0 },
    { position: 5, title: 'Desert Dance', artist: 'Manoo', bpm: 119, genre: 'Afro House', trend: 'down', movement: 2 },
  ],
};

// Eliminamos Props innecesarias, usaremos el usuario que viene de App.tsx si decides pasarlo
export function Charts({ user }: { user?: any }) {
  const [activeCategory, setActiveCategory] = useState('Overall');

  const getTrendIcon = (trend: string, movement: number) => {
    if (trend === 'new') return <span className="text-blue-400 text-[10px] font-black italic tracking-widest">NEW</span>;
    if (trend === 'up') return (
      <div className="flex items-center gap-1 text-green-500 font-bold">
        <TrendingUp size={14} />
        <span className="text-[10px]">+{movement}</span>
      </div>
    );
    if (trend === 'down') return (
      <div className="flex items-center gap-1 text-red-500 font-bold">
        <TrendingDown size={14} />
        <span className="text-[10px]">-{movement}</span>
      </div>
    );
    return <Minus size={14} className="text-gray-700" />;
  };

  const currentCharts = useMemo(() => chartsData[activeCategory as keyof typeof chartsData], [activeCategory]);

  return (
    <section id="charts" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4 italic uppercase tracking-tighter">
            Top <span className="text-[#ff0055]">Charts</span>
          </h2>
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.3em]">
            Most downloaded tracks worldwide
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {chartCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === category
                  ? 'bg-[#ff0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.4)]'
                  : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Charts Table - Optimización de Renderizado */}
        <div className="space-y-3">
          {currentCharts.map((track) => {
            const trackColor = GENRE_COLORS[track.genre] || '#ff0055';

            return (
              <div
                key={`${activeCategory}-${track.position}`}
                className="group bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-all"
                style={{ borderLeft: '4px solid #ff0055' }}
              >
                <div className="flex-shrink-0 w-8 text-center">
                  <span className={`text-xl font-black italic ${
                    track.position === 1 ? 'text-[#ff0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.4)]' : 'text-gray-800'
                  }`}>
                    {track.position < 10 ? `0${track.position}` : track.position}
                  </span>
                </div>

                <button className="flex-shrink-0 w-10 h-10 bg-[#ff0055] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,0,85,0.2)]">
                  <Play size={16} className="text-white fill-white ml-0.5" />
                </button>

                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 items-center">
                  <div className="md:col-span-2 text-left">
                    <h3 className="text-white font-black truncate uppercase tracking-tight text-sm group-hover:text-[#ff0055] transition-colors">{track.title}</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{track.artist}</p>
                  </div>
                  
                  <div className="hidden lg:flex items-center gap-2">
                    <span className="text-gray-600 font-black text-[9px] uppercase tracking-widest">BPM</span>
                    <span className="text-white font-mono text-xs">{track.bpm}</span>
                  </div>

                  <div className="flex justify-start">
                    <span 
                      className="px-4 py-1 bg-black border rounded-full text-[9px] font-black uppercase tracking-[0.1em]"
                      style={{ color: trackColor, borderColor: `${trackColor}33` }}
                    >
                      {track.genre}
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    {getTrendIcon(track.trend, track.movement)}
                  </div>

                  <div className="flex items-center justify-end">
                    <button 
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${
                        user 
                        ? 'bg-[#ff0055] text-white hover:scale-105' 
                        : 'bg-white/5 border border-white/10 text-gray-600 hover:text-white'
                      }`}
                    >
                      {user ? <Download size={14} /> : <Lock size={14} />}
                      <span>{user ? 'DOWNLOAD' : 'LOCKED'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}