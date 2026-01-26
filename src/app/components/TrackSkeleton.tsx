import { Skeleton } from './ui/Skeleton';

export function TrackSkeleton() {
    return (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0a0a0a] border-l-4 border-white/5">
            {/* Play Button Placeholder */}
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                {/* Title & Artist */}
                <div className="md:col-span-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-4" /> {/* Icon */}
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>

                {/* Pool Tag */}
                <div className="hidden md:block col-span-1">
                    <Skeleton className="h-6 w-20 rounded-md" />
                </div>

                {/* Download Button */}
                <div className="md:col-span-1 flex justify-end">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
