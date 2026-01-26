import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface HeroProps {
  onJoinClick: () => void;
}

export function Hero({ onJoinClick }: HeroProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ff0055] rounded-full blur-[120px] opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#00d4ff] rounded-full blur-[120px] opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff6b00] rounded-full blur-[120px] opacity-10"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Exclusive Music Pool for{' '}
            <span className="bg-gradient-to-r from-[#ff0055] via-[#ff6b00] to-[#00d4ff] bg-clip-text text-transparent">
              Professional DJs
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
        >
          Daily updated. Curated tracks. Trusted by DJs worldwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full pl-6 pr-2 py-2">
            <span className="text-[#ff0055] font-black text-xl">$24.99</span>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">/ Month</span>
            <button
              onClick={onJoinClick}
              className="px-8 py-3 bg-[#ff0055] text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#ff0055]/80 hover:scale-105 transition-all"
            >
              Get Access
            </button>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Cancel Anytime • Instant Access</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-[#ff0055] mb-2 uppercase">40TB+</div>
            <div className="text-gray-400 text-xs font-black uppercase tracking-widest">Library Size</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#ff6b00] mb-2 uppercase">Daily</div>
            <div className="text-gray-400 text-xs font-black uppercase tracking-widest">Exclusives</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00d4ff] mb-2 uppercase">HQ</div>
            <div className="text-gray-400 text-xs font-black uppercase tracking-widest">WAV / MP3</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}