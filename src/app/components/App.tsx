// src/App.tsx - ADVANCED ARCHITECTURE
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { PlayerProvider, usePlayer } from '../../context/PlayerContext';
import { SearchProvider } from '../../context/SearchContext';
import { CrateProvider } from '../../context/CrateContext';

// Layouts & Pages
import { RootLayout } from '../../layouts/RootLayout';
import { HomePage } from '../../pages/Home';
import { SearchPage } from '../../pages/Search';
import { PoolsPage } from '../../pages/Pools';
import { PacksPage } from '../../pages/Packs';
import { HistoryPage } from '../../pages/History';
import { SubscriptionPage } from '../../pages/Subscription';
import { RetroVault } from '../../pages/RetroVault';
import { CategoriesPage } from '../../pages/Categories';

// Global Components
import { Navigation } from './NavigationMaster';
import { Hero } from './hero';
import { WhyJoin } from './WhyJoin';
import { MembershipPlans } from './MembershipPlans';
import { Footer } from './Footer';
import { AuthForm } from './AuthForm';
import { AudioPlayer } from './AudioPlayer';

import { Track } from '../../types';

// Componente interno con la lógica
const AppContent = () => {
  const { user, loading } = useAuth();
  const { currentTrack, isPlaying, togglePlay } = usePlayer();

  // ✅ ESTADO LOCAL SOLO PARA GENRES/TRENDS (Opcional mover a Home)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [realTracks, setRealTracks] = useState<Track[]>([]);
  const [featuredPack, setFeaturedPack] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const handleGenreSelect = (genreName: string | null) => {
    setSelectedGenre(prev => prev === genreName ? null : genreName);
  };

  // Carga inicial de datos para Home (Trends/Latest)
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const { supabase } = await import('../../supabase');
        // Intentamos cargar de 'dj_tracks' que parece ser la tabla principal de datos reales
        const { data } = await supabase.from('dj_tracks').select('*').order('created_at', { ascending: false }).limit(200);

        if (data) {
          // Mapeamos los datos para que encajen con la interfaz Track que espera el frontend
          const mappedTracks: Track[] = data.map((item: any) => ({
            ...item,
            pool_origin: item.pool_id || item.pool_origin || 'Unknown', // Adaptar pool_id a pool_origin
            file_path: item.server_path || item.file_path, // Asegurar file_path
            title: item.title || item.name, // Asegurar title
          }));
          setRealTracks(mappedTracks);
        }

        // Fetch Featured Pack (Latest Pack)
        const { data: packData } = await supabase
          .from('dj_tracks')
          .select('*')
          .eq('format', 'pack')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (packData) {
          setFeaturedPack(packData);
        }
      } catch (e) {
        console.error("Error fetching data", e);
      } finally {
        setDataLoading(false);
      }
    }
    fetchInit();
  }, []);

  // State for Sign Up Funnel
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#ff0055]"></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white antialiased">
        <BrowserRouter>
          <Navigation user={null} currentView="home" onSearch={() => { }} />
        </BrowserRouter>
        <Hero onJoinClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })} />
        <WhyJoin />
        <MembershipPlans onSelectPlan={setSelectedPlan} />
        <main className="max-w-7xl mx-auto px-4 py-20">
          <div id="auth-section" className="max-w-md mx-auto bg-[#0a0a0a] border border-white/10 p-10 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-8 text-center tracking-tighter">DJ <span className="text-[#ff0055]">Access</span></h2>
            <AuthForm selectedPlan={selectedPlan} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>

          <Route index element={
            <HomePage
              realTracks={realTracks}
              selectedGenre={selectedGenre}
              onGenreSelect={handleGenreSelect}
              user={user}
              featuredPack={featuredPack}
              loading={dataLoading}
            />}
          />

          <Route path="search" element={<SearchPage user={user} />} />

          <Route path="pools" element={<PoolsPage />} />

          <Route path="packs" element={<PacksPage user={user} />} />
          <Route path="retro" element={<RetroVault realTracks={realTracks} user={user} />} />
          <Route path="categories" element={<CategoriesPage realTracks={realTracks} user={user} />} />
          <Route path="history" element={<HistoryPage user={user} />} />
          <Route path="subscription" element={<SubscriptionPage user={user} />} />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Route>
      </Routes>

      {currentTrack && (
        <AudioPlayer
          url={currentTrack.streamUrl || ''}
          title={currentTrack.title}
          artist={currentTrack.artist || 'Mastered Audio'}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
        />
      )}
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <CrateProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </CrateProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}