import React from 'react';

function LoadingPlaceholder() {
  return (
    <div>
      <div className="bg-gray-300 rounded-md animate-pulse mb-3" style={{ width: '100%', height: '34px' }} />
      <div className="bg-gray-300 rounded-md animate-pulse mb-3" style={{ width: '40%', height: '34px' }} />
      <div className="bg-gray-300 rounded-md animate-pulse mb-4" style={{ width: '65px', height: '28px' }} />
    </div>
  );
}

export default LoadingPlaceholder;
