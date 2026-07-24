'use client';

import Card from '@dodao/web-core/components/core/card/Card';
import Link from 'next/link';
import React from 'react';
import { PresentationSummary } from '@/types/presentation/presentation-types';
import StatusBadge from '@/components/ui/StatusBadge';

interface PresentationCardProps {
  presentation: PresentationSummary;
}

const PresentationCard: React.FC<PresentationCardProps> = ({ presentation }) => {
  const { presentationId, slideCount, hasPreferences } = presentation;

  return (
    <Card>
      <Link href={`/generate-ppt/${presentationId}`} className="block p-4 h-full w-full hover:bg-surface transition-colors">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-color truncate" title={presentationId}>
              {presentationId}
            </h3>
            <StatusBadge variant={hasPreferences ? 'success' : 'warning'} label={hasPreferences ? 'Ready' : 'Draft'} />
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted">{slideCount ? `${slideCount} slides` : 'No slides yet'}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm text-link hover:underline">View Details →</span>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default PresentationCard;
