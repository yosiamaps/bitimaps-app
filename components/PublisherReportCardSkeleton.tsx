import React from 'react';

const PublisherReportCardSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 w-full animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 bg-zinc-700 rounded w-32"></div>
          <div className="h-4 bg-zinc-700 rounded w-20"></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-4 mt-4 space-y-3">
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-zinc-700 rounded-full"></div>
            <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
        </div>
         <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-zinc-700 rounded-full"></div>
            <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
        </div>
         <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-zinc-700 rounded-full"></div>
            <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default PublisherReportCardSkeleton;
