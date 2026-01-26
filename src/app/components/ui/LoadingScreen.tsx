import { Disc } from 'lucide-react';

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 animate-pulse">
                <div className="bg-[#ff0055] p-4 rounded-full shadow-[0_0_50px_rgba(255,0,85,0.4)]">
                    <Disc className="w-12 h-12 text-white animate-spin-slow" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">
                        Music<span className="text-[#ff0055]">Master</span>
                    </h2>
                    <p className="text-[#ff0055] text-[10px] font-bold uppercase tracking-[0.3em]">Loading Experience</p>
                </div>
            </div>
        </div>
    );
}
