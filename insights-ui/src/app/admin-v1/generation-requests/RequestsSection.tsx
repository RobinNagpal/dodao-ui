'use client';

import GenerationRequestsTable, { GenerationRequestWithFlags } from '@/app/admin-v1/generation-requests/GenerationRequestsTable';
import SectionPagination from '@/app/admin-v1/generation-requests/SectionPagination';
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
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onReloadRequest: (request: GenerationRequestWithFlags) => void;
}

/** One status bucket: bordered card + count header + table / loading / empty state + page-number pager. */
export default function RequestsSection({
  title,
  tone,
  rows,
  totalCount,
  loading,
  currentPage,
  pageSize,
  onPageChange,
  onReloadRequest,
}: RequestsSectionProps): JSX.Element {
  return (
    <div className={`bg-gray-800 border ${BORDER_CLASS[tone]} rounded-lg p-3`}>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-gray-400">
          {totalCount} total item{totalCount === 1 ? '' : 's'}
        </span>
      </div>

      {loading && rows.length === 0 ? (
        <div className="py-6">Loading generation requests...</div>
      ) : rows.length === 0 ? (
        <div className="py-3 text-gray-400">No {title.toLowerCase()}.</div>
      ) : (
        <>
          <GenerationRequestsTable rows={rows} onReloadRequest={onReloadRequest} />
          <SectionPagination currentPage={currentPage} totalCount={totalCount} rowsOnPage={rows.length} pageSize={pageSize} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}
