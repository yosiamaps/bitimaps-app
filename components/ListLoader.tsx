import React from 'react';
import { LoaderIcon } from './icons/LoaderIcon';

const ListLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-6">
      <LoaderIcon className="w-6 h-6 text-lime-400 animate-spin" />
    </div>
  );
};

export default ListLoader;
