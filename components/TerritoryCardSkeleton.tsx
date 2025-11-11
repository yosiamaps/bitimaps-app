import React from 'react';

const TerritoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 w-full animate-pulse">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
          <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-zinc-800 rounded-full w-20"></div>
      </div>
    </div>
  );
};

export default TerritoryCardSkeleton;
