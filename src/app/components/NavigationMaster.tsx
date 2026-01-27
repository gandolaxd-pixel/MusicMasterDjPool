import { Flame, User, LogOut, ChevronDown, History, LifeBuoy, Search, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export function Navigation({ user, currentView, onSearch }: {
  user: any,
  currentView: string,
  onSearch: (term: string) => void
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { signOut } = useAuth(); // Usar el hook para acceder al método del contexto

  const handleLogout = async () => {
    try {
      await signOut();
      // No necesitamos window.location.href = '/' porque al cambiar el usuario a null,
      // el App.tsx detectará el cambio y renderizará la vista de Login automáticamente.
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const triggerSearch = () => {
    onSearch(searchTerm);
  };

  const links = [
    { id: 'home', name: 'Home', to: '/' },
    { id: 'pools', name: 'DJ Pools', to: '/pools' },
    { id: 'packs', name: 'DJ Packs', to: '/packs' },
    { id: 'retro', name: 'Retro Vault', to: '/retro' },
    { id: 'categories', name: 'Categories', to: '/categories' },
    { id: 'latest', name: 'Latest', href: '/#latest' },
    { id: 'charts', name: 'Charts', href: '/#charts' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 h-20">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">

        {/* 1. LOGO (Flex Initial) */}
        <div className="flex-shrink-0 z-20 w-[200px]">
          <Link to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-fit">
            <div className="bg-[#ff0055] p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,0,85,0.4)]">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white italic tracking-tighter uppercase hidden sm:block">
              Music<span className="text-[#ff0055]">Master</span>
            </span>
          </Link>
        </div>

        {/* 2. NAVIGATION LINKS (Flex 1 - Center) - ONLY VISIBLE TO LOGGED IN USERS */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6">
          {user && links.map(l => {
            const isActive = currentView === l.id;
            const baseStyle = "text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative group py-2";
            const activeStyle = isActive
              ? "text-[#ff0055]"
              : "text-gray-400 hover:text-white";

            return (
              <div key={l.name} className="relative">
                {l.to ? (
                  <Link to={l.to} className={`${baseStyle} ${activeStyle}`}>
                    {l.name}
                    {isActive && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff0055] shadow-[0_0_10px_#ff0055]" />}
                  </Link>
                ) : (
                  <a href={l.href} className={`${baseStyle} ${activeStyle}`}>
                    {l.name}
                    {isActive && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff0055] shadow-[0_0_10px_#ff0055]" />}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. USER ACTIONS (Flex Initial - Right Align) */}
        <div className="flex items-center justify-end gap-4 z-20 w-[200px]">
          {/* BUSCADOR - Se expande hacia la izquierda */}
          <div className="relative flex items-center justify-end" onMouseEnter={() => setIsSearchOpen(true)} onMouseLeave={() => { if (searchTerm === '') setIsSearchOpen(false); }}>
            <motion.div
              animate={{ width: isSearchOpen ? 240 : 40 }}
              className={`absolute right-0 flex items-center h-10 rounded-xl border ${isSearchOpen ? 'bg-black/95 border-white/20 shadow-xl' : 'bg-transparent border-transparent'}`}
            >
              <button onClick={triggerSearch} className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white flex-shrink-0"><Search size={18} /></button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.input
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    autoFocus type="text" placeholder="Search..."
                    className="bg-transparent border-none outline-none text-[11px] font-bold text-white uppercase w-full pr-4"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
                  />
                )}
              </AnimatePresence>
            </motion.div>
            {/* Spacer to keep layout stable */}
            <div className="w-10 h-10" />
          </div>

          {/* USUARIO */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-white/10 bg-[#0a0a0a]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ff0055] to-purple-600 flex items-center justify-center">
                  <User size={12} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase text-white tracking-wider hidden sm:block">{user.email?.split('@')[0]}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-3 w-60 bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <Link to="/subscription" className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-lg uppercase tracking-widest transition-colors">
                      <CreditCard size={14} /> Manage Subscription
                    </Link>
                    <Link to="/history" className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-lg uppercase tracking-widest transition-colors">
                      <History size={14} /> Download History
                    </Link>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-lg uppercase tracking-widest transition-colors">
                      <LifeBuoy size={14} /> Support
                    </button>

                    <div className="h-px bg-white/5 my-1" />

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded-lg uppercase tracking-widest">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-2.5 bg-[#ff0055] text-white rounded-xl font-black text-[10px] uppercase">Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}