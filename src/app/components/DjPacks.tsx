import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../supabase';
import { Folder, Download, ArrowLeft, Home, ChevronRight, Disc, Play, Pause, Music2 } from 'lucide-react';

const STORAGE_BASE = "https://u529624-sub1:Gandola2026!@u529624-sub1.your-storagebox.de";

const MONTH_ORDER: Record<string, number> = {
  'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4, 'MAYO': 5, 'JUNIO': 6,
  'JULIO': 7, 'AGOSTO': 8, 'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12,
  'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
  'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
};

interface DJPacksProps {
  onPlay?: (track: any) => void;
  currentTrack?: any;
  isPlaying?: boolean;
  user?: any;
}

// ✅ Exportación por defecto para coincidir con el import de App.tsx
export default function DJPacks({ onPlay, currentTrack, isPlaying, user }: DJPacksProps) {
  const [fileSystem, setFileSystem] = useState<any>({ name: 'root', type: 'year', children: {} });
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [isInsidePack, setIsInsidePack] = useState(false);

  useEffect(() => {
    const fetchStructure = async () => {
      setLoading(true);
      const { data } = await supabase.from('dj_tracks').select('*').eq('format', 'pack');
      if (data) {
        const root: any = { name: 'root', type: 'year', children: {} };
        data.forEach((pack: any) => {
          const parts = pack.original_folder.split('/').filter(Boolean);
          let current = root;
          parts.forEach((part: string, index: number) => {
            const isPack = index === parts.length - 1 && parts.length >= 3;
            const isMonth = index === 1;
            if (!current.children[part]) {
              current.children[part] = {
                name: part,
                type: isPack ? 'pack' : (isMonth ? 'month' : 'year'),
                children: {},
                data: isPack ? pack : undefined
              };
            }
            current = current.children[part];
          });
        });
        setFileSystem(root);
      }
      setLoading(false);
    };
    fetchStructure();
  }, []);

  const currentItems = useMemo(() => {
    let current = fileSystem;
    for (const step of currentPath) {
      if (current.children && current.children[step]) current = current.children[step];
    }
    return Object.values(current.children || {}).sort((a: any, b: any) => {
      if (a.type === 'month' && b.type === 'month') {
        const mA = a.name.split(' ').find((p: string) => MONTH_ORDER[p.toUpperCase()]);
        const mB = b.name.split(' ').find((p: string) => MONTH_ORDER[p.toUpperCase()]);
        return (MONTH_ORDER[mA || ''] || 0) - (MONTH_ORDER[mB || ''] || 0);
      }
      return b.name.localeCompare(a.name);
    });
  }, [fileSystem, currentPath]);

  // ✅ Ref para evitar "Race Conditions" (que se mezclen canciones de carpetas distintas)
  const activeFolderRef = useRef<string | null>(null);

  // ✅ Función reutilizable para cargar canciones
  const loadPackSongs = async (packData: any) => {
    if (!packData) return;

    // 1. Guardamos qué carpeta estamos cargando AHORA
    const currentFolder = packData.original_folder;
    activeFolderRef.current = currentFolder;

    setLoadingSongs(true);
    setSongs([]); // Limpiamos visualmente la anterior inmediatamente

    const { data } = await supabase
      .from('dj_tracks')
      .select('*')
      .eq('original_folder', currentFolder) // Usamos la var local
      .eq('format', 'file');

    // 2. Solo actualizamos si el usuario NO ha cambiado de carpeta mientras cargaba
    if (activeFolderRef.current === currentFolder) {
      setSongs(data || []);
      setLoadingSongs(false);
    }
  };

  const handleFolderClick = async (item: any) => {
    const newPath = [...currentPath, item.name];
    setCurrentPath(newPath);

    if (item.type === 'pack' && item.data) {
      setIsInsidePack(true);
      await loadPackSongs(item.data);
    } else {
      setIsInsidePack(false);
    }
  };

  // Helper para recargar el pack actual
  const refreshCurrentPack = () => {
    // Necesitamos recuperar la data del pack actual. 
    // Navegamos el fileSystem usando currentPath.
    let current: any = fileSystem;
    for (const p of currentPath) {
      if (current.children && current.children[p]) current = current.children[p];
    }
    if (current && current.type === 'pack' && current.data) {
      loadPackSongs(current.data);
    }
  };

  const goHome = () => { setCurrentPath([]); setIsInsidePack(false); };
  const goBack = () => {
    const p = [...currentPath];
    p.pop();
    setCurrentPath(p);
    setIsInsidePack(false);
  };

  return (
    <div className="w-full animate-in fade-in duration-700 max-w-7xl mx-auto px-4 pb-24">
      {/* NAVEGACIÓN */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto py-2 no-scrollbar border-b border-white/5 pb-6">
        <button onClick={goHome} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
          <Home size={18} />
        </button>
        {currentPath.map((p, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <ChevronRight size={14} className="text-gray-800" />
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${i === currentPath.length - 1 ? 'text-[#ff0055]' : 'text-gray-600'}`}>
              {p}
            </span>
          </div>
        ))}
      </div>

      {isInsidePack ? (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-4">
          <button onClick={goBack} className="mb-4 flex items-center gap-2 text-[10px] font-black text-[#ff0055] hover:text-white uppercase tracking-[0.3em] transition-colors">
            <ArrowLeft size={14} /> Back to Packs
          </button>

          {loadingSongs ? (
            <div className="py-20 text-center text-gray-600 font-black text-[10px] uppercase animate-pulse tracking-widest">Loading Library...</div>
          ) : songs.length > 0 ? songs.map((track) => {
            const isActive = currentTrack && (currentTrack.id === track.id || currentTrack.title === track.name);
            const isPlayingCurrent = isActive && isPlaying;
            // ✅ Normalizamos el track para el reproductor
            const trackForPlayer = { ...track, title: track.name, file_path: track.server_path };

            return (
              <div key={track.id || track.name} className={`group rounded-xl p-3 transition-all duration-300 border-l-4 ${isActive ? 'bg-white/10 border-[#ff0055] shadow-[0_0_20px_rgba(255,0,85,0.15)] scale-[1.01]' : 'bg-[#0a0a0a] border-white/5 hover:bg-white/[0.03]'}`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => onPlay && onPlay(trackForPlayer)} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform shadow-lg ${isActive ? 'scale-110 bg-white' : 'hover:scale-110 bg-[#ff0055]'}`} >
                    {isPlayingCurrent ? <Pause size={16} className="text-black fill-black" /> : <Play size={16} className={`ml-0.5 ${isActive ? 'text-black fill-black' : 'text-white fill-white'}`} />}
                  </button>
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-5 text-left">
                      <h3 className={`font-bold truncate uppercase tracking-tight text-sm transition-colors ${isActive ? 'text-[#ff0055]' : 'text-white group-hover:text-[#ff0055]'}`}>{track.name}</h3>
                      <div className="flex items-center gap-2">
                        <Music2 size={10} className="text-gray-600" />
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider truncate">Mastered Audio • Studio Quality</p>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex justify-end items-center">
                      <a
                        href={`http://localhost:3000/api/stream?path=${encodeURIComponent(track.server_path)}&download=true`}
                        onClick={async () => {
                          // Registro silencioso de la descarga
                          if (user) {
                            await supabase.from('downloads').insert({
                              user_id: user.id,
                              track_title: track.name,
                              track_path: track.server_path
                            });
                          }
                        }}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ff0055] text-white hover:scale-105 shadow-[0_0_10px_rgba(255,0,85,0.3)] transition-all"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4">
              <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest">No tracks found (Syncing?)</p>
              <button
                onClick={refreshCurrentPack}
                className="flex items-center gap-2 px-6 py-2 bg-[#ff0055]/10 border border-[#ff0055]/20 text-[#ff0055] rounded-full text-[10px] font-black uppercase hover:bg-[#ff0055] hover:text-white transition-all"
              >
                Refresh Folder
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="py-20 text-center text-gray-600 font-black text-[10px] uppercase animate-pulse">Scanning...</div>
          ) : currentItems.map((item: any) => (
            <div key={item.name} onClick={() => handleFolderClick(item)} className="group flex items-center justify-between bg-[#0a0a0a] border-l-4 border-white/5 p-4 rounded-xl cursor-pointer hover:border-[#ff0055]/50 hover:bg-[#121212] transition-all" >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 transition-colors ${item.type === 'pack' ? 'text-[#ff0055] group-hover:bg-[#ff0055]/10' : 'text-gray-600'}`}>
                  {item.type === 'pack' ? <Disc size={22} className="group-hover:rotate-90 transition-transform duration-500" /> : <Folder size={22} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white uppercase truncate max-w-[200px] md:max-w-md">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-[#ff0055] uppercase tracking-widest">{item.type}</span>
                    <span className="w-1 h-1 bg-gray-800 rounded-full" />
                    <span className="text-[9px] font-bold text-gray-600 uppercase">Library Folder</span>
                  </div>
                </div>
              </div>
              <div className="p-2 text-gray-800 group-hover:text-[#ff0055] transition-colors"><Folder size={18} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}