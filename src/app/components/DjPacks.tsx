import { useState, useEffect } from 'react';
import { supabase } from '../../supabase'; 
import { Folder, Music, Download, ArrowLeft, Disc } from 'lucide-react';

// TU URL BASE (StorageBox)
const STORAGE_BASE = "https://u529624-sub1.your-storagebox.de/DJPACKS";

interface Pack {
  id: string;
  pool_id: string;         // Nombre bonito (ej: "ANDRIU UPDATE")
  original_folder: string; // Ruta relativa (ej: "2025/01 ENERO.../ANDRIU...")
  drop_month: string;      // Mes (ej: "01 ENERO 2025")
}

interface SongFile {
  name: string;
}

export default function DJPacks() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [songs, setSongs] = useState<SongFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // 1. CARGAR PACKS DESDE SUPABASE
  useEffect(() => {
    const fetchPacks = async () => {
      const { data } = await supabase
        .from('dj_tracks')
        .select('*')
        .eq('format', 'pack') // Solo traemos los packs
        .order('id', { ascending: false }); // Los últimos añadidos primero (2026)
        
      if (data) {
        // FILTRO DE LIMPIEZA:
        // Quitamos las carpetas de sistema que se colaron en el escaneo
        const cleanPacks = data.filter(p => 
            !p.pool_id.includes('DJPACKS/') && 
            p.pool_id !== 'DJPACKS'
        );
        setPacks(cleanPacks as Pack[]);
      }
    };
    fetchPacks();
  }, []);

  // 2. ABRIR PACK Y LEER CANCIONES (EN VIVO)
  const openPack = async (pack: Pack) => {
    setLoading(true);
    setSelectedPack(pack);
    setView('list');
    setSongs([]);

    // Construimos la ruta absoluta usando la que guardó el script
    const serverPath = `/DJPACKS/${pack.original_folder}/`; 
    
    // Llamamos a tu API para ver qué hay dentro AHORA MISMO
    const apiUrl = `${window.location.origin}/api/resources?path=${encodeURIComponent(encodeURIComponent(serverPath))}&source=srv`;

    try {
        const resp = await fetch(apiUrl);
        const data = await resp.json();
        
        if (data.items) {
            // Filtramos solo audios
            const audioFiles = data.items.filter((i: any) => 
                !i.isDir && /\.(mp3|wav|aiff?|m4a)$/i.test(i.name)
            );
            setSongs(audioFiles);
        }
    } catch (e) {
        console.error("Error leyendo canciones:", e);
    } finally {
        setLoading(false);
    }
  };

  // VISTA DE LISTA (CANCIONES)
  if (view === 'list' && selectedPack) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
        <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={() => setView('grid')} 
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
                <h2 className="text-xl md:text-3xl font-black italic uppercase text-white leading-none">
                    {selectedPack.pool_id}
                </h2>
                <p className="text-[#ff0055] text-sm font-bold mt-1">
                    {selectedPack.drop_month}
                </p>
            </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {loading ? (
                <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#ff0055]"></div>
                    <span className="text-gray-500 font-mono text-sm animate-pulse">CONNECTING TO SERVER...</span>
                </div>
            ) : songs.length === 0 ? (
                <div className="p-20 text-center text-gray-500 italic">No songs found inside this pack.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-xs uppercase font-bold text-gray-500 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 w-12">#</th>
                                <th className="px-6 py-4">Track Title</th>
                                <th className="px-6 py-4 text-right">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {songs.map((song, index) => {
                                // URL FINAL DE DESCARGA DIRECTA
                                // Usamos la ruta guardada en DB + el nombre del archivo
                                const songUrl = `${STORAGE_BASE}/${selectedPack.original_folder}/${song.name}`;
                                
                                return (
                                    <tr key={index} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-gray-600">{index + 1}</td>
                                        <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                                            <Music size={16} className="text-[#ff0055] group-hover:scale-110 transition-transform" />
                                            {song.name.replace(/\.(mp3|wav)$/i, '')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a 
                                                href={songUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-5 py-2 bg-[#ff0055] hover:bg-[#ff0055]/80 text-white rounded-full font-bold text-xs transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,85,0.2)]"
                                            >
                                                <Download size={14} /> GET
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    );
  }

  // VISTA DE GRID (CARPETAS)
  return (
    <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {packs.map((pack) => (
            <div 
                key={pack.id}
                onClick={() => openPack(pack)}
                className="group relative bg-[#111] border border-white/5 hover:border-[#ff0055]/50 rounded-xl p-6 cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(255,0,85,0.1)] overflow-hidden flex flex-col justify-between h-full"
            >
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-gray-800 to-black rounded-lg text-gray-400 group-hover:text-[#ff0055] group-hover:from-[#ff0055]/20 group-hover:to-black transition-all shadow-inner">
                            <Folder size={24} />
                        </div>
                        {/* Etiqueta de Mes */}
                        <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5 uppercase tracking-wider">
                            {pack.drop_month.split(' ')[1] || '2025'} {/* Muestra solo el mes o año */}
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-black italic uppercase text-white mb-2 leading-tight group-hover:text-[#ff0055] transition-colors line-clamp-2">
                        {pack.pool_id}
                    </h3>
                </div>
                
                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-[#ff0055] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
}