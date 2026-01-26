import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Disc, Download, Volume2, VolumeX } from 'lucide-react';
import { getTrackUrl } from '../../utils/urlUtils';

type Props = {
  url: string;
  title: string;
  artist: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
};

export function AudioPlayer({ url, title, artist, isPlaying, onTogglePlay }: Props) {
  const { user } = useAuth();
  const { currentTrack } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Play error", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;

    // Verificamos que 'total' sea un número finito válido
    const validDuration = Number.isFinite(total) ? total : 0;

    setCurrentTime(current);
    setDuration(validDuration);
    setProgress(validDuration ? (current / validDuration) * 100 : 0);
  };

  // 🛡️ CORRECCIÓN CRÍTICA AQUÍ: Blindaje contra errores de 'Non-Finite'
  const seek = (clientX: number) => {
    // 1. Si no hay audio, o la duración no es válida (NaN o Infinita), NO hacemos nada.
    if (!audioRef.current || !barRef.current || !Number.isFinite(duration) || duration <= 0) return;

    const rect = barRef.current.getBoundingClientRect();
    if (rect.width === 0) return; // Evitar división por cero

    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const newTime = percent * duration;

    // 2. Comprobación final antes de aplicar el tiempo
    if (Number.isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    if (!time || !Number.isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const downloadUrl = url ? (url.includes('?') ? `${url}&download=true` : `${url}?download=true`) : "#";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => onTogglePlay()}
        crossOrigin="anonymous"
        onError={(e) => console.error("Audio Load Error:", e)} // Log extra para ver errores
      />

      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="max-w-7xl mx-auto bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-4 md:gap-6">

          <div className="flex items-center gap-3 min-w-[150px] md:min-w-[200px] max-w-[250px]">
            <div className="relative flex-shrink-0">
              <motion.div animate={isPlaying ? { rotate: 360 } : {}} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Disc size={38} className={`${isPlaying ? 'text-[#ff0055]' : 'text-gray-500'} transition-colors duration-500`} />
              </motion.div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-[#ff0055] text-[8px] font-black uppercase tracking-widest">Now Playing</p>
              <p className="text-white text-xs md:text-sm font-bold truncate">{title || 'Loading...'}</p>
              <p className="text-gray-400 text-[10px] truncate">{artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <SkipBack size={18} className="text-gray-400 hover:text-white cursor-pointer" />
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onTogglePlay} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:bg-[#ff0055] hover:text-white transition-colors">
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </motion.button>
            <SkipForward size={18} className="text-gray-400 hover:text-white cursor-pointer" />
          </div>

          <div className="flex-1 flex items-center gap-3">
            <span className="text-[9px] font-mono text-gray-400 w-8 text-right hidden sm:block">{formatTime(currentTime)}</span>
            <div ref={barRef} className="relative flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group py-2" onClick={(e) => seek(e.clientX)}>
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/10 rounded-full pointer-events-none"></div>
              <div className="h-1 bg-[#ff0055] rounded-full relative top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-100" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>
            <span className="text-[9px] font-mono text-gray-400 w-8 hidden sm:block">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-4 border-l border-white/10 pl-4">
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 md:w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff0055] hover:bg-white/20 transition-all"
              />
            </div>

            <motion.a
              whileHover={{ scale: 1.05 }}
              href={currentTrack ? getTrackUrl(currentTrack, true) : '#'}
              download
              target="_self"
              onClick={async (e) => {
                if (currentTrack && user) {
                  // Recording download logic
                  const { supabase } = await import('../../supabase');
                  await supabase.from('downloads').insert({
                    user_id: user.id,
                    track_title: currentTrack.title || title,
                    track_path: currentTrack.file_path || currentTrack.filename
                  });
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white hover:border-[#ff0055] hover:text-[#ff0055] transition-all"
            >
              <Download size={14} />
            </motion.a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}