import { Search } from 'lucide-react';

export function SearchFilters() {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Barra de búsqueda */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text"
            placeholder="Artist, Track or Remix..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-[#ff0055] outline-none transition-all"
          />
        </div>
        {/* Filtro BPM */}
        <div className="relative">
          <select className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-sm outline-none appearance-none cursor-pointer text-gray-400">
            <option>All BPM</option>
            <option>70 - 100</option>
            <option>100 - 120</option>
            <option>120 - 130</option>
            <option>130+</option>
          </select>
        </div>
        {/* Filtro Key */}
        <div className="relative">
          <select className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-sm outline-none appearance-none cursor-pointer text-gray-400">
            <option>All Keys</option>
            <option>Camelot A</option>
            <option>Camelot B</option>
          </select>
        </div>
      </div>
    </div>
  );
}