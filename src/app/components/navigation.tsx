import { Disc, User, LogOut, ChevronDown, Settings, History, LifeBuoy, Search, X } from 'lucide-react'; 
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabase';

export function Navigation({ user, onSearch }: { user: any, onSearch: (term: string) => void }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/'; 
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(searchTerm);
  };

  const links = [
    { name: 'Latest Uploads', href: '#latest' },
    { name: 'DJ Pools', href: '#packs' },
    { name: 'Top Charts', href: '#charts' },
    { name: 'Retro Vault', href: '#retro' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 h-20">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* IZQUIERDA: Logo + Enlaces */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="bg-[#ff0055] p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,0,85,0.4)]">
               <Disc className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white italic tracking-tighter uppercase">
              Music<span className="text-[#ff0055]">Master</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {links.map(l => (
              <a 
                key={l.name} 
                href={l.href} 
                className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              >
                {l.name}
              </a>
            ))}
          </div>
        </div>

        {/* DERECHA: Buscador + Menú Usuario */}
        <div className="flex items-center gap-6">
          
          {/* BARRA DE BÚSQUEDA ANIMADA */}
          <div className="relative flex items-center">
            <motion.div 
              initial={false}
              animate={{ width: isSearchOpen ? 240 : 40 }}
              className={`flex items-center h-10 rounded-xl border transition-colors duration-300 ${
                isSearchOpen ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <button 
                onClick={() => {
                  if (isSearchOpen && searchTerm) {
                    handleSearchSubmit();
                  } else {
                    setIsSearchOpen(!isSearchOpen);
                  }
                }}
                className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white transition-colors"
              >
                <Search size={18} />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.input
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    autoFocus
                    type="text"
                    placeholder="Search tracks, artists..."
                    // EDITADO: Añadido focus:ring-0 y focus:outline-none para quitar el cuadrado blanco
                    className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[11px] font-bold text-white uppercase tracking-wider w-full pr-4 shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)} 
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-300 ${
                  userMenuOpen 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-[#0a0a0a] border-white/10 hover:border-[#ff0055]/50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ff0055] to-purple-600 flex items-center justify-center">
                  <User size={12} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase text-white tracking-wider">
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setUserMenuOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-60 bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-2 overflow-hidden ring-1 ring-white/5"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-2">
                         <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Signed in as</p>
                         <p className="text-xs font-bold text-white truncate">{user.email}</p>
                      </div>

                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest">
                          <History size={14} /> History
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest">
                          <Settings size={14} /> Settings
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-[#ff0055] hover:bg-[#ff0055]/10 rounded-lg transition-all uppercase tracking-widest">
                          <LifeBuoy size={14} /> Support
                        </button>
                        <div className="h-px bg-white/5 my-1" />
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-all uppercase tracking-widest"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({behavior: 'smooth'})} 
              className="px-8 py-2.5 bg-[#ff0055] hover:bg-[#d60045] text-white rounded-xl font-black text-[10px] uppercase shadow-[0_0_20px_rgba(255,0,85,0.3)] hover:shadow-[0_0_30px_rgba(255,0,85,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}