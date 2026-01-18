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
          <input 
            type="text"
            placeholder="Artist, Track or Remix..."
            value={searchTerm} // Conectamos el valor al estado
            onChange={(e) => setSearchTerm(e.target.value)} // Capturamos lo que escribes
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#ff0055] outline-none transition-all placeholder:text-gray-600"
          />
        </div>

        {/* Filtro BPM (Estático por ahora) */}
        <div className="relative">
          <select className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-sm outline-none appearance-none cursor-pointer text-gray-400 focus:border-[#ff0055] transition-all">
            <option>All BPM</option>
            <option>70 - 100</option>
            <option>100 - 120</option>
            <option>120 - 130</option>
            <option>130+</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▼</div>
        </div>

        {/* Filtro Key (Estático por ahora) */}
        <div className="relative">
          <select className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-sm outline-none appearance-none cursor-pointer text-gray-400 focus:border-[#ff0055] transition-all">
            <option>All Keys</option>
            <option>Camelot A</option>
            <option>Camelot B</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▼</div>
        </div>
      </div>
    </div>
  );
}