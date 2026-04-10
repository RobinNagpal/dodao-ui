'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface EtfPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function EtfPagination({ currentPage, totalPages }: EtfPaginationProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const navigateToPage = (page: number): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }

    // If going to page 1 with no other filters, navigate to static page
    const hasFilters = Array.from(params.keys()).some((k) => k !== 'page');
    const targetPage = page <= 1 ? 1 : page;

    if (targetPage === 1 && !hasFilters && pathname.includes('/etfs-filtered')) {
      router.push('/etfs');
    } else {
      const filteredPath = pathname.includes('/etfs-filtered') ? pathname : '/etfs-filtered';
      const qs = params.toString();
      router.push(qs ? `${filteredPath}?${qs}` : filteredPath);
    }
  };

  // Build visible page numbers: show first, last, current +/- 2, with ellipses
  const pages: (number | 'ellipsis')[] = [];
  const addPage = (p: number) => {
    if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p);
  };

  addPage(1);
  if (currentPage - 2 > 2) pages.push('ellipsis');
  for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
    addPage(i);
  }
  if (currentPage + 2 < totalPages - 1) pages.push('ellipsis');
  if (totalPages > 1) addPage(totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {pages.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => navigateToPage(item)}
            className={`min-w-[2.25rem] h-9 rounded-lg text-sm font-medium transition-colors ${
              item === currentPage ? 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black' : 'text-gray-400 hover:text-white hover:bg-[#374151]'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </nav>
  );
}
