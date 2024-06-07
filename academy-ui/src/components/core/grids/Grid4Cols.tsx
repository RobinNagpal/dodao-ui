import React from 'react';

interface Grid4ColsProps {
  children: React.ReactNode;
  className?: string;
}

export const Grid4Cols: React.FC<Grid4ColsProps> = ({ children, className }) => {
  return <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 ${className || ''}`}>{children}</div>;
};
