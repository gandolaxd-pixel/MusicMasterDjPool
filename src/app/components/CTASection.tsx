import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onJoinClick: () => void;
}

export function CTASection({ onJoinClick }: CTASectionProps) {
  return (
    <section className="py-24 bg-gradient-to-b from-zinc-950 to-black relative overflow-hidden">
      {/* Background Image con Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 z-0 opacity-30">
        <img
          src="https://images.unsplash.com/photo-1648260029310-5f1da359af9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Concert crowd"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black/40 to-[#050505]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter">
            Ready to Join the
            <br />
            <span className="bg-gradient-to-r from-[#ff0055] via-[#ff6b00] to-[#00d4ff] bg-clip-text text-transparent">
              DJ Community?
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed">
            Get instant access to our 40TB library. 
            <br />Curated by professionals for professionals.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button 
              onClick={onJoinClick}
              className="group px-10 py-5 bg-[#ff0055] text-white text-xl font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_40px_rgba(255,0,85,0.4)] transition-all transform hover:scale-105 flex items-center gap-3"
            >
              Join the Pool Now
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mt-8"
          >
            Trusted by 10,000+ DJs Worldwide • Daily Updates
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}