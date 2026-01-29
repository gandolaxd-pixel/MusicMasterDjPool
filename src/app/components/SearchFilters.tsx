import { Search, X } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function SearchFilters({ searchTerm, setSearchTerm }: SearchFiltersProps) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
      {/* Barra de búsqueda - ancho completo */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-gray-500 pointer-events-none" size={20} />
        <input 
          type="text"
          placeholder="Artist, Track or Remix..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar por artista, track o remix"
          className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-24 text-sm text-white focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] outline-none transition-all placeholder:text-gray-600"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-4 flex items-center gap-1.5 text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>
      <p className="mt-3 text-[10px] text-gray-600 uppercase tracking-widest">Escribe para filtrar resultados</p>
    </div>
  );
}
