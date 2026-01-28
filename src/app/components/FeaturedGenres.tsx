
import { Music2, Waves, Globe, Mic2, Radio, Palmtree, Lock, ArrowRight } from 'lucide-react';

const genres = [
  { name: 'House', icon: Music2, color: '#ff0055', gradient: 'from-[#ff0055] to-orange-500' },
  { name: 'Tech House', icon: Waves, color: '#ff6b00', gradient: 'from-[#ff6b00] to-yellow-500' },
  { name: 'Afro House', icon: Globe, color: '#ffcc00', gradient: 'from-[#ffcc00] to-green-500' },
  { name: 'Hip Hop', icon: Mic2, color: '#00ffcc', gradient: 'from-[#00ffcc] to-blue-500' },
  { name: 'Open Format', icon: Radio, color: '#00d4ff', gradient: 'from-[#00d4ff] to-purple-500' },
  { name: 'Latin', icon: Palmtree, color: '#9d00ff', gradient: 'from-[#9d00ff] to-red-500' },
];

interface FeaturedGenresProps {
  onGenreSelect: (name: string) => void;
  activeGenre: string | null;
  user: any;
}

export function FeaturedGenres({ onGenreSelect, activeGenre, user }: FeaturedGenresProps) {

  const handleGenreClick = (genreName: string) => {
    if (!user) {
      window.location.href = '#plans'; // O abrir modal
    } else {
      onGenreSelect(genreName);
    }
  };

  return (
    <section id="genres" className="py-24 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4 italic uppercase tracking-tighter">
            Featured <span className="text-[#ff0055]">Genres</span>
          </h2>
          <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">
            {user ? `Filtering: ${activeGenre || 'All'}` : 'Curated for professionals'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {genres.map((genre) => {
            const Icon = genre.icon;
            const isSelected = activeGenre === genre.name;

            return (
              <div
                key={genre.name}
                onClick={() => handleGenreClick(genre.name)}
                className="group relative cursor-pointer"
              >
                {/* Caja estática optimizada */}
                <div
                  className={`relative bg-[#0f0f0f] border rounded-2xl p-6 transition-all duration-300 hover:bg-[#1a1a1a]`}
                  style={{
                    borderColor: isSelected ? genre.color : 'rgba(255,255,255,0.1)',
                    boxShadow: isSelected ? `0 0 20px ${genre.color}33` : 'none'
                  }}
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${genre.gradient} mb-4 shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>

                    <h3 className="font-black uppercase text-[10px] tracking-[0.2em] mb-3 text-white">
                      {genre.name}
                    </h3>

                    <div className="min-h-[20px] flex justify-center">
                      {user ? (
                        // Animación solo al hacer Hover (no infinita)
                        <ArrowRight size={16} className={`text-gray-600 group-hover:text-white transition-colors ${isSelected ? 'text-white' : ''}`} />
                      ) : (
                        <Lock size={12} className="text-gray-600" />
                      )}
                    </div>
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