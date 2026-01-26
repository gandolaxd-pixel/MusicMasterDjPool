import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Navigation } from '../app/components/NavigationMaster';
import { Footer } from '../app/components/Footer';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

export const RootLayout: React.FC = () => {
    const { user } = useAuth();
    const { search } = useSearch();
    const navigate = useNavigate();
    const location = useLocation();

    // Mapeamos la ruta actual al "currentView"
    const getCurrentView = () => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path.startsWith('/search')) return 'search';
        if (path.startsWith('/pools')) return 'pools';
        if (path.startsWith('/packs')) return 'packs';
        return 'home';
    };

    // Wrapper para onSearch que también navega
    const handleSearchWrapper = (term: string) => {
        search(term);
        navigate(`/search?q=${encodeURIComponent(term)}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white antialiased relative selection:bg-[#ff0055] selection:text-white">
            <Navigation
                user={user}
                currentView={getCurrentView()}
                onSearch={handleSearchWrapper}
            />

            <main className={`${location.pathname === '/' ? 'pt-0' : 'pt-32'} pb-40`}>
                <div className="max-w-7xl mx-auto px-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
};
