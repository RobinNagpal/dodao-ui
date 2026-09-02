'use client';

import { TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import SectionPagination from '@/app/admin-v1/generation-requests/SectionPagination';
import AdminTickerSearchFilters from '@/app/admin-v1/ticker-search/AdminTickerSearchFilters';
import AdminTickerSearchTopFilters from '@/app/admin-v1/ticker-search/AdminTickerSearchTopFilters';
import { useAdminTickerSearch } from '@/app/admin-v1/ticker-search/useAdminTickerSearch';
import { type ExtraFilterChip } from '@/components/stocks/filters/ClientStockFilters';
import { type StockFiltersTopSection } from '@/components/stocks/filters/StockFiltersModal';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { IndustryWithSubIndustriesAndCounts } from '@/types/ticker-typesv1';
import { getMissingReportCount, TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';
import { type SelectedFiltersMap } from '@/utils/ticker-filter-utils';
import { TickerSearchParamKey } from '@/utils/ticker-search-utils';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useEffect, useState } from 'react';

const PAGE_SIZE: number = 50;

interface TickerSelectionPageProps {
  /** The component to render when tickers are selected */
  renderActionComponent: (props: {
    selectedTickers: TickerIdentifier[];
    tickerData: Record<string, TickerWithMissingReportInfo>;
    onDataUpdated: (ticker: TickerIdentifier) => void;
  }) => React.ReactNode;

  /**
   * Button text for refreshing data
   */
  refreshButtonText: string;
}

/** Anything a ticker can be identified by: a search row, or an already-selected identifier. */
type TickerRef = { symbol: string; exchange: string };

/** The key `ReportGenerator` looks tickers up by. */
const tickerKey = (ticker: TickerRef): string => `${ticker.exchange}-${ticker.symbol}`;

const sameTicker = (a: TickerRef, b: TickerRef): boolean => a.symbol === b.symbol && a.exchange === b.exchange;

const toIdentifier = ({ symbol, exchange }: TickerRef): TickerIdentifier => ({ symbol, exchange: exchange as TickerIdentifier['exchange'] });

export default function TickerSelectionPage({ renderActionComponent, refreshButtonText }: TickerSelectionPageProps): JSX.Element {
  const { data: industries } = useFetchData<IndustryWithSubIndustriesAndCounts[]>(
    `${getBaseUrl()}/api/industries`,
    { cache: 'no-cache' },
    'Failed to fetch industries'
  );

  const { applied, search, hasSearched, page, setPage, data, loading, reFetchData } = useAdminTickerSearch({ pageSize: PAGE_SIZE });

  const [selectedTickers, setSelectedTickers] = useState<TickerIdentifier[]>([]);

  // Report status of every ticker seen so far, so a ticker selected on an
  // earlier page still has its data when the action component renders.
  const [tickerData, setTickerData] = useState<Record<string, TickerWithMissingReportInfo>>({});
  useEffect(() => {
    if (!data) return;
    setTickerData((prev) => {
      const next = { ...prev };
      for (const ticker of data.tickers) next[tickerKey(ticker)] = ticker;
      return next;
    });
  }, [data]);

  const handleSearch = (next: SelectedFiltersMap): void => {
    // A sub-industry only means something inside its industry.
    const { [TickerSearchParamKey.SUB_INDUSTRY_KEY]: subIndustryKey, ...rest } = next;
    search(next[TickerSearchParamKey.INDUSTRY_KEY] && subIndustryKey ? next : rest);
    setSelectedTickers([]);
  };

  const industryName = (industryKey: string): string => industries?.find((i) => i.industryKey === industryKey)?.name ?? industryKey;
  const subIndustryName = (subIndustryKey: string): string =>
    industries?.flatMap((i) => i.subIndustries).find((s) => s.subIndustryKey === subIndustryKey)?.name ?? subIndustryKey;

  const extraChips: ExtraFilterChip[] = [];
  if (applied[TickerSearchParamKey.EXCHANGE])
    extraChips.push({ paramKey: TickerSearchParamKey.EXCHANGE, label: `Exchange: ${applied[TickerSearchParamKey.EXCHANGE]}` });
  if (applied[TickerSearchParamKey.INDUSTRY_KEY]) {
    extraChips.push({ paramKey: TickerSearchParamKey.INDUSTRY_KEY, label: `Industry: ${industryName(applied[TickerSearchParamKey.INDUSTRY_KEY])}` });
  }
  if (applied[TickerSearchParamKey.SUB_INDUSTRY_KEY]) {
    extraChips.push({
      paramKey: TickerSearchParamKey.SUB_INDUSTRY_KEY,
      label: `Sub-Industry: ${subIndustryName(applied[TickerSearchParamKey.SUB_INDUSTRY_KEY])}`,
    });
  }

  const topSection: StockFiltersTopSection = (draft, setValue) => (
    <AdminTickerSearchTopFilters draft={draft} setValue={setValue} industries={industries ?? []} />
  );

  const rows: TickerWithMissingReportInfo[] = data?.tickers ?? [];
  const totalCount: number = data?.totalCount ?? 0;

  const isSelected = (ticker: TickerRef): boolean => selectedTickers.some((s) => sameTicker(s, ticker));
  const allOnPageSelected: boolean = rows.length > 0 && rows.every(isSelected);

  const toggleSelectAllOnPage = (): void => {
    setSelectedTickers((prev) => {
      const withoutPage = prev.filter((s) => !rows.some((row) => sameTicker(s, row)));
      return allOnPageSelected ? withoutPage : [...withoutPage, ...rows.map(toIdentifier)];
    });
  };

  const handleRowSelectionChange = (checkedKeys: string[]): void => {
    const checked = new Set(checkedKeys);
    setSelectedTickers((prev) => {
      const fromOtherPages = prev.filter((s) => !rows.some((row) => sameTicker(s, row)));
      const fromThisPage = rows.filter((row) => checked.has(tickerKey(row))).map(toIdentifier);
      return [...fromOtherPages, ...fromThisPage];
    });
  };

  return (
    <div className="space-y-3">
      <AdminTickerSearchFilters
        applied={applied}
        hasSearched={hasSearched}
        onSearch={handleSearch}
        topSection={topSection}
        extraChips={extraChips}
        resultSummary={data ? `${totalCount} ticker${totalCount === 1 ? '' : 's'} found` : undefined}
      />

      {hasSearched && (
        <div className="space-y-2">
          {loading && rows.length === 0 ? (
            <div className="py-6 text-muted">Searching tickers…</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-3 text-muted">No tickers match the selected filters.</div>
          ) : (
            <div className="bg-surface rounded-lg p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <Checkboxes
                  items={[
                    {
                      id: 'select-all',
                      name: 'select-all',
                      label: <span className="flex-grow cursor-pointer">Select all on this page ({rows.length})</span>,
                    },
                  ]}
                  selectedItemIds={allOnPageSelected ? ['select-all'] : []}
                  onChange={toggleSelectAllOnPage}
                />
                <span className="text-sm text-muted">{selectedTickers.length} selected</span>
              </div>
              <Checkboxes
                items={rows.map((t): CheckboxItem => {
                  const { missingReportCount, totalReportCount } = getMissingReportCount(t);
                  return {
                    id: tickerKey(t),
                    name: `ticker-${tickerKey(t)}`,
                    label: (
                      <div className="flex-grow cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t.symbol}</span>
                            <span className="text-link text-sm">({t.exchange})</span>
                            <span className="text-muted">-</span>
                            <span className="text-muted">{t.name}</span>
                            {t.cachedScoreEntry?.finalScore && <span className="text-link text-sm">Score: {t.cachedScoreEntry.finalScore}/25</span>}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted">
                            <span>
                              Updated:{' '}
                              {new Date(t.updatedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'UTC',
                              })}
                            </span>
                            {missingReportCount === totalReportCount && <span className="text-red-400 text-xs">MISSING</span>}
                            {missingReportCount > 0 && missingReportCount < totalReportCount && <span className="text-yellow-400 text-xs">PARTIAL</span>}
                            {missingReportCount == 0 && <span className="text-green-400 text-xs">COMPLETE</span>}
                          </div>
                        </div>
                      </div>
                    ),
                  };
                })}
                selectedItemIds={rows.filter(isSelected).map(tickerKey)}
                onChange={handleRowSelectionChange}
              />
              <SectionPagination currentPage={page} totalCount={totalCount} rowsOnPage={rows.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          )}

          {selectedTickers.length > 0 && (
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setSelectedTickers([])}>
                Clear Selection
              </Button>
              <Button variant="contained" primary onClick={() => void reFetchData()}>
                {refreshButtonText}
              </Button>
            </div>
          )}
        </div>
      )}

      {selectedTickers.length > 0 &&
        renderActionComponent({
          selectedTickers,
          tickerData,
          onDataUpdated: () => {
            void reFetchData();
          },
        })}
    </div>
  );
}
