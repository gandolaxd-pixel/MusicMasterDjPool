import { useState, useEffect, useMemo } from 'react'; // Añadimos useMemo para velocidad
import { supabase } from '../../supabase'; 
import { Navigation } from './navigation';
import { Hero } from './hero';
import { FeaturedGenres } from './FeaturedGenres';
import { LatestUploads } from './LatestUploads';
import { Footer } from './Footer';
import { Charts } from './Charts';
import { AudioPlayer } from './AudioPlayer';
import { Trends } from './Trends'; 
import { AuthForm } from './AuthForm'; 
import { SearchFilters } from './SearchFilters'; // Importamos el buscador
import { Backpack, FolderArchive, Zap, History, Disc } from 'lucide-react';
import { API_URL } from '../../config';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [crate, setCrate] = useState<any[]>([]);
  const [realTracks, setRealTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 🔍 NUEVO: Estado para el buscador
  const [searchTerm, setSearchTerm] = useState('');

  const poolData = [
    { name: 'DJ City', img: '/pools/djcity.webp' },
    { name: 'BPM Supreme', img: '/pools/bpmsupreme.jpg' },
    { name: 'Club Killers', img: '/pools/clubkillers.png' },
    { name: 'Heavy Hits', img: '/pools/heavyhits.jpeg' },
    { name: 'Beatport', img: '/pools/beatport.svg' },
    { name: 'Mashup Pack', img: '/pools/themashup.jpg' },
    { name: 'LatinRemixes', img: '/pools/latinremixes.png' },
    { name: 'AreYouKidy', img: '/pools/areyoukidy.jpg' },
    { name: 'BangerzArmy', img: '/pools/bangerzarmy.png' },
    { name: 'Crooklyn Clan', img: '/pools/crooklynclan.jpg' },
    { name: 'BPM Latino', img: '/pools/bpmlatino.jpg' },
    { name: 'Cuba Remixes', img: '/pools/cubaremixes.png' },
  ];

  // 🔍 NUEVO: Lógica de filtrado inteligente (Título o Artista)
  const filteredTracks = useMemo(() => {
    return realTracks.filter(track => {
      const search = searchTerm.toLowerCase();
      const title = (track.title || track.filename || '').toLowerCase();
      const artist = (track.artist || '').toLowerCase();
      return title.includes(search) || artist.includes(search);
    });
  }, [realTracks, searchTerm]);

  const handlePlay = (track: any) => {
    if (currentTrack && currentTrack.id === track.id) {
      setIsPlaying(!isPlaying); 
    } else {
      const streamUrl = `${API_URL}/stream?path=${encodeURIComponent(track.file_path)}`;
      setCurrentTrack({
        ...track,
        streamUrl: streamUrl
      });
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    let mounted = true;
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) { if (mounted) setLoading(false); }
    };
    getInitialSession();

    const fetchTracks = async () => {
      const { data } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data && mounted) setRealTracks(data);
    };
    fetchTracks();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });
    return () => { mounted = false; authListener.subscription.unsubscribe(); };
  }, []);

  const toggleCrate = (track: any) => {
    setCrate(prev => {
      const exists = prev.find(t => t.id === track.id);
      if (exists) return prev.filter(t => t.id !== track.id);
      return prev.length < 20 ? [...prev, track] : prev;
    });
  };

  const handleGenreSelect = (genreName: string | null) => {
    setSelectedGenre(prev => prev === genreName ? null : genreName);
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white antialiased">
        <Navigation user={null} />
        <Hero onJoinClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })} />
        <main className="max-w-7xl mx-auto px-4 py-20">
          <div id="auth-section" className="max-w-md mx-auto bg-[#0a0a0a] border border-white/10 p-10 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-8 text-center tracking-tighter">
              DJ <span className="text-[#ff0055]">Access</span>
            </h2>
            <AuthForm />
          </div>
          <div className="mt-32">
            <FeaturedGenres onGenreSelect={() => {}} activeGenre={null} user={null} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white antialiased relative">
      <Navigation user={user} />
      
      <main className="pt-32 pb-40">
        <div className="max-w-7xl mx-auto px-4 space-y-32">
           
           {/* SECCIÓN DE POOLS */}
           <section id="packs" className="pt-10">
              <div className="text-center mb-16">
                 <div className="flex justify-center mb-6">
                   <div className="p-4 rounded-full bg-[#ff0055]/10 border border-[#ff0055]/20 shadow-[0_0_30px_rgba(255,0,85,0.2)]">
                      <FolderArchive className="text-[#ff0055]" size={40} />
                   </div>
                </div>
                <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-4">
                  Professional <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0055] to-purple-600">DJ Pools </span>
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {poolData.map((pool) => (
                  <button key={pool.name} onClick={() => handleGenreSelect(pool.name)} className="aspect-square bg-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group hover:border-[#ff0055] transition-all duration-300 shadow-2xl hover:scale-105">
                    <img src={pool.img} alt={pool.name} className="w-full h-full object-cover transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                  </button>
                ))}
              </div>
           </section>

           {/* 🔍 NUEVO: BUSCADOR INTEGRADO */}
           <section id="search" className="pt-10">
              <SearchFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
           </section>

           <div className="pt-10 border-t border-white/5">
              <Trends onToggleCrate={toggleCrate} crate={crate} />
           </div>

           <section id="latest">
              <div className="text-center mb-10">
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Latest <span className="text-[#ff0055]">Drops</span></h3>
              </div>
              
              {/* ✅ PASAMOS filteredTracks EN LUGAR DE realTracks */}
              <LatestUploads 
                tracks={filteredTracks}  
                selectedGenre={selectedGenre} 
                onGenreSelect={handleGenreSelect} 
                onToggleCrate={toggleCrate} 
                crate={crate} 
                user={user}
                onPlay={handlePlay}
                currentTrack={currentTrack} 
                isPlaying={isPlaying} 
              />
           </section>
           
           <div id="charts" className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8">
              <Charts user={user} />
           </div>

           <section id="retro" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-black p-10 rounded-3xl border border-white/10 group cursor-pointer hover:border-[#ff0055]/50 transition-all">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black uppercase italic mb-2 group-hover:text-[#ff0055] transition-colors">DJ Tools</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Acapellas • Transitions • Edits</p>
                </div>
                <Zap size={100} className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-[#ff0055]/10 transition-colors" />
              </div>
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-black p-10 rounded-3xl border border-white/10 group cursor-pointer hover:border-blue-500/50 transition-all">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black uppercase italic mb-2 group-hover:text-blue-500 transition-colors">Retro Vault</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">70s • 80s • 90s • 00s Classics</p>
                </div>
                <History size={100} className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-blue-500/10 transition-colors" />
              </div>
           </section>

           <div id="genres">
             <FeaturedGenres onGenreSelect={handleGenreSelect} activeGenre={selectedGenre} user={user} />
           </div>
        </div>
      </main>

      {crate.length > 0 && (
        <button className="fixed right-8 bottom-32 z-40 p-4 rounded-full bg-[#ff0055] shadow-lg flex items-center gap-2 hover:scale-110 transition-all">
          <Backpack size={20} /><span className="font-bold text-xs">{crate.length}</span>
        </button>
      )}

      <Footer />

      {currentTrack && (
        <AudioPlayer 
            url={currentTrack.streamUrl} 
            title={currentTrack.title || currentTrack.filename} 
            artist={currentTrack.artist || currentTrack.pool_origin}
            isPlaying={isPlaying} 
            onTogglePlay={() => setIsPlaying(!isPlaying)} 
        />
      )}
    </div>
  );
}