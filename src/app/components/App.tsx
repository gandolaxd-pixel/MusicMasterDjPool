import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase'; 
import { API_URL } from '../../config';

import { Navigation } from './navigation';
import { Hero } from './hero';
// ✅ CORREGIDO: Importación con llaves para exportación nombrada
import { LatestUploads } from './LatestUploads';
import { Footer } from './Footer';
import { Charts } from './Charts';
import { AudioPlayer } from './AudioPlayer';
import { Trends } from './Trends'; 
import { AuthForm } from './AuthForm'; 
import PoolGrid from './PoolGrid';
import DJPacks from './DJPacks'; 

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [realTracks, setRealTracks] = useState<Track[]>([]);
  const [crate, setCrate] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredTracks = useMemo(() => {
    return realTracks.filter(track => {
      const matchesGenre = !selectedGenre || track.pool_origin === selectedGenre;
      const search = searchTerm.toLowerCase().trim();
      const title = (track.title || track.filename || '').toLowerCase();
      const artist = (track.artist || '').toLowerCase();
      return matchesGenre && (!search || title.includes(search) || artist.includes(search));
    });
  }, [realTracks, selectedGenre, searchTerm]);

  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const currentTracksPage = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTracks.slice(start, start + itemsPerPage);
  }, [filteredTracks, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setCurrentView(term.trim() !== '' ? 'search' : 'home');
    if (term.trim() !== '') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setSearchTerm('');
    setSelectedGenre(null);
    setCurrentPage(1);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPools = () => { setCurrentView('pools'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goToPacks = () => { setCurrentView('packs'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handlePlay = (track: Track) => {
    if (currentTrack && (currentTrack.id === track.id || currentTrack.title === track.title)) {
      setIsPlaying(!isPlaying); 
    } else {
      const streamUrl = track.streamUrl || `${API_URL}/stream?path=${encodeURIComponent(track.file_path)}`;
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
    setCurrentPage(1);
    if (currentView !== 'home') setCurrentView('home');
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Search <span className="text-[#ff0055]">Results</span></h2>
                  <button onClick={goHome} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full">← Back</button>
                </div>
                <LatestUploads tracks={currentTracksPage} selectedGenre={null} onGenreSelect={() => {}} onToggleCrate={toggleCrate} crate={crate} user={user} onPlay={handlePlay} currentTrack={currentTrack} isPlaying={isPlaying} />
             </section>
           )}

           {currentView === 'pools' && (
             <section className="pt-10 animate-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-16">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-[#ff0055]/10 border border-[#ff0055]/20 shadow-[0_0_30px_rgba(255,0,85,0.2)]">
                        <FolderArchive className="text-[#ff0055]" size={40} />
                    </div>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-4">Professional <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0055] to-purple-600">DJ Pools </span></h2>
                </div>
                <PoolGrid />
             </section>
           )}

           {currentView === 'packs' && (
             <section className="animate-in zoom-in-95 duration-300 min-h-screen">
                <div className="text-center mb-10">
                   <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-2">Exclusive <span className="text-[#ff0055]">Packs</span></h2>
                   <p className="text-gray-400">Direct Server Access • Folders & Playlists</p>
                </div>
                {/* ✅ PASAMOS LAS PROPS AL COMPONENTE DE PACKS */}
                <DJPacks 
                  user={user}
                  isPlaying={isPlaying}
                  currentTrack={currentTrack}
                  onPlay={(packTrack) => {
                    const trackToPlay: Track = {
                      id: packTrack.id || packTrack.name,
                      title: packTrack.name,
                      artist: 'Mastered Audio',
                      filename: packTrack.name,
                      file_path: packTrack.server_path,
                      streamUrl: `https://u529624-sub1:Gandola2026!@u529624-sub1.your-storagebox.de${packTrack.server_path}`,
                      created_at: new Date().toISOString()
                    };
                    handlePlay(trackToPlay);
                  }}
                />
             </section>
           )}

           {currentView === 'home' && (
             <div className="space-y-32">
               <Trends onToggleCrate={toggleCrate} crate={crate} />
               <section id="latest" className="scroll-mt-32">
                  <LatestUploads tracks={currentTracksPage} selectedGenre={selectedGenre} onGenreSelect={handleGenreSelect} onToggleCrate={toggleCrate} crate={crate} user={user} onPlay={handlePlay} currentTrack={currentTrack} isPlaying={isPlaying} />
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-16 pb-10">
                      <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-20 transition-all mr-2"><ChevronLeft size={18} /></button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 rounded-xl font-black text-[11px] transition-all duration-300 ${currentPage === page ? 'bg-[#ff0055] text-white shadow-[0_0_20px_rgba(255,0,85,0.4)]' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'}`}>{page}</button>
                          );
                        }
                        return null;
                      })}
                      <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-20 transition-all ml-2"><ChevronRight size={18} /></button>
                    </div>
                  )}
               </section>
               <div id="charts" className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8"><Charts user={user} /></div>
             </div>
           )}
        </div>
      </main>

      <Footer />

      {currentTrack && (
        <AudioPlayer 
            url={currentTrack.streamUrl || ''} 
            title={currentTrack.title || currentTrack.filename} 
            artist={currentTrack.artist || currentTrack.pool_origin || 'Unknown'}
            isPlaying={isPlaying} 
            onTogglePlay={() => setIsPlaying(!isPlaying)} 
        />
      )}
    </div>
  );
}