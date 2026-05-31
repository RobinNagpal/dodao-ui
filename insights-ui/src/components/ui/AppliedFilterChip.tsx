'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface AppliedFilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

export default function AppliedFilterChip({ label, onRemove, className = '' }: AppliedFilterChipProps): JSX.Element {
  return (
    <div
      className={[
        'inline-flex items-center gap-2 text-black px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B]',
        className,
      ].join(' ')}
    >
      <span>{label}</span>
      <button onClick={onRemove} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5" aria-label={`Remove ${label}`} type="button">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
