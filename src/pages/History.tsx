import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Download, Calendar, Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrackUrl } from '../utils/urlUtils';

interface DownloadRecord {
    id: string;
    track_title: string;
    track_path: string;
    created_at: string;
}

export const HistoryPage = ({ user }: { user: any }) => {
    const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, currentTrack, isPlaying } = usePlayer();

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('downloads')
                .select('*')
                .eq('user_id', user.id) // Ensure RLS policy
                .order('created_at', { ascending: false });

            if (!error && data) {
                setDownloads(data);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [user]);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                    Download <span className="text-[#ff0055]">History</span>
                </h1>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">Loading history...</div>
            ) : downloads.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No downloads yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {downloads.map(item => {
                        const isActive = currentTrack && (currentTrack.title === item.track_title);
                        const isPlayingCurrent = isActive && isPlaying;

                        return (
                            <div key={item.id} className={`bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-[#ff0055]/30 transition-all group ${isActive ? 'border-[#ff0055] bg-white/5' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => playTrack({
                                            id: item.id,
                                            title: item.track_title,
                                            filename: item.track_path, // Fallback
                                            file_path: item.track_path // Clave para el stream
                                        } as any)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isActive ? 'bg-white scale-110' : 'bg-white/5 text-[#ff0055] hover:bg-[#ff0055] hover:text-white hover:scale-110'}`}
                                    >
                                        {isPlayingCurrent ? <Pause size={16} className={isActive ? "text-black fill-black" : ""} /> : <Play size={16} className={isActive ? "text-black fill-black ml-0.5" : "ml-0.5"} />}
                                    </button>
                                    <div>
                                        <div className={`font-bold text-sm uppercase tracking-tight ${isActive ? 'text-[#ff0055]' : 'text-white'}`}>{item.track_title}</div>
                                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                                            <Calendar size={10} />
                                            {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={getTrackUrl({
                                            id: item.id,
                                            title: item.track_title,
                                            track_title: item.track_title, // Compatibilidad
                                            file_path: item.track_path,
                                            server_path: item.track_path
                                        } as any, true)}
                                        download
                                        target="_self"
                                        className="px-4 py-2 bg-[#ff0055]/10 border border-[#ff0055]/20 text-[#ff0055] hover:bg-[#ff0055] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                    >
                                        <Download size={12} /> Download Again
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
