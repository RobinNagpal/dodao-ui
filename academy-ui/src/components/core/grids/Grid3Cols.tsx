import React from 'react';

interface Grid3ColsProps {
  children: React.ReactNode;
}

export const Grid3Cols: React.FC<Grid3ColsProps> = ({ children }) => {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
};
