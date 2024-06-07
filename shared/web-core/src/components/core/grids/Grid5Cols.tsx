import React from 'react';

interface Grid5ColsProps {
  children: React.ReactNode;
  className?: string;
}

export default function Grid5Cols({ children, className }: Grid5ColsProps) {
  return <div className={`grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 ${className || ''}`}>{children}</div>;
}
