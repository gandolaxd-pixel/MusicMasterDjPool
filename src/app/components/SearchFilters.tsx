import { Search } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function SearchFilters({ searchTerm, setSearchTerm }: SearchFiltersProps) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Barra de búsqueda */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs uppercase tracking-widest"
              aria-label="Limpiar búsqueda"
            >
              Clear
            </button>
          )}
          <input 
            type="text"
            placeholder="Artist, Track or Remix..."
            value={searchTerm} // Conectamos el valor al estado
            onChange={(e) => setSearchTerm(e.target.value)} // Capturamos lo que escribes
            aria-label="Buscar por artista, track o remix"
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-20 text-sm text-white focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] outline-none transition-all placeholder:text-gray-600"
          />
          <p className="mt-2 text-[10px] text-gray-600 uppercase tracking-widest">Escribe para filtrar resultados</p>
        </div>

        {/* Filtro BPM (Estático por ahora) */}
        <div>
          <label className="block text-[10px] text-gray-600 uppercase tracking-widest mb-2">BPM</label>
          <div className="relative">
            <select className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-sm outline-none appearance-none cursor-pointer text-gray-400 focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-all">
              <option>All BPM</option>
              <option>70 - 100</option>
              <option>100 - 120</option>
              <option>120 - 130</option>
              <option>130+</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▼</div>
          </div>
        </div>

        {/* Filtro Key (Estático por ahora) */}
        <div>
          <label className="block text-[10px] text-gray-600 uppercase tracking-widest mb-2">Key</label>
          <div className="relative">
            <select className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-sm outline-none appearance-none cursor-pointer text-gray-400 focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-all">
              <option>All Keys</option>
              <option>Camelot A</option>
              <option>Camelot B</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▼</div>
          </div>
        </div>
      </div>
    </div>
  );
}