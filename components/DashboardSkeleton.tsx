import React from 'react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 animate-pulse">
      <div className="h-8 bg-zinc-800 rounded-md w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Card Skeleton */}
        <div className="bg-zinc-900 p-6 rounded-2xl space-y-4">
          <div className="h-5 bg-zinc-800 rounded-md w-1/4"></div>
          <div className="flex items-center gap-6 mt-4">
            <div className="w-40 h-40 bg-zinc-800 rounded-full"></div>
            <div className="flex-grow space-y-4">
              <div className="h-4 bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
        {/* KDL Card Skeleton */}
        <div className="bg-zinc-900 p-6 rounded-2xl space-y-4">
          <div className="h-5 bg-zinc-800 rounded-md w-1/4 mb-4"></div>
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2.5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent Activity Skeleton */}
      <div className="mt-8">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="h-5 bg-zinc-800 rounded-md w-1/4 mb-4"></div>
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-zinc-800"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded"></div>
                  <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
