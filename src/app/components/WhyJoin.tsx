import { motion } from 'motion/react';
import { Award, Scissors, FileAudio, Zap, Users } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'High-Quality Exclusive Edits',
    description: 'Professionally produced edits you won\'t find anywhere else',
  },
  {
    icon: Scissors,
    title: 'Clean Intros & Outros',
    description: 'Perfect transitions for seamless mixing',
  },
  {
    icon: FileAudio,
    title: 'DJ-Ready Formats',
    description: 'WAV, FLAC, and MP3 320kbps - your choice',
  },
  {
    icon: Zap,
    title: 'Fast Downloads',
    description: 'High-speed servers for instant access',
  },
  {
    icon: Users,
    title: 'Curated by Real DJs',
    description: 'Music selected by working professionals who know what works',
  },
];

export function WhyJoin() {
  return (
    <section className="py-20 bg-gradient-to-b from-zinc-950 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Why Join Our DJ Pool
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built by DJs, for DJs. Everything you need to stay ahead of the curve.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-all"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                
                <div className="relative z-10">
                  <div className="inline-block p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
