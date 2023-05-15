import React from 'react';

interface Grid4ColsProps {
  children: React.ReactNode;
}

export const Grid4Cols: React.FC<Grid4ColsProps> = ({ children }) => {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">{children}</div>;
};
