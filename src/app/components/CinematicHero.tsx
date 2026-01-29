import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

interface CinematicHeroProps {
    onPlay: () => void;
    pack?: any;
    loading?: boolean;
}

export function CinematicHero({ onPlay, pack, loading }: CinematicHeroProps) {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLElement>(null);
    
    // Mouse position tracking for 3D parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    // Smooth spring animation for mouse movement
    const springConfig = { damping: 25, stiffness: 150 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);
    
    // Transform mouse position to rotation values
    const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
    
    // Parallax layers - different speeds for depth effect
    const layer1X = useTransform(smoothMouseX, [-0.5, 0.5], [-30, 30]);
    const layer1Y = useTransform(smoothMouseY, [-0.5, 0.5], [-20, 20]);
    const layer2X = useTransform(smoothMouseX, [-0.5, 0.5], [-15, 15]);
    const layer2Y = useTransform(smoothMouseY, [-0.5, 0.5], [-10, 10]);
    const layer3X = useTransform(smoothMouseX, [-0.5, 0.5], [-5, 5]);
    const layer3Y = useTransform(smoothMouseY, [-0.5, 0.5], [-3, 3]);
    
    // Background parallax (slower, opposite direction for depth)
    const bgX = useTransform(smoothMouseX, [-0.5, 0.5], [20, -20]);
    const bgY = useTransform(smoothMouseY, [-0.5, 0.5], [15, -15]);
    const bgScale = useTransform(smoothMouseX, [-0.5, 0.5], [1.05, 1.15]);
    
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };
        
        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }
        
        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [mouseX, mouseY]);

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
        <section 
            ref={containerRef}
            className="relative h-[85vh] w-full overflow-hidden"
            style={{ perspective: '1000px' }}
        >
            {/* Background Image with Cinematic Gradient - Parallax Layer */}
            <motion.div 
                className="absolute inset-0 z-0"
                style={{ 
                    x: bgX, 
                    y: bgY, 
                    scale: bgScale,
                }}
            >
                <img
                    src="https://www.pioneerdj.com/-/media/pioneerdj/images/news/2019/learn-how-to-dj-online/learnhowtodj_article.png?h=630&w=1200&hash=384F58B20E867AB51E52FDF3D768AE91"
                    alt="Featured DJ Pack"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                    className="w-full h-full object-cover scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-[#000]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#000] via-[#000]/60 to-transparent" />
            </motion.div>
            
            {/* Floating 3D Decorative Elements */}
            <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
                {/* Glowing orb - back layer */}
                <motion.div
                    className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-[#ff0055]/30 to-transparent blur-3xl"
                    style={{ x: layer3X, y: layer3Y }}
                />
                {/* Glowing orb - mid layer */}
                <motion.div
                    className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-2xl"
                    style={{ x: layer2X, y: layer2Y }}
                />
                {/* Accent line - front layer */}
                <motion.div
                    className="absolute top-1/3 left-1/4 w-32 h-1 bg-gradient-to-r from-[#ff0055] to-transparent rounded-full opacity-60"
                    style={{ x: layer1X, y: layer1Y, rotate: rotateY }}
                />
                {/* Floating dots */}
                <motion.div
                    className="absolute top-1/2 right-1/5 w-2 h-2 bg-[#ff0055] rounded-full opacity-80"
                    style={{ x: layer1X, y: layer1Y }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/30 rounded-full"
                    style={{ x: layer2X, y: layer2Y }}
                />
            </div>

            {/* Content - Bottom Left aligned like Netflix - 3D Parallax */}
            <motion.div 
                className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto"
                style={{ 
                    rotateX, 
                    rotateY,
                    transformStyle: 'preserve-3d',
                }}
            >
                <motion.div 
                    className="mt-32 max-w-2xl"
                    style={{ x: layer2X, y: layer2Y }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, z: -50 }}
                        animate={{ opacity: 1, y: 0, z: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ transformStyle: 'preserve-3d' }}
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
                </motion.div>
            </motion.div>

            {/* Bottom Fade for Seamless Integration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
        </section>
    );
}
