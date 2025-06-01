'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { PlatformImage } from './PlatformImage';

interface PlatformSelectionProps {
  selectedPlatforms: string[];
  togglePlatform: (platform: string) => void;
  platforms?: string[];
  error?: string;
  title?: string;
  description?: string;
}

/**
 * A reusable component for selecting multiple platforms with checkboxes
 */
const PlatformSelection: React.FC<PlatformSelectionProps> = ({
  selectedPlatforms,
  togglePlatform,
  platforms = ['Aave', 'Morpho', 'Spark'],
  error,
  title = 'Compare With',
  description = 'Select one or more platforms to compare Compound rates against.',
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-1 text-theme-primary">{title}</h3>
      <p className="text-sm text-theme-muted mb-3">{description}</p>

      <div className="flex flex-wrap gap-3">
        {platforms.map((p) => {
          const isSel = selectedPlatforms.includes(p);

          return (
            <div
              key={p}
              onClick={() => togglePlatform(p)}
              className={`rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors border ${isSel ? 'chip-selected' : 'border-theme-primary'} ${
                error ? 'border-red-500' : ''
              }`}
            >
              <div className="chip-checkbox w-4 h-4 rounded border mr-2 flex items-center justify-center">
                {isSel && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {p && (
                <span className="mr-2">
                  <PlatformImage platform={p.toLowerCase()} />
                </span>
              )}
              <span className="text-theme-primary chip-label">{p}</span>
            </div>
          );
        })}
      </div>
      {error && (
        <div className="mt-2 flex items-center text-red-500 text-sm">
          <AlertCircle size={16} className="mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PlatformSelection;
