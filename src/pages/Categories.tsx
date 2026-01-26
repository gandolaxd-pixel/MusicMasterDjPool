import React, { useMemo, useState } from 'react';
import { LatestUploads } from '../app/components/LatestUploads';
import { usePlayer } from '../context/PlayerContext';
import { useCrate } from '../context/CrateContext';
import { Folder, ChevronRight, Home, FolderOpen } from 'lucide-react';

interface CategoriesProps {
    realTracks: any[];
    user: any;
}

export const CategoriesPage: React.FC<CategoriesProps> = ({ realTracks, user }) => {
    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const { crate, toggleCrate } = useCrate();
    const [currentPath, setCurrentPath] = useState<string>('');

    // Folder Logic
    const { folders, files } = useMemo(() => {
        // 1. Filter tracks that belong to current path
        const tracksInPath = realTracks.filter(t => {
            const path = t.file_path || t.filename || '';
            // If currentPath is empty, we are at root.
            if (!currentPath) return true;
            return path.startsWith(currentPath);
        });

        // 2. Extract next level folders and files
        const uniqueFolders = new Set<string>();
        const currentFiles: any[] = [];

        tracksInPath.forEach(t => {
            const path = t.file_path || t.filename || '';
            const relativePath = currentPath ? path.slice(currentPath.length + 1) : path; // +1 for slash
            const parts = relativePath.split('/');

            if (parts.length > 1) {
                // It's a folder
                if (parts[0]) uniqueFolders.add(parts[0]);
            } else {
                // It's a file in this directory
                currentFiles.push(t);
            }
        });

        return {
            folders: Array.from(uniqueFolders).sort(),
            files: currentFiles
        };
    }, [realTracks, currentPath]);

    const navigateTo = (folderName: string) => {
        setCurrentPath(prev => prev ? `${prev}/${folderName}` : folderName);
    };

    const navigateUp = () => {
        setCurrentPath(prev => {
            if (!prev.includes('/')) return '';
            return prev.substring(0, prev.lastIndexOf('/'));
        });
    };

    const navigateHome = () => setCurrentPath('');

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header & Breadcrumbs */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-6">
                        Server <span className="text-[#ff0055]">Browser</span>
                    </h1>

                    <div className="flex items-center gap-2 text-sm bg-white/5 p-3 rounded-lg border border-white/10 overflow-x-auto">
                        <button onClick={navigateHome} className="p-1 hover:text-white text-gray-400 transition-colors">
                            <Home size={16} />
                        </button>
                        {currentPath.split('/').filter(Boolean).map((part, index, arr) => (
                            <React.Fragment key={part}>
                                <ChevronRight size={14} className="text-gray-600" />
                                <button
                                    onClick={() => {
                                        // Reconstruct path up to this part
                                        const newPath = arr.slice(0, index + 1).join('/');
                                        setCurrentPath(newPath);
                                    }}
                                    className={`font-bold uppercase tracking-wider ${index === arr.length - 1 ? 'text-[#ff0055]' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {part}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Folders Grid */}
                {folders.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Parent Folder Button if not root */}
                        {currentPath && (
                            <button
                                onClick={navigateUp}
                                className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                            >
                                <FolderOpen size={32} className="text-gray-500 group-hover:text-white transition-colors" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">.. Back</span>
                            </button>
                        )}

                        {folders.map(folder => (
                            <button
                                key={folder}
                                onClick={() => navigateTo(folder)}
                                className="flex flex-col items-center justify-center gap-3 p-6 bg-[#111] border border-white/5 rounded-xl hover:border-[#ff0055] hover:bg-[#ff0055]/5 transition-all group"
                            >
                                <Folder size={32} className="text-[#ff6b00] group-hover:text-[#ff0055] transition-colors" fill="currentColor" fillOpacity={0.2} />
                                <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-full">{folder}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Files List */}
                {files.length > 0 && (
                    <div className="border-t border-white/10 pt-8 animate-in fade-in duration-700">
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Files</h2>
                            <span className="text-xs text-gray-500 font-mono">({files.length})</span>
                        </div>
                        <LatestUploads
                            tracks={files}
                            selectedGenre={null}
                            onGenreSelect={() => { }}
                            onToggleCrate={toggleCrate}
                            crate={crate}
                            user={user}
                            onPlay={playTrack}
                            currentTrack={currentTrack}
                            isPlaying={isPlaying}
                        />
                    </div>
                )}

                {folders.length === 0 && files.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Empty Directory</p>
                    </div>
                )}
            </div>
        </div>
    );
};
