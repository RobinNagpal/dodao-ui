import React from 'react';

const RowLoading = ({ className }: { className?: string }) => {
  return (
    <div className="flex flex-col gap-5 w-full py-4 px-2 border-b border-gray-200 animate-pulse">
      <div className="w-2/12 ml-4 bg-gray-300 rounded h-10"></div>
      <div className="w-2/12 ml-4 bg-gray-300 rounded h-10"></div>
      <div className="w-2/12 ml-4 bg-gray-300 rounded h-10"></div>
    </div>
  );
};

export default RowLoading;
