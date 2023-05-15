import React, { PropsWithChildren } from 'react';

const SingleCardLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="section mt-16 flex-auto box-border absolute inset-x-0">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl shadow-lg border border-gray-200 p-6">{children}</div>
      </div>
    </div>
  );
};

export default SingleCardLayout;
