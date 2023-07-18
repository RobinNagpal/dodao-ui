import React from 'react';

const TidbitsSkeleton: React.FC = () => {
  const cards = [0, 1, 2, 3, 4, 5].map((index) => (
    <div key={index} className="animate-pulse m-3 mb-8 flex-1" style={{ flexBasis: 'calc(33.33% - 2rem)' }}>
      <div className="rounded-lg bg-white h-60 w-full" style={{ height: '4rem' }} />
      <div className="mt-4 h-4 bg-white rounded w-3/4" style={{ width: '75%' }} />
      <div className="mt-2 h-4 bg-white rounded w-1/2" style={{ width: '50%' }} />
    </div>
  ));

  return <div className="flex flex-wrap justify-between">{cards}</div>;
};

export default TidbitsSkeleton;
