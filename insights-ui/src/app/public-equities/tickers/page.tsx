import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TickerActionsDropdown from './[tickerKey]/TickerActionsDropdown';
import { Metadata } from 'next';
import { PartialNestedTickerReport, SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { getGraphColor, getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export async function generateMetadata(props: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { page } = await props.searchParams;
  const currentPage = parseInt(page || '1');
  const base = 'https://koalagains.com/public-equities/tickers';
  return {
    title: 'REIT Tickers | KoalaGains',
    description:
      'Explore all available REIT tickers. Dive into detailed AI-driven financial reports, analyze key metrics, and streamline your public equities research on KoalaGains.',
    alternates: {
      canonical: currentPage === 1 ? base : `${base}?page=${currentPage}`,
    },
    keywords: [
      'REIT tickers',
      'Tickers List',
      'Public Equities',
      'REIT Financial Reports',
      'KoalaGains',
      'REIT Analysis',
      'Real Estate Investment Trusts',
      'REIT list',
      'Public REITs',
      'REIT performance scores',
    ],
  };
}

interface ScoreIndicatorProps {
  scorePercent: number | null | undefined;
  colors?: {
    lighterBackground?: string;
    background?: string;
    border?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function ScoreIndicator({ scorePercent, colors, size = 'md', className = '' }: ScoreIndicatorProps) {
  // Default colors for fallback
  const defaultColors = {
    lighterBackground: '#f3f4f6',
    border: '#6b7280',
  };

  // Grey colors for empty scores
  const emptyScoreColors = {
    lighterBackground: '#989797', // light grey
    border: '#9ca3af', // medium grey
  };

  // Safely determine if we have a valid score
  const hasValidScore = scorePercent !== null && scorePercent !== undefined && !isNaN(scorePercent) && isFinite(scorePercent);

  // Calculate score out of 20 based on percentage, with comprehensive validation
  const scoreOutOf20 = hasValidScore ? Math.round((scorePercent / 100) * 20) : null;

  // Format percentage for display with fallback
  const formattedPercentage = hasValidScore ? `${Math.round(scorePercent)}%` : '-';

  // Determine sizing based on the size prop
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  // Choose colors based on whether we have a valid score
  const displayColors = hasValidScore
    ? {
        lighterBackground: colors?.lighterBackground && colors.lighterBackground !== 'undefined' ? colors.lighterBackground : defaultColors.lighterBackground,
        border: colors?.border && colors.border !== 'undefined' ? colors.border : defaultColors.border,
      }
    : emptyScoreColors;

  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        <div
          className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center flex-shrink-0 font-medium shadow-sm transition-all duration-200 hover:ring-2 hover:ring-offset-2 hover:ring-offset-gray-100 dark:hover:ring-offset-gray-800`}
          style={{
            backgroundColor: displayColors.lighterBackground,
            color: displayColors.border,
            border: `1px solid ${displayColors.border}`,
          }}
        >
          <span className="text-center" style={{ fontSize: size === 'sm' ? '10px' : undefined }}>
            {hasValidScore && scoreOutOf20 !== null ? `${scoreOutOf20}/20` : '--'}
          </span>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="bg-gray-800 text-white px-4 py-2.5 rounded-md text-xs shadow-md z-50 max-w-xs" sideOffset={5} avoidCollisions>
          {hasValidScore && scoreOutOf20 !== null ? `Performance Score: ${scoreOutOf20}/20 (${formattedPercentage})` : 'No performance score available'}
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface PaginatedTickersResponse {
  tickers: PartialNestedTickerReport[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function getTickersResponse(page: number, pageSize: number): Promise<PaginatedTickersResponse> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tickers?page=${page}&pageSize=${pageSize}`, {
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tickers: ${response.statusText}`);
    }

    const data = await response.json();
    return data || { tickers: [], totalCount: 0, page, pageSize, totalPages: 0 };
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return {
      tickers: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
}

const breadcrumbs: BreadcrumbsOjbect[] = [
  {
    name: 'Reports',
    href: `/reports`,
    current: false,
  },
  {
    name: 'REIT Reports',
    href: `/public-equities/tickers`,
    current: true,
  },
];

// Add viewport meta tag if not already in your _document.js or layout component
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  // Generate page numbers to display with ellipsis for large ranges
  const getPageNumbers = () => {
    const pages = [];

    // Always include first page
    pages.push(1);

    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after page 1 if there's a gap
    if (startPage > 2) {
      pages.push('ellipsis-start');
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if there's a gap
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Always include last page if it exists
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center mt-8 mb-4">
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        {/* Previous Page Button */}
        <Link
          href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : '#'}
          className={`flex items-center rounded-md px-2 py-1.5 text-sm font-medium ${
            currentPage === 1
              ? 'pointer-events-none text-gray-400 dark:text-gray-600'
              : 'link-color hover:bg-block-bg-color hover:ring-1 hover:ring-inset hover:ring-border'
          }`}
          aria-disabled={currentPage === 1}
          tabIndex={currentPage === 1 ? -1 : undefined}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>

        {/* Page Numbers - Only show on larger screens */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-sm text-gray-500">
                  ...
                </span>
              );
            }

            return (
              <Link
                key={`page-${page}`}
                href={`${baseUrl}?page=${page}`}
                className={`rounded-md min-w-[32px] text-center px-2 py-1.5 text-sm font-medium ${
                  currentPage === page
                    ? 'bg-block-bg-color ring-1 ring-inset ring-border'
                    : 'link-color hover:bg-block-bg-color hover:ring-1 hover:ring-inset hover:ring-border'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </Link>
            );
          })}
        </div>

        {/* Page Indicator for Small Screens */}
        <span className="sm:hidden px-2 py-1.5 text-sm font-medium">
          {currentPage} / {totalPages}
        </span>

        {/* Next Page Button */}
        <Link
          href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : '#'}
          className={`flex items-center rounded-md px-2 py-1.5 text-sm font-medium ${
            currentPage === totalPages
              ? 'pointer-events-none text-gray-400 dark:text-gray-600'
              : 'link-color hover:bg-block-bg-color hover:ring-1 hover:ring-inset hover:ring-border'
          }`}
          aria-disabled={currentPage === totalPages}
          tabIndex={currentPage === totalPages ? -1 : undefined}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}

export default async function AllTickersPage(props: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await props.searchParams;
  const currentPage = page ? parseInt(page) : 1;
  const pageSize = 20;

  // Fetch paginated tickers directly from the API
  const { tickers, totalPages } = await getTickersResponse(currentPage, pageSize);

  const criteriaResponse = await fetch(
    'https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json',
    { cache: 'no-cache' }
  );
  const industryGroupCriteria = (await criteriaResponse.json()) as IndustryGroupCriteriaDefinition;

  const tickersWithScores = tickers.map((t) => {
    const reportMap = new Map(t.evaluationsOfLatest10Q.map((r) => [r.criterionKey, r]));

    const spiderGraph = Object.fromEntries(
      industryGroupCriteria.criteria.map((c) => {
        const report = reportMap.get(c.key);
        return [
          c.key,
          {
            key: c.key,
            name: c.name,
            summary: c.shortDescription,
            scores:
              report?.performanceChecklistEvaluation?.performanceChecklistItems.map((pc) => ({
                score: pc.score,
                comment: `${pc.checklistItem}: ${pc.oneLinerExplanation}`,
              })) || [],
          },
        ];
      })
    ) as SpiderGraphForTicker;

    const scorePercent = getSpiderGraphScorePercentage(spiderGraph);
    const colors = getGraphColor(scorePercent);

    return { ...t, scorePercent, colors };
  });

  return (
    <Tooltip.Provider delayDuration={300}>
      <PageWrapper className="px-4 sm:px-6">
        <div className="overflow-x-auto">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <PrivateWrapper>
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            <Link
              href={'/public-equities/industry-group-criteria/real-estate/equity-real-estate-investment-trusts-reits/create'}
              className="link-color border border-color rounded-xl p-2 text-sm sm:text-base whitespace-nowrap"
            >
              View Criteria
            </Link>
            <Link href={'/public-equities/tickers/create'} className="link-color border border-color rounded-xl p-2 text-sm sm:text-base whitespace-nowrap">
              Create Ticker
            </Link>
          </div>
        </PrivateWrapper>
        <div className="flex justify-end mb-4">
          <Link
            href={'/public-equities/tickers/compare-metrics-and-checklist'}
            className="link-color border border-color rounded-xl p-2 text-sm sm:text-base whitespace-nowrap"
          >
            Metrics Comparison
          </Link>
        </div>
        <ul role="list" className="divide-y divide-color -mx-4 sm:mx-0 px-4 sm:px-0">
          {tickers.length === 0 ? (
            <li className="py-5 text-center italic text-sm sm:text-base">No tickers found.</li>
          ) : (
            tickersWithScores.map((ticker) => (
              <li key={ticker.tickerKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
                <div className="min-w-0 w-full">
                  <Link href={`/public-equities/tickers/${ticker.tickerKey}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold heading-color">{ticker.companyName || 'Unknown Company'}</p>
                      <p className="whitespace-nowrap rounded-md px-1.5 py-1 text-xs font-medium ring-1 ring-inset ring-border primary-text-color">
                        {ticker.tickerKey}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 mt-1 justify-between">
                    <div className="mt-2 text-xs text-color">
                      <p className="line-clamp-2 sm:line-clamp-none">{ticker.shortDescription || 'No description provided'}</p>
                    </div>
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: ticker.colors.lighterBackground, color: ticker.colors.border }}
                    >
                      <ScoreIndicator scorePercent={ticker.scorePercent} colors={ticker.colors} size="lg" className="text-xs sm:text-sm font-semibold" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 gap-1 sm:gap-3">
                  <Link
                    href={`/public-equities/tickers/${ticker.tickerKey}`}
                    className="rounded-md bg-block-bg-color px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm font-semibold link-color shadow-sm ring-1 ring-inset ring-border hover:bg-block-bg-color whitespace-nowrap"
                  >
                    View Reports
                  </Link>
                  <PrivateWrapper>
                    <div className="scale-90 sm:scale-100 origin-right">
                      <TickerActionsDropdown tickerKey={ticker.tickerKey} />
                    </div>
                  </PrivateWrapper>
                </div>
              </li>
            ))
          )}
        </ul>

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/public-equities/tickers" />}
      </PageWrapper>
    </Tooltip.Provider>
  );
}
