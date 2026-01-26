import { motion } from 'framer-motion';
import { Database, Activity, Clock } from 'lucide-react';

interface DashboardHeroProps {
    user: any;
}

export function DashboardHero({ user }: DashboardHeroProps) {
    return (
        <section className="relative pt-32 pb-12 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#ff0055]/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff0055]/10 border border-[#ff0055]/20 text-[#ff0055] text-[10px] font-black uppercase tracking-widest mb-4"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#ff0055] animate-pulse" />
                            Live Database
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
                            Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0055] to-purple-600">Center</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest mt-2 text-xs md:text-sm">
                            Welcome back, {user?.email?.split('@')[0] || 'Guest DJ'}
                        </p>
                    </div>

                    {/* Stats Panel */}
                    <div className="flex gap-4 md:gap-8 bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl text-blue-400">
                                <Database size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white leading-none">43.2k</div>
                                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Total Tracks</div>
                            </div>
                        </div>
                        <div className="w-px bg-white/5" />
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl text-green-400">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white leading-none">128</div>
                                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Added Today</div>
                            </div>
                        </div>
                        <div className="w-px bg-white/5 hidden sm:block" />
                        <div className="flex items-center gap-4 hidden sm:flex">
                            <div className="p-3 bg-white/5 rounded-xl text-yellow-400">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white leading-none">2m</div>
                                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Last Update</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
            </div>
        </section>
    );
}
