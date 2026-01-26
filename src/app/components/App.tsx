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

  const handleGenreSelect = (genreName: string | null) => {
    setSelectedGenre(prev => prev === genreName ? null : genreName);
  };

  // Carga inicial de datos para Home (Trends/Latest)
  useEffect(() => {
    const fetchInit = async () => {
      const { supabase } = await import('../../supabase');
      const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false }).limit(200);
      if (data) setRealTracks(data as Track[]);
    }
    fetchInit();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#ff0055]"></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white antialiased">
        <BrowserRouter>
          <Navigation user={null} currentView="home" onSearch={() => { }} />
        </BrowserRouter>
        <Hero onJoinClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })} />
        <WhyJoin />
        <MembershipPlans />
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>

          <Route index element={
            <HomePage
              realTracks={realTracks}
              selectedGenre={selectedGenre}
              onGenreSelect={handleGenreSelect}
              user={user}
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