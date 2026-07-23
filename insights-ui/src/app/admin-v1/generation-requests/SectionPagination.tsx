'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface SectionPaginationProps {
  currentPage: number;
  totalCount: number;
  rowsOnPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/** Page-number pager for a single status bucket. Shared by the stock and ETF generation-request pages. */
export default function SectionPagination({ currentPage, totalCount, rowsOnPage, pageSize, onPageChange }: SectionPaginationProps): JSX.Element | null {
  const totalPages: number = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  const rangeStart: number = (currentPage - 1) * pageSize + 1;
  const rangeEnd: number = (currentPage - 1) * pageSize + rowsOnPage;

  return (
    <div className="flex items-center justify-between px-2 py-3 mt-3 border-t border-gray-700/60">
      <span className="text-sm text-gray-400">
        Showing {rangeStart}
        {'–'}
        {rangeEnd} of {totalCount}
      </span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="text-sm text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
