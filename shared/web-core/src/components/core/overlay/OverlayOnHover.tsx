import React, { ReactNode } from 'react';

interface OverlayProps {
  children: ReactNode;
}

export default function Overlay({ children }: OverlayProps) {
  return (
    //make sure to give 'relative' class to the outer element of this component
    <div className="absolute w-full h-full inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {children}
    </div>
  );
}
