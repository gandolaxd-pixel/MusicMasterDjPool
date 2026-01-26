import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CinematicHeroProps {
    onPlay: () => void;
    pack?: any;
    loading?: boolean;
}

export function CinematicHero({ onPlay, pack, loading }: CinematicHeroProps) {
    const navigate = useNavigate();

    // Parse logic for dynamic title
    const title = pack?.title || pack?.name || "La Rompe Discoteca Vol. 4";
    const subtitle = pack ? "Featured Pack" : "Latin Tech House";

    // Attempt to split title for visual effect if it's long enough
    const titleParts = title.split(' ');
    const firstPart = titleParts.slice(0, Math.ceil(titleParts.length / 2)).join(' ');
    const secondPart = titleParts.slice(Math.ceil(titleParts.length / 2)).join(' ');

    const handleViewPack = () => {
        if (pack && pack.original_folder) {
            // Remove leading slash if present for cleaner URL, though logic handles both

            navigate(`/packs?folder=${encodeURIComponent(pack.original_folder)}`);
        } else {
            navigate('/packs');
        }
    };

    return (
        <section className="relative h-[85vh] w-full overflow-hidden">
            {/* Background Image with Cinematic Gradient */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
                    alt="Featured DJ Pack"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-[#000]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#000] via-[#000]/60 to-transparent" />
            </div>

            {/* Content Content - Bottom Left aligned like Netflix */}
            <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto">
                <div className="mt-32 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#ff0055] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                #1 Trending
                            </span>
                            <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded">
                                {loading ? "Loading..." : subtitle}
                            </span>
                        </div>

                        {/* Giant Typography Title - SKELETON HANDLING */}
                        <div className="mb-6">
                            {loading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-16 md:h-24 bg-white/10 rounded w-3/4"></div>
                                    <div className="h-12 md:h-16 bg-white/10 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] italic tracking-tighter uppercase drop-shadow-2xl">
                                    {pack ? (
                                        <>
                                            <span className="text-white drop-shadow-md">{firstPart}</span>
                                            <br />
                                            <span className="text-4xl md:text-6xl text-[#ff0055]">{secondPart}</span>
                                        </>
                                    ) : (
                                        <>
                                            La <span className="text-white">Rompe</span>
                                            <br />
                                            <span className="text-4xl md:text-6xl text-[#ff0055]">Discoteca Vol. 4</span>
                                        </>
                                    )}
                                </h1>
                            )}
                        </div>

                        <p className="text-gray-300 text-lg md:text-xl font-medium mb-8 line-clamp-2 max-w-lg drop-shadow-md">
                            {loading ? (
                                <span className="block h-6 bg-white/10 rounded w-full animate-pulse"></span>
                            ) : (
                                pack ? `Exclusive access to ${pack.name}. Contains high-quality mastered tracks ready for the club.` :
                                    "The ultimate pack for prime-time energy. Featuring exclusive edits of Bad Bunny, Feid, and Karol G mixed with high-energy Tech House drops."
                            )}
                        </p>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onPlay}
                                disabled={loading}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-lg text-lg font-bold transition-all shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play fill="black" size={24} /> Play Pack
                            </button>
                            <button
                                onClick={handleViewPack}
                                disabled={loading}
                                className="flex items-center gap-3 px-8 py-4 bg-[#ffffff]/20 backdrop-blur-md border border-white/10 text-white hover:bg-[#ffffff]/30 rounded-lg text-lg font-bold transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Info size={24} /> View Pack
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Fade for Seamless Integration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
        </section>
    );
}
