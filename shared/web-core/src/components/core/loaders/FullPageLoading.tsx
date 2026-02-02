'use client';

// FullPageLoader.tsx
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import React from 'react';

type FullPageLoaderProps = {
  message?: string;
  className?: string;
};

export default function FullPageLoader({ message, className }: FullPageLoaderProps) {
  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-opacity-75 ${className || ''}`}>
      <div className="text-center z-50">
        <ArrowPathRoundedSquareIcon className="w-12 h-12 animate-spin primary-color mx-auto" />
        {message && <p className="mt-4 text-xl font-semibold text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
