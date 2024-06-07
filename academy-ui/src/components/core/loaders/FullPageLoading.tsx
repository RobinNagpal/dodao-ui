// FullPageLoader.tsx
import ArrowPathRoundedSquareIcon from '@heroicons/react/24/outline/ArrowPathRoundedSquareIcon';
import React from 'react';

type FullPageLoaderProps = {
  message?: string;
};

export default function FullPageLoader({ message }: FullPageLoaderProps) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-opacity-75 z-50">
      <div className="text-center">
        <ArrowPathRoundedSquareIcon className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
        {message && <p className="mt-4 text-xl font-semibold text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
