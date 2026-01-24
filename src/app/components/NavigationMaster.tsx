import { Disc, User, LogOut, ChevronDown, Settings, History, LifeBuoy, Search } from 'lucide-react'; 
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabase';

export function Navigation({ user, currentView, onSearch, onGoHome, onGoPools, onGoPacks }: { 
  user: any, 
  currentView: string,
  onSearch: (term: string) => void,
  onGoHome: () => void,
  onGoPools: () => void,
  onGoPacks: () => void 
}) {
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

  const triggerSearch = () => {
    onSearch(searchTerm);
  };

  const links = [
    { id: 'home', name: 'Home', onClick: onGoHome },
    { id: 'pools', name: 'DJ Pools', onClick: onGoPools },
    { id: 'packs', name: 'DJ Packs', onClick: onGoPacks }, // <--- ESTO ES LO QUE FALTA EN VERCEL
    { id: 'latest', name: 'Latest Uploads', href: '#latest' },
    { id: 'charts', name: 'Top Charts', href: '#charts' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 h-20">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        <div className="flex items-center gap-10">
          <div onClick={onGoHome} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="bg-[#ff0055] p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,0,85,0.4)]">
               <Disc className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white italic tracking-tighter uppercase">
              Music<span className="text-[#ff0055]">Master</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {links.map(l => {
              const isActive = currentView === l.id;
              const baseStyle = "text-xs font-bold uppercase tracking-widest transition-all duration-300";
              const activeStyle = isActive 
                ? "text-[#ff0055] border border-[#ff0055] px-4 py-1.5 rounded-full bg-[#ff0055]/10 shadow-[0_0_10px_rgba(255,0,85,0.2)]" 
                : "text-gray-400 hover:text-white";

              return l.onClick ? (
                <button key={l.name} onClick={l.onClick} className={`${baseStyle} ${activeStyle}`}>
                  {l.name}
                </button>
              ) : (
                <a key={l.name} href={l.href} className={`${baseStyle} ${activeStyle}`}>
                  {l.name}
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* BUSCADOR */}
          <div className="relative flex items-center" onMouseEnter={() => setIsSearchOpen(true)} onMouseLeave={() => { if (searchTerm === '') setIsSearchOpen(false); }}>
            <motion.div animate={{ width: isSearchOpen ? 240 : 40 }} className={`flex items-center h-10 rounded-xl border ${isSearchOpen ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent'}`}>
              <button onClick={triggerSearch} className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white"><Search size={18} /></button>
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
          </div>

          {/* USUARIO */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-white/10 bg-[#0a0a0a]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ff0055] to-purple-600 flex items-center justify-center">
                  <User size={12} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase text-white tracking-wider">{user.email?.split('@')[0]}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-3 w-60 bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded-lg uppercase tracking-widest">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => document.getElementById('auth-section')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-2.5 bg-[#ff0055] text-white rounded-xl font-black text-[10px] uppercase">Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}