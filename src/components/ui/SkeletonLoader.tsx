import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
  return (
    <div
      className={twMerge(
        "animate-pulse bg-muted/50",
        variant === 'text' && "h-4 w-full rounded-md",
        variant === 'rect' && "h-40 w-full rounded-2xl",
        variant === 'circle' && "h-12 w-12 rounded-full",
        className
      )}
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="h-64 lg:col-span-1 rounded-3xl" />
      <Skeleton className="h-64 lg:col-span-2 rounded-3xl" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-3xl" />
      ))}
    </div>
    <Skeleton className="h-[400px] rounded-3xl" />
  </div>
);
