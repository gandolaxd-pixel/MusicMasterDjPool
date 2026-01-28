import { useRef } from 'react';
import { ChevronRight, ChevronLeft, Play, Lock } from 'lucide-react';

interface GenreRowProps {
    title: string;
    items: any[];
    onPlay: (item: any) => void;
    user?: any;
}

export function GenreRow({ title, items, onPlay, user }: GenreRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth + 100 : current.offsetWidth - 100;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="px-4 md:px-12 mb-4 flex items-end justify-between group">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight cursor-pointer hover:text-[#ff0055] transition-colors flex items-center gap-2">
                    {title}
                    <span className="text-xs text-[#ff0055] opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black tracking-widest translate-x-2">Explore All <ChevronRight className="inline" size={12} /></span>
                </h2>

                {/* Scroll Indicators */}
                <div className="hidden md:flex items-center gap-2">
                    <button onClick={() => scroll('left')} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={() => scroll('right')} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 px-4 md:px-12 pb-8 no-scrollbar scroll-smooth"
            >
                {items.map((item, i) => (
                    <div
                        key={`${item.id}-${i}`}
                        className="relative flex-none w-[160px] md:w-[220px] group cursor-pointer"
                    >
                        {/* Card Image */}
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-[#111]">
                            <img
                                src={item.img || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80"}
                                alt={item.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                                decoding="async"
                            />
                            {/* Overlay Play Button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => onPlay(item)}
                                    className="w-12 h-12 bg-[#ff0055] rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
                                >
                                    <Play fill="white" size={20} className="ml-1" />
                                </button>
                            </div>
                            {!user && (
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full">
                                    <Lock size={12} className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Card Meta */}
                        <div>
                            <h3 className="text-white font-bold text-sm truncate group-hover:text-[#ff0055] transition-colors">{item.title}</h3>
                            <p className="text-gray-500 text-xs truncate">{item.artist}</p>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
