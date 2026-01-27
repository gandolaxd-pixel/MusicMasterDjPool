import { Play, Pause, Download, Lock, X, Music2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getTrackUrl } from '../../utils/urlUtils';
import { TrackSkeleton } from './TrackSkeleton';

const POOL_COLORS: Record<string, string> = {
  'DJ City': '#ff0055', 'BPM Supreme': '#ff6b00', 'Club Killers': '#ffcc00', 'Heavy Hits': '#00ffcc',
  'Beatport': '#00d4ff', 'LatinRemixes': '#9d00ff', 'BPM Latino': '#ff00aa', 'default': '#ffffff'
};

interface LatestUploadsProps {
  tracks: any[];
  selectedGenre: string | null;
  onGenreSelect: (genre: string | null) => void;
  onToggleCrate: (track: any) => void;
  crate: any[];
  user: any;
  onPlay: (track: any) => void;
  currentTrack: any;
  isPlaying: boolean;
  loading?: boolean;
}

export function LatestUploads({ tracks, selectedGenre, onGenreSelect, user, onPlay, currentTrack, isPlaying, loading = false }: LatestUploadsProps) {

  const filteredTracks = useMemo(() => {
    if (!selectedGenre) return tracks;
    return tracks.filter(track => track.pool_origin?.toLowerCase().includes(selectedGenre.toLowerCase()));
  }, [selectedGenre, tracks]);

  // PAGINATION LOGIC
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Reset page when genre changes
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedGenre]);

  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const currentTracks = filteredTracks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="latest" className="py-12 bg-black min-h-[400px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedGenre ? selectedGenre : 'LATEST'} <span className="text-[#ff0055]">UPLOADS</span></h2>
            {selectedGenre && (
              <button onClick={() => onGenreSelect(null)} className="flex items-center gap-1 px-3 py-1 bg-[#ff0055]/10 border border-[#ff0055]/30 rounded-full text-[#ff0055] text-[10px] font-black uppercase tracking-widest hover:bg-[#ff0055] hover:text-white transition-all"><X size={12} /> Clear Filter</button>
            )}
          </div>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Database: {loading ? '...' : filteredTracks.length} tracks</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {loading ? (
            // Render 10 skeletons while loading
            Array.from({ length: 15 }).map((_, i) => <TrackSkeleton key={i} />)
          ) : currentTracks.length > 0 ? (
            currentTracks.map((track) => {
              const title = track.title || track.filename;
              const artist = track.artist || 'Unknown Artist';
              const poolName = track.pool_origin || 'default';
              const trackColor = POOL_COLORS[poolName] || POOL_COLORS['default'];

              const isActive = currentTrack && currentTrack.id === track.id;
              const isPlayingCurrent = isActive && isPlaying;

              return (
                <div key={`track-${track.id}`} className={`group rounded-xl p-3 transition-all duration-300 ${isActive ? 'bg-white/10 border-l-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-[1.01]' : 'bg-[#0a0a0a] border-l-4 border-white/5 hover:bg-white/[0.03]'}`} style={{ borderLeftColor: isActive ? trackColor : `${trackColor}`, boxShadow: isActive ? `0 0 20px ${trackColor}20` : 'none' }}>
                  <div className="flex items-center gap-4">

                    {/* Botón Play/Pausa */}
                    <button
                      onClick={() => onPlay(track)}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform shadow-lg cursor-pointer ${isActive ? 'scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: isActive ? '#fff' : '#ff0055' }}
                    >
                      {isPlayingCurrent ? (
                        <Pause size={16} className="text-black fill-black" />
                      ) : (
                        <Play size={16} className={`ml-0.5 ${isActive ? 'text-black fill-black' : 'text-white fill-white'}`} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-4 text-left">
                        <h3 className={`font-bold truncate uppercase tracking-tight text-sm transition-colors ${isActive ? 'text-[#ff0055]' : 'text-white group-hover:text-[#ff0055]'}`}>{title}</h3>
                        <div className="flex items-center gap-2">
                          <Music2 size={10} className="text-gray-600" />
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider truncate">{artist}</p>
                        </div>
                      </div>
                      <div className="hidden md:block col-span-1">
                        {(() => {
                          const filename = track.filename || track.file_path || '';
                          const ext = filename.split('.').pop()?.toUpperCase() || 'MP3';
                          const formatColors: Record<string, string> = { 'MP3': '#ff0055', 'WAV': '#00d4ff', 'FLAC': '#ffcc00', 'AIFF': '#9d00ff' };
                          const formatColor = formatColors[ext] || '#ffffff';
                          return (
                            <span className="px-3 py-1 bg-white/5 border rounded-md text-[9px] font-black uppercase tracking-widest truncate block text-center" style={{ color: formatColor, borderColor: `${formatColor}33` }}>{ext}</span>
                          );
                        })()}
                      </div>

                      <div className="md:col-span-1 flex justify-end items-center gap-3">
                        <a
                          href={getTrackUrl(track, true)}
                          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${user ? 'bg-[#ff0055] text-white hover:brightness-110 hover:scale-105 shadow-[0_0_10px_rgba(255,0,85,0.3)]' : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'}`}
                          onClick={(e) => { if (!user) e.preventDefault(); }}
                        >
                          {user ? <Download size={16} /> : <Lock size={14} />}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl"><p className="text-gray-600 font-black uppercase tracking-[0.2em] text-xs">No tracks found for this filter</p></div>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 overflow-x-auto py-4">
            <button
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Simple logic for visible pages: show current, +/- 2, first, last */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              // Show first, last, current, and adjacent pages
              if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-black transition-all ${currentPage === page ? 'bg-[#ff0055] text-white shadow-lg scale-110' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 3 || page === currentPage + 3) {
                return <span key={page} className="text-gray-600 px-1">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}