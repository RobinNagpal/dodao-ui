'use client';

import Card from '@dodao/web-core/components/core/card/Card';
import Link from 'next/link';
import React from 'react';
import { PresentationSummary } from '@/types/presentation/presentation-types';

interface PresentationCardProps {
  presentation: PresentationSummary;
}

const PresentationCard: React.FC<PresentationCardProps> = ({ presentation }) => {
  const { presentationId, slideCount, hasPreferences } = presentation;

  return (
    <Card>
      <Link href={`/generate-ppt/${presentationId}`} className="block p-4 h-full w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-color truncate" title={presentationId}>
              {presentationId}
            </h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                hasPreferences
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {hasPreferences ? 'Ready' : 'Draft'}
            </span>
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">{slideCount ? `${slideCount} slides` : 'No slides yet'}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View Details →</span>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default PresentationCard;
