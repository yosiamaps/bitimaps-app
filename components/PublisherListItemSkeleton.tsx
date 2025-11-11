import React from 'react';

const PublisherListItemSkeleton: React.FC = () => {
  return (
    <li className="bg-zinc-900 p-5 rounded-2xl shadow-sm flex justify-between items-center animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-zinc-700 rounded w-32"></div>
        <div className="h-3 bg-zinc-700 rounded w-20"></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-zinc-700 rounded w-24"></div>
        <div className="w-9 h-9 bg-zinc-800 rounded-full"></div>
      </div>
    </li>
  );
};

export default PublisherListItemSkeleton;
