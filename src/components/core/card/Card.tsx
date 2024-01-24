import { PropsWithChildren } from 'react';

export interface CardProps extends PropsWithChildren {
  onClick?: () => void;
  className?: string;
}

export default function Card({ children, onClick, className }: CardProps) {
  return (
    <div
      role="listitem"
      className={`border border-gray-200 rounded-xl shadow-md transform hover:scale-95 transition duration-300 ease-in-out max-w-md ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
