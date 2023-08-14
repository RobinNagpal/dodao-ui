import React from 'react';

interface Grid2ColsProps {
  children: React.ReactNode;
  className?: string;
}

export const Grid2Cols: React.FC<Grid2ColsProps> = ({ children, className }) => {
  return <div className={`grid grid-cols-1 md:grid-cols-2 gap-4  ${className || ''}`}>{children}</div>;
};
