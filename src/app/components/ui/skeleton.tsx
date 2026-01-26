import React from 'react';
import { cn } from '../../../lib/utils'; // Assuming you have a utils file or similar, if not I'll create a simple helper or use inline classes

// If utils doesn't exist, I'll stick to a simpler implementation first and we can refactor later if needed, 
// but standard shadcn/ui pattern uses cn. I'll assume standard className prop for now.

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/10 ${className}`}
      {...props}
    />
  );
}
