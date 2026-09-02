'use client';

import { TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import SectionPagination from '@/app/admin-v1/generation-requests/SectionPagination';
import AdminTickerSearchFilters from '@/app/admin-v1/ticker-search/AdminTickerSearchFilters';
import AdminTickerSearchTopFilters from '@/app/admin-v1/ticker-search/AdminTickerSearchTopFilters';
import { useAdminTickerSearch } from '@/app/admin-v1/ticker-search/useAdminTickerSearch';
import LlmProviderModelSelector, { getDefaultLlmProviderModelSelection, LlmProviderModelSelection } from '@/components/llm/LlmProviderModelSelector';
import { type ExtraFilterChip } from '@/components/stocks/filters/ClientStockFilters';
import { type StockFiltersTopSection } from '@/components/stocks/filters/StockFiltersModal';
import DateFilterControl from '@/components/ui/DateFilterControl';
import PassFailBadge from '@/components/ui/PassFailBadge';
import { useGenerateReports } from '@/hooks/useGenerateReports';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ReportType } from '@/types/ticker-typesv1';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkbox from '@dodao/web-core/components/app/Form/Checkbox';
import Checkboxes from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { getMissingReportTypes } from '@/utils/analysis-reports/report-steps-statuses';
import { TickerWithMissingReportInfoExtended } from '@/utils/missing-reports-utils';
import { validateStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';
import { AllExchanges } from '@/utils/countryExchangeUtils';
import { type SelectedFiltersMap } from '@/utils/ticker-filter-utils';
import { MISSING_REPORT_FILTER_OPTIONS, parseMissingReportTypesParam, TickerSearchParamKey } from '@/utils/ticker-search-utils';
import { TickerV1 } from '@prisma/client';
import { UpdateStockAnalyzeUrlRequest } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/route';
import { FetchFinancialDataRequest, FetchFinancialDataResponse } from '@/app/api/[spaceId]/tickers-v1/fetch-financial-data/route';

const PAGE_SIZE: number = 50;

/** Every report type checked, which is what the page showed before it had filters. */
const ALL_MISSING_REPORT_TYPES: string = MISSING_REPORT_FILTER_OPTIONS.map((option) => option.value).join(',');

const missingReportCheckboxItems = MISSING_REPORT_FILTER_OPTIONS.map((option) => ({ id: option.value, name: option.value, label: option.label }));

/** Only tickers with no open generation request: those are already being handled. */
const FIXED_SEARCH_PARAMS: Record<string, string> = { [TickerSearchParamKey.EXCLUDE_PENDING]: 'true' };

interface EditableUrlCellProps {
  ticker: TickerWithMissingReportInfoExtended;
  onUpdate: () => void;
}

function EditableUrlCell({ ticker, onUpdate }: EditableUrlCellProps): JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUrl, setEditedUrl] = useState<string>(ticker.stockAnalyzeUrl || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const { putData: updateUrl, loading: updatingUrl } = usePutData<TickerV1, UpdateStockAnalyzeUrlRequest>({
    successMessage: 'Stock Analyze URL updated successfully!',
    errorMessage: 'Failed to update Stock Analyze URL',
  });

  const handleEdit = (): void => {
    setIsEditing(true);
    setEditedUrl(ticker.stockAnalyzeUrl || '');
    setValidationError('');
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditedUrl(ticker.stockAnalyzeUrl || '');
    setValidationError('');
  };

  const handleSave = async (): Promise<void> => {
    if (isUpdating || updatingUrl) return;

    const trimmedUrl = editedUrl.trim();

    // Validate URL format if provided
    if (trimmedUrl) {
      const validationError = validateStockAnalyzeUrl(ticker.symbol, ticker.exchange as AllExchanges, trimmedUrl);
      if (validationError) {
        setValidationError(validationError);
        return;
      }
    }

    setValidationError('');
    setIsUpdating(true);
    try {
      const result = await updateUrl(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${ticker.exchange}/${ticker.symbol}`, {
        stockAnalyzeUrl: trimmedUrl,
      });

      if (result) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating URL:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editedUrl}
            onChange={(e) => {
              setEditedUrl(e.target.value);
              setValidationError(''); // Clear validation error on change
            }}
            className={`flex-1 px-2 py-1 text-sm bg-surface-2 text-body border rounded focus:outline-none focus:ring-2 ${
              validationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'
            }`}
            disabled={isUpdating || updatingUrl}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={isUpdating || updatingUrl}
            className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50 flex-shrink-0"
            title="Save"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating || updatingUrl}
            className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50 flex-shrink-0"
            title="Cancel"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        {validationError && <p className="text-sm text-red-400">❌ {validationError}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {ticker.stockAnalyzeUrl ? (
        <>
          <a
            href={ticker.stockAnalyzeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-link break-words flex-1"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            {ticker.stockAnalyzeUrl}
          </a>
          <button onClick={handleEdit} className="p-1 text-muted hover:text-muted flex-shrink-0" title="Edit URL">
            <PencilIcon className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <span className="text-red-400 flex-1">No URL</span>
          <button onClick={handleEdit} className="p-1 text-muted hover:text-muted flex-shrink-0" title="Add URL">
            <PencilIcon className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

interface MissingReportsTableProps {
  rows: TickerWithMissingReportInfoExtended[];
  selectedRows: Set<string>;
  onSelectRow: (tickerId: string, isSelected: boolean) => void;
  onUrlUpdate: () => void;
}

function MissingReportsTable({ rows, selectedRows, onSelectRow, onUrlUpdate }: MissingReportsTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Select</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider sticky left-0 bg-surface-2 z-10">Ticker</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Industry</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider" style={{ minWidth: '300px', maxWidth: '400px' }}>
              Stock Analyze URL
            </th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Financial Data</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Business & Moat</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Financial Analysis</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Past Performance</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Future Growth</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Fair Value</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Management Team</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Stability</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Final Summary</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">About Report</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Competition</th>
            <th className="px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Meta Description</th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {rows.map((ticker: TickerWithMissingReportInfoExtended) => {
            const exchange: string = ticker.exchange;
            const symbol: string = ticker.symbol;
            const isSelected = selectedRows.has(ticker.id);

            return (
              <tr key={ticker.id}>
                <td className="px-3 py-4 text-sm w-16">
                  <Checkbox id={`select-${ticker.id}`} labelContent="" isChecked={isSelected} onChange={(checked) => onSelectRow(ticker.id, checked)} />
                </td>
                <td className="px-3 py-4 text-sm font-medium sticky left-0 bg-surface z-10 link-color" style={{ minWidth: '200px', maxWidth: '300px' }}>
                  <Link href={`/stocks/${exchange}/${symbol}`} target="_blank">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{symbol}</span>
                      <span className="text-link text-xs">({exchange})</span>
                    </div>
                    <div className="text-xs text-muted truncate" title={ticker.name}>
                      {ticker.name}
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-4 text-sm" style={{ minWidth: '300px', maxWidth: '400px' }}>
                  <div className="text-xs text-muted">
                    <div className="truncate" title={ticker.industryKey?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}>
                      {ticker.industryKey?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown Industry'}
                    </div>
                    <div className="truncate" title={ticker.subIndustryKey?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}>
                      {ticker.subIndustryKey?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown Sub-Industry'}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm" style={{ minWidth: '300px', maxWidth: '400px' }}>
                  <EditableUrlCell ticker={ticker} onUpdate={onUrlUpdate} />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge passed={!ticker.isMissingFinancialData} size="xs" passLabel="Yes" failLabel="No" />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge
                    passed={ticker.businessAndMoatFactorResultsCount > 0}
                    size="xs"
                    passLabel={ticker.businessAndMoatFactorResultsCount}
                    failLabel={ticker.businessAndMoatFactorResultsCount}
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge
                    passed={ticker.financialAnalysisFactorsResultsCount > 0}
                    size="xs"
                    passLabel={ticker.financialAnalysisFactorsResultsCount}
                    failLabel={ticker.financialAnalysisFactorsResultsCount}
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge
                    passed={ticker.pastPerformanceFactorsResultsCount > 0}
                    size="xs"
                    passLabel={ticker.pastPerformanceFactorsResultsCount}
                    failLabel={ticker.pastPerformanceFactorsResultsCount}
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge
                    passed={ticker.futureGrowthFactorsResultsCount > 0}
                    size="xs"
                    passLabel={ticker.futureGrowthFactorsResultsCount}
                    failLabel={ticker.futureGrowthFactorsResultsCount}
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge
                    passed={ticker.fairValueFactorsResultsCount > 0}
                    size="xs"
                    passLabel={ticker.fairValueFactorsResultsCount}
                    failLabel={ticker.fairValueFactorsResultsCount}
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge passed={!ticker.isMissingManagementTeamReport} size="xs" passLabel="Yes" failLabel="No" />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge passed={!ticker.isMissingStabilityReport} size="xs" passLabel="Yes" failLabel="No" />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge passed={!ticker.isMissingFinalSummaryReport} size="xs" passLabel="Yes" failLabel="No" />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge passed={!ticker.isMissingAboutReport} size="xs" passLabel="Yes" failLabel="No" />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge passed={!ticker.isMissingCompetitionReport} size="xs" passLabel="Yes" failLabel="No" />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <PassFailBadge passed={!ticker.isMissingMetaDescriptionReport} size="xs" passLabel="Yes" failLabel="No" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function MissingReportsPage(): JSX.Element {
  const [localGenerating, setLocalGenerating] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showGenerateAllConfirmation, setShowGenerateAllConfirmation] = useState<boolean>(false);

  const { applied, search, hasSearched, restored, page, setPage, data, loading, reFetchData } = useAdminTickerSearch({
    pageSize: PAGE_SIZE,
    initialSelected: { [TickerSearchParamKey.MISSING_REPORT_TYPES]: ALL_MISSING_REPORT_TYPES },
    fixedParams: FIXED_SEARCH_PARAMS,
    searchOnMount: true,
    storageKey: 'admin-v1:missing-reports:filters',
  });

  const rows: TickerWithMissingReportInfoExtended[] = data?.tickers ?? [];
  const totalCount: number = data?.totalCount ?? 0;

  // Every ticker seen so far, so a row selected on an earlier page can still be
  // generated after paging away from it.
  const [seenTickers, setSeenTickers] = useState<Record<string, TickerWithMissingReportInfoExtended>>({});
  useEffect(() => {
    if (!data) return;
    setSeenTickers((prev) => {
      const next = { ...prev };
      for (const ticker of data.tickers) next[ticker.id] = ticker;
      return next;
    });
  }, [data]);

  const selectedTickerRows = (): TickerWithMissingReportInfoExtended[] => Object.values(seenTickers).filter((ticker) => selectedRows.has(ticker.id));

  function handleSearch(next: SelectedFiltersMap): void {
    search(next);
    setSelectedRows(new Set());
  }

  const topSection: StockFiltersTopSection = (draft, setValue) => (
    <AdminTickerSearchTopFilters draft={draft} setValue={setValue}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Checkboxes
          label={<span className="text-sm font-semibold">Missing any of these reports</span>}
          items={missingReportCheckboxItems}
          selectedItemIds={parseMissingReportTypesParam(draft[TickerSearchParamKey.MISSING_REPORT_TYPES])}
          onChange={(ids) => setValue(TickerSearchParamKey.MISSING_REPORT_TYPES, ids.join(','))}
        />
        <div>
          <p className="text-sm font-semibold mb-1">Stale reports</p>
          <p className="text-xs text-muted mb-3">Only tickers whose report was last updated before the date (or never generated)</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <DateFilterControl
              id={TickerSearchParamKey.BUSINESS_AND_MOAT_BEFORE}
              label="Business & Moat updated before"
              value={draft[TickerSearchParamKey.BUSINESS_AND_MOAT_BEFORE] ?? ''}
              onChange={(v) => setValue(TickerSearchParamKey.BUSINESS_AND_MOAT_BEFORE, v)}
            />
            <DateFilterControl
              id={TickerSearchParamKey.FAIR_VALUE_BEFORE}
              label="Fair Value updated before"
              value={draft[TickerSearchParamKey.FAIR_VALUE_BEFORE] ?? ''}
              onChange={(v) => setValue(TickerSearchParamKey.FAIR_VALUE_BEFORE, v)}
            />
          </div>
        </div>
      </div>
    </AdminTickerSearchTopFilters>
  );

  const extraChips: ExtraFilterChip[] = [];
  if (applied[TickerSearchParamKey.EXCHANGE])
    extraChips.push({ paramKey: TickerSearchParamKey.EXCHANGE, label: `Exchange: ${applied[TickerSearchParamKey.EXCHANGE]}` });
  const missingTypes = parseMissingReportTypesParam(applied[TickerSearchParamKey.MISSING_REPORT_TYPES]);
  if (missingTypes.length > 0) {
    const label =
      missingTypes.length === MISSING_REPORT_FILTER_OPTIONS.length
        ? 'Missing: any report'
        : `Missing: ${missingTypes.map((t) => MISSING_REPORT_FILTER_OPTIONS.find((o) => o.value === t)?.label ?? t).join(', ')}`;
    extraChips.push({ paramKey: TickerSearchParamKey.MISSING_REPORT_TYPES, label });
  }
  if (applied[TickerSearchParamKey.BUSINESS_AND_MOAT_BEFORE]) {
    extraChips.push({
      paramKey: TickerSearchParamKey.BUSINESS_AND_MOAT_BEFORE,
      label: `Business & Moat older than ${applied[TickerSearchParamKey.BUSINESS_AND_MOAT_BEFORE]}`,
    });
  }
  if (applied[TickerSearchParamKey.FAIR_VALUE_BEFORE]) {
    extraChips.push({ paramKey: TickerSearchParamKey.FAIR_VALUE_BEFORE, label: `Fair Value older than ${applied[TickerSearchParamKey.FAIR_VALUE_BEFORE]}` });
  }

  const {
    generateAllReportsInBackground,
    generateSpecificReportsInBackground,
    openGenerationRequestsPage,
    isGenerating: hookGenerating,
  } = useGenerateReports();

  // LLM provider/model to use for the background generation requests created here.
  const [llmSelection, setLlmSelection] = useState<LlmProviderModelSelection>(getDefaultLlmProviderModelSelection());

  const { postData: fetchFinancialData, loading: fetchingFinancialData } = usePostData<FetchFinancialDataResponse, FetchFinancialDataRequest>({
    successMessage: 'Financial data fetch started successfully!',
    errorMessage: 'Failed to fetch financial data',
  });

  const isGenerating: boolean = localGenerating || hookGenerating || fetchingFinancialData;

  function handleManualRefresh(): void {
    reFetchData();
  }

  function handleSelectRow(tickerId: string, isSelected: boolean): void {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(tickerId);
      } else {
        newSet.delete(tickerId);
      }
      return newSet;
    });
  }

  function handleSelectAllOnPage(): void {
    if (rows.length === 0) return;
    setSelectedRows((prev) => new Set([...prev, ...rows.map((ticker) => ticker.id)]));
  }

  function handleClearSelection(): void {
    setSelectedRows(new Set());
  }

  function handleUrlUpdate(): void {
    // Refresh the data to get updated ticker information
    reFetchData();
  }

  function handleGenerateAllForSelected(): void {
    if (selectedRows.size === 0 || isGenerating) return;
    setShowGenerateAllConfirmation(true);
  }

  async function handleGenerateAllConfirmed(): Promise<void> {
    setShowGenerateAllConfirmation(false);
    setLocalGenerating(true);
    try {
      const selectedTickers: TickerIdentifier[] = selectedTickerRows().map((ticker) => ({
        symbol: ticker.symbol,
        exchange: ticker.exchange as TickerIdentifier['exchange'],
      }));

      // Check if any selected tickers have missing financial data
      await handleFinancialDataValidationAndGenerate(selectedTickers, () => generateAllReportsInBackground(selectedTickers, llmSelection));
    } catch (err) {
      console.error('Error generating all reports for selected tickers:', err);
    } finally {
      setLocalGenerating(false);
    }
  }

  async function handleFinancialDataValidationAndGenerate(selectedTickers: TickerIdentifier[], generateFunction: () => Promise<void>): Promise<void> {
    // Get tickers with missing financial data from selected ones
    const tickersWithMissingFinancialData = selectedTickerRows()
      .filter((ticker) => ticker.isMissingFinancialData)
      .map((ticker) => ticker.id);

    // If any tickers have missing financial data, fetch it first
    if (tickersWithMissingFinancialData.length > 0) {
      try {
        console.log('Fetching financial data for tickers:', tickersWithMissingFinancialData);
        const result = await fetchFinancialData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/fetch-financial-data`, {
          tickerIds: tickersWithMissingFinancialData,
        });

        if (result) {
          // Wait a moment for data to be processed, then refresh
          await new Promise((resolve) => setTimeout(resolve, 2000));
          reFetchData();
        }
      } catch (err) {
        console.error('Error fetching financial data:', err);
        // Continue with generation even if financial data fetch fails
      }
    }

    // Now proceed with report generation, then show the queue in a new tab so
    // this screen's filters survive. The queued tickers now have a pending
    // request, which this list excludes, so reload it and clear the selection.
    await generateFunction();
    openGenerationRequestsPage();
    setSelectedRows(new Set());
    void reFetchData();
  }

  async function handleGenerateMissingForSelected(): Promise<void> {
    if (selectedRows.size === 0 || isGenerating) return;

    setLocalGenerating(true);
    try {
      const tickersWithReportTypes: { ticker: TickerIdentifier; reportTypes: ReportType[] }[] = [];

      for (const t of selectedTickerRows()) {
        const missingReportTypes: ReportType[] = getMissingReportTypes(t);
        if (missingReportTypes.length > 0) {
          tickersWithReportTypes.push({
            ticker: { symbol: t.symbol, exchange: t.exchange as TickerIdentifier['exchange'] },
            reportTypes: missingReportTypes,
          });
        }
      }

      if (tickersWithReportTypes.length > 0) {
        const selectedTickers = tickersWithReportTypes.map((item) => item.ticker);

        await handleFinancialDataValidationAndGenerate(selectedTickers, async () => {
          // Generate individual requests for each ticker with their specific missing reports
          for (const { ticker, reportTypes } of tickersWithReportTypes) {
            await generateSpecificReportsInBackground([ticker], reportTypes, llmSelection);
          }
        });
      }
    } catch (err) {
      console.error('Error generating missing reports for selected tickers:', err);
    } finally {
      setLocalGenerating(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Missing Reports & Financial Data</h2>

        <div className="flex items-center gap-3">
          <Button onClick={handleManualRefresh} variant="outlined" className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {restored && (
        <div className="mb-4">
          <AdminTickerSearchFilters
            applied={applied}
            hasSearched={hasSearched}
            onSearch={handleSearch}
            topSection={topSection}
            extraChips={extraChips}
            resultSummary={data ? `${totalCount} ticker${totalCount === 1 ? '' : 's'} found` : undefined}
          />
        </div>
      )}

      <div className="mb-6">
        <div className="bg-surface border border-red-500 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-xl font-semibold">Tickers</h3>
            <span className="text-sm text-muted">
              {totalCount} total item{totalCount === 1 ? '' : 's'}
            </span>
          </div>

          {/* Selection controls */}
          {rows.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              <Button onClick={handleSelectAllOnPage} variant="outlined" className="text-sm" disabled={isGenerating}>
                Select All on Page ({rows.length})
              </Button>
              <Button onClick={handleClearSelection} variant="outlined" className="text-sm" disabled={isGenerating || selectedRows.size === 0}>
                Clear Selection
              </Button>
              <span className="ml-auto text-sm text-muted self-center">{selectedRows.size} tickers selected</span>
            </div>
          )}

          {/* LLM provider/model selector */}
          {rows.length > 0 && (
            <div className="mb-4 max-w-2xl">
              <h4 className="text-sm font-medium text-muted mb-1">LLM Provider &amp; Model</h4>
              <LlmProviderModelSelector selection={llmSelection} onChange={setLlmSelection} />
            </div>
          )}

          {/* Generation buttons */}
          {selectedRows.size > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                onClick={handleGenerateAllForSelected}
                variant="contained"
                className="flex items-center gap-2"
                disabled={isGenerating || selectedRows.size === 0}
              >
                {isGenerating ? 'Generating...' : 'Generate All for Selected'}
              </Button>
              <Button
                onClick={handleGenerateMissingForSelected}
                variant="contained"
                className="flex items-center gap-2"
                disabled={isGenerating || selectedRows.size === 0}
              >
                {isGenerating ? 'Generating...' : 'Generate Missing for Selected'}
              </Button>
            </div>
          )}

          {loading && rows.length === 0 ? (
            <div className="py-8">Loading missing reports...</div>
          ) : rows.length === 0 ? (
            <div className="py-4">No tickers match the selected filters.</div>
          ) : (
            <>
              <MissingReportsTable rows={rows} selectedRows={selectedRows} onSelectRow={handleSelectRow} onUrlUpdate={handleUrlUpdate} />
              <SectionPagination currentPage={page} totalCount={totalCount} rowsOnPage={rows.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        title="Generate All for Selected"
        open={showGenerateAllConfirmation}
        onClose={() => setShowGenerateAllConfirmation(false)}
        onConfirm={handleGenerateAllConfirmed}
        confirming={isGenerating}
        confirmationText={`Are you sure you want to generate all reports for ${selectedRows.size} selected ticker(s)? This will regenerate all existing reports.`}
        askForTextInput={false}
      />
    </>
  );
}
