'use client';

import GenerationRequestsTable, { GenerationRequestWithFlags } from '@/app/admin-v1/generation-requests/GenerationRequestsTable';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React from 'react';

type BorderTone = 'blue' | 'gray' | 'red' | 'green';

const BORDER_CLASS: Record<BorderTone, string> = {
  blue: 'border-blue-500',
  gray: 'border-gray-500',
  red: 'border-red-500',
  green: 'border-green-500',
};

interface RequestsSectionProps {
  title: string;
  tone: BorderTone;
  rows: GenerationRequestWithFlags[];
  totalCount: number;
  loading: boolean;
  onShowMore: () => void;
  onReloadRequest: (request: GenerationRequestWithFlags) => void;
}

/** One status bucket: bordered card + count header + table / loading / empty state. */
export default function RequestsSection({ title, tone, rows, totalCount, loading, onShowMore, onReloadRequest }: RequestsSectionProps): JSX.Element {
  const hasMore: boolean = rows.length < totalCount;
  return (
    <div className={`bg-gray-800 border ${BORDER_CLASS[tone]} rounded-lg p-3`}>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Showing {rows.length} of {totalCount} total item{totalCount === 1 ? '' : 's'}
          </span>
          {hasMore && (
            <Button onClick={onShowMore} variant="text" className="text-blue-400 hover:text-blue-300">
              Show More
            </Button>
          )}
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div className="py-6">Loading generation requests...</div>
      ) : rows.length === 0 ? (
        <div className="py-3 text-gray-400">No {title.toLowerCase()}.</div>
      ) : (
        <GenerationRequestsTable rows={rows} onReloadRequest={onReloadRequest} />
      )}
    </div>
  );
}
