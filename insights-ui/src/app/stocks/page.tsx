'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getScoreColorClasses } from '@/utils/score-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Metadata } from 'next';
import Link from 'next/link';
import { TickerV1 } from '@prisma/client';
import { getSubIndustryDisplayName, INDUSTRY_MAPPINGS } from '@/lib/mappingsV1';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import LoadingOrError from '@/components/core/LoadingOrError';

const breadcrumbs: BreadcrumbsOjbect[] = [
  {
    name: 'US Stocks',
    href: `/stocks`,
    current: true,
  },
];

export default function StocksPage() {
  // this give build error as we are
  // let tickers: TickerV1[] = [];

  // const apiUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1?country=US`;
  // const response = await fetch(apiUrl);
  // tickers = await response.json();

  const {
    data: tickers,
    loading,
    error,
  } = useFetchData<TickerV1[]>(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1?country=US`, {}, 'Failed to fetch stocks');

  if (loading || error) {
    return <LoadingOrError error={error} loading={loading} />;
  }

  if (!tickers) {
    return (
      <PageWrapper className="px-4 sm:px-6">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <div className="text-center py-12">
          <p className="text-[#E5E7EB] text-lg">No US stocks found.</p>
        </div>
      </PageWrapper>
    );
  }

  // Group tickers by main industry first, then by sub-industry
  const tickersByMainIndustry: Record<string, Record<string, { tickers: TickerV1[]; total: number }>> = {};

  tickers.forEach((ticker) => {
    const mainIndustry = ticker.industryKey || 'Other';
    const subIndustry = ticker.subIndustryKey || 'Other';

    if (!tickersByMainIndustry[mainIndustry]) {
      tickersByMainIndustry[mainIndustry] = {};
    }

    if (!tickersByMainIndustry[mainIndustry][subIndustry]) {
      tickersByMainIndustry[mainIndustry][subIndustry] = { tickers: [], total: 0 };
    }

    tickersByMainIndustry[mainIndustry][subIndustry].tickers.push(ticker);
    tickersByMainIndustry[mainIndustry][subIndustry].total++;
  });

  // Sort tickers by score and take top 4 for display in each sub-industry
  Object.keys(tickersByMainIndustry).forEach((mainIndustry) => {
    Object.keys(tickersByMainIndustry[mainIndustry]).forEach((subIndustry) => {
      tickersByMainIndustry[mainIndustry][subIndustry].tickers = tickersByMainIndustry[mainIndustry][subIndustry].tickers
        .sort((a, b) => b.cachedScore - a.cachedScore)
        .slice(0, 4);
    });
  });

  return (
    <Tooltip.Provider delayDuration={300}>
      <PageWrapper className="px-4 sm:px-6">
        <div className="overflow-x-auto">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>

        <PrivateWrapper>
          <div className="flex flex-wrap justify-end gap-3 mb-6">
            <Link
              href={'/public-equities-v1/create-reports-v1'}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-lg px-4 py-2.5 text-sm sm:text-base whitespace-nowrap transition-colors duration-200 shadow-md"
            >
              Create Stock Reports
            </Link>
            <Link
              href={'/public-equities-v1/analysis-factors'}
              className="bg-[#374151] hover:bg-[#4B5563] text-white font-medium border border-[#4F46E5] rounded-lg px-4 py-2.5 text-sm sm:text-base whitespace-nowrap transition-colors duration-200 shadow-md"
            >
              View Analysis Factors
            </Link>
          </div>
        </PrivateWrapper>

        <div className="w-full mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">US Stocks by Industry</h1>
          <p className="text-[#E5E7EB] text-md mb-6">
            Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed
            financial reports and AI-driven analysis.
          </p>
        </div>

        {/* Main Industries */}
        {Object.keys(tickersByMainIndustry).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#E5E7EB] text-lg">No US stocks found.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
          </div>
        ) : (
          Object.entries(tickersByMainIndustry).map(([mainIndustry, subIndustries]) => {
            const totalCompaniesInIndustry = Object.values(subIndustries).reduce((sum, sub) => sum + sub.total, 0);
            const industryDisplayName = INDUSTRY_MAPPINGS[mainIndustry as keyof typeof INDUSTRY_MAPPINGS] || mainIndustry;

            return (
              <div key={mainIndustry} className="mb-12">
                {/* Industry Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">{industryDisplayName}</h2>
                  <Link href={`/stocks/industry/${encodeURIComponent(mainIndustry)}`} className="text-md text-[#4F46E5] hover:text-[#6366F1] font-medium">
                    View All {totalCompaniesInIndustry} Companies →
                  </Link>
                </div>

                {/* Sub-Industry Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {Object.entries(subIndustries).map(([subIndustry, { tickers: subIndustryTickers, total }]) => (
                    <div
                      key={subIndustry}
                      className="bg-block-bg-color rounded-lg shadow-lg border border-color overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="px-4 py-3 sm:px-6 border-b border-color flex items-center bg-gradient-to-r from-[#374151] to-[#2D3748]">
                        <h3 className="text-lg font-semibold heading-color">{getSubIndustryDisplayName(subIndustry)}</h3>
                        <p className="mt-1 text-sm text-white ml-2 bg-[#4F46E5] px-2 py-0.5 rounded-full">
                          {total} {total === 1 ? 'company' : 'companies'}
                        </p>
                      </div>
                      <ul className="divide-y divide-color flex-grow">
                        {subIndustryTickers.map((ticker) => (
                          <li
                            key={ticker.symbol}
                            className="px-2 py-2 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#2D3748] transition-colors duration-200"
                          >
                            <div className="min-w-0 w-full">
                              <div className="flex items-center justify-between">
                                <Link href={`/stocks/${ticker.exchange}/${ticker.symbol}`} className="w-full">
                                  <div className="flex gap-2 items-center">
                                    {(() => {
                                      const score = ticker.cachedScore || 0;
                                      let { textColorClass, bgColorClass, scoreLabel } = getScoreColorClasses(score);

                                      return (
                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <p
                                              className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[50px] text-right`}
                                            >
                                              <span className="font-mono tabular-nums text-right text-xs w-[50px]">{score}/25</span>
                                            </p>
                                          </Tooltip.Trigger>
                                          <Tooltip.Portal>
                                            <Tooltip.Content className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm shadow-lg z-50" sideOffset={5}>
                                              {scoreLabel} Score: {score}/25
                                              <Tooltip.Arrow className="fill-gray-900" />
                                            </Tooltip.Content>
                                          </Tooltip.Portal>
                                        </Tooltip.Root>
                                      );
                                    })()}
                                    <p className="whitespace-nowrap rounded-md px-2 py-.5 text-sm font-medium bg-[#4F46E5] text-white self-center shadow-sm">
                                      {ticker.symbol}
                                    </p>
                                    <p className="text-sm font-medium text-break break-words text-white">{ticker.name}</p>
                                  </div>
                                </Link>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </PageWrapper>
    </Tooltip.Provider>
  );
}
