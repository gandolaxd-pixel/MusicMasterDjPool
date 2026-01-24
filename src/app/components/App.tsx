// src/App.tsx - EDITADO PARA PAGINACIÓN MASIVA
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase'; 
import { API_URL } from '../../config';

import { Navigation } from './navigation';
import { Hero } from './hero';
import { LatestUploads } from './LatestUploads';
import { Footer } from './Footer';
import { Charts } from './Charts';
import { AudioPlayer } from './AudioPlayer';
import { Trends } from './Trends'; 
import { AuthForm } from './AuthForm'; 
import PoolGrid from './PoolGrid';
import DJPacks from './DjPacks'; 

import { FolderArchive, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  filename: string;
  file_path: string;
  pool_origin?: string;
  created_at: string;
  streamUrl?: string; 
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'pools' | 'packs'>('home');
  
  // ✅ ESTADO DE PAGINACIÓN DE API
  const [serverTracks, setServerTracks] = useState<Track[]>([]);
  const [serverPage, setServerPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalServerTracks, setTotalServerTracks] = useState(0);

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [realTracks, setRealTracks] = useState<Track[]>([]); // Supabase (Latest)
  const [crate, setCrate] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ FUNCIÓN PARA BUSCAR EN EL VPS (CATÁLOGO DE 343K)
  const fetchFromServer = async (query: string, page: number) => {
    try {
      const resp = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}&page=${page}`);
      const data = await resp.json();
      
      // Si es la página 1, reemplazamos. Si no, acumulamos.
      setServerTracks(prev => page === 1 ? data.tracks : [...prev, data.tracks]);
      setHasMore(data.hasMore);
      setTotalServerTracks(data.total);
    } catch (e) {
      console.error("Error conectando con el VPS:", e);
    }
  };

  // ✅ MANEJO DE BÚSQUEDA REAL TIEMPO
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setServerPage(1);
    if (term.trim() !== '') {
      setCurrentView('search');
      fetchFromServer(term, 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
    }
  };

  const handlePageChange = (newPage: number) => {
    setServerPage(newPage);
    fetchFromServer(searchTerm, newPage);
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goHome = () => {
    setSearchTerm('');
    setSelectedGenre(null);
    setServerPage(1);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPools = () => { setCurrentView('pools'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goToPacks = () => { setCurrentView('packs'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handlePlay = (track: Track) => {
    if (currentTrack && (currentTrack.id === track.id || currentTrack.title === track.title)) {
      setIsPlaying(!isPlaying); 
    } else {
      // ✅ FIX: Ruta de stream directa al VPS
      const path = track.file_path || track.filename;
      const streamUrl = `${API_URL}/api/stream?path=${encodeURIComponent(path)}`;
      setCurrentTrack({ ...track, streamUrl });
      setIsPlaying(true);
    }
  };

  const toggleCrate = (track: Track) => {
    setCrate(prev => {
      const exists = prev.find(t => t.id === track.id);
      if (exists) return prev.filter(t => t.id !== track.id);
      return prev.length < 50 ? [...prev, track] : prev;
    });
  };

  const handleGenreSelect = (genreName: string | null) => {
    setSelectedGenre(prev => prev === genreName ? null : genreName);
    setServerPage(1);
    if (currentView !== 'home') setCurrentView('home');
    // Si hay un género seleccionado, también podríamos filtrar en servidor, 
    // pero de momento lo dejamos local para "Latest Uploads"
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) { if (mounted) setLoading(false); }
      
      // Cargar los últimos 200 de Supabase para la Home
      const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false }).limit(200);
      if (data && mounted) setRealTracks(data as Track[]);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });
    return () => { mounted = false; authListener.subscription.unsubscribe(); };
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#ff0055]"></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white antialiased">
        <Navigation user={null} currentView="home" onSearch={handleSearch} onGoHome={goHome} onGoPools={goToPools} onGoPacks={goToPacks} />
        <Hero onJoinClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })} />
        <main className="max-w-7xl mx-auto px-4 py-20">
          <div id="auth-section" className="max-w-md mx-auto bg-[#0a0a0a] border border-white/10 p-10 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-8 text-center tracking-tighter">DJ <span className="text-[#ff0055]">Access</span></h2>
            <AuthForm />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white antialiased relative selection:bg-[#ff0055] selection:text-white">
      <Navigation user={user} currentView={currentView} onSearch={handleSearch} onGoHome={goHome} onGoPools={goToPools} onGoPacks={goToPacks} />
      
      <main className="pt-32 pb-40">
        <div className="max-w-7xl mx-auto px-4">
           
           {currentView === 'search' && (
             <section className="space-y-12 animate-in fade-in duration-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                    Search <span className="text-[#ff0055]">Results</span> 
                    <span className="ml-4 text-sm text-gray-500 font-normal">({totalServerTracks} found)</span>
                  </h2>
                  <button onClick={goHome} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full">← Back</button>
                </div>
                {/* ✅ USAMOS serverTracks PARA LA BÚSQUEDA */}
                <LatestUploads tracks={serverTracks} selectedGenre={null} onGenreSelect={() => {}} onToggleCrate={toggleCrate} crate={crate} user={user} onPlay={handlePlay} currentTrack={currentTrack} isPlaying={isPlaying} />
                
                {/* Paginador de búsqueda */}
                {hasMore && (
                    <button onClick={() => handlePageChange(serverPage + 1)} className="mx-auto block bg-white/5 border border-white/10 px-8 py-3 rounded-full hover:bg-[#ff0055] transition-all font-bold uppercase text-xs tracking-widest">
                        Load More Results
                    </button>
                )}
             </section>
           )}

           {currentView === 'home' && (
             <div className="space-y-32">
               <Trends onToggleCrate={toggleCrate} crate={crate} />
               <section id="latest" className="scroll-mt-32">
                  {/* Para la home usamos realTracks (Supabase) con su paginación local original si quieres */}
                  <LatestUploads tracks={realTracks.slice(0, 20)} selectedGenre={selectedGenre} onGenreSelect={handleGenreSelect} onToggleCrate={toggleCrate} crate={crate} user={user} onPlay={handlePlay} currentTrack={currentTrack} isPlaying={isPlaying} />
               </section>
               <div id="charts" className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8"><Charts user={user} /></div>
             </div>
           )}

           {/* Mantienes pools y packs igual, ya que ellos llaman internamente a la API */}
           {currentView === 'pools' && <PoolGrid />}
           {currentView === 'packs' && (
              <DJPacks 
                user={user} 
                isPlaying={isPlaying} 
                currentTrack={currentTrack} 
                onPlay={(t) => handlePlay({
                  ...t, 
                  id: t.id || t.name, 
                  title: t.name, 
                  file_path: t.server_path,
                  created_at: new Date().toISOString()
                } as Track)} 
              />
           )}
        </div>
      </main>

      <Footer />

      {currentTrack && (
        <AudioPlayer 
            url={currentTrack.streamUrl || ''} 
            title={currentTrack.title} 
            artist={currentTrack.artist || 'Mastered Audio'}
            isPlaying={isPlaying} 
            onTogglePlay={() => setIsPlaying(!isPlaying)} 
        />
      )}
    </div>
  );
}