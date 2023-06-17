import React from 'react';

const RowLoading = ({ className }: { className?: string }) => {
  return (
    <div className="px-4 py-3 block">
      <div className="bg-skin-text rounded-md animate-pulse-fast mb-2" style={{ width: '60%', height: '28px' }} />
      <div className="bg-skin-text rounded-md animate-pulse-fast" style={{ width: '50%', height: '28px' }} />
    </div>
  );
};

export default RowLoading;
