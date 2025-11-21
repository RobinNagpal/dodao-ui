'use client';

import { TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import AdminNav from '@/app/admin-v1/AdminNav';
import { useGenerateReports } from '@/hooks/useGenerateReports';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ReportType } from '@/types/ticker-typesv1';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkbox from '@dodao/web-core/components/app/Form/Checkbox';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { getMissingReportTypes } from '@/utils/analysis-reports/report-steps-statuses';
import { TickerWithMissingReportInfoExtended } from '@/utils/missing-reports-utils';
import { validateStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';
import { AllExchanges } from '@/utils/countryExchangeUtils';
import { TickerV1 } from '@prisma/client';
import { UpdateStockAnalyzeUrlRequest } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/route';
import { FetchFinancialDataRequest, FetchFinancialDataResponse } from '@/app/api/[spaceId]/tickers-v1/fetch-financial-data/route';

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
            className={`flex-1 px-2 py-1 text-sm bg-gray-700 text-gray-200 border rounded focus:outline-none focus:ring-2 ${
              validationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
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
            className="text-blue-400 hover:text-blue-300 break-words flex-1"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            {ticker.stockAnalyzeUrl}
          </a>
          <button onClick={handleEdit} className="p-1 text-gray-400 hover:text-gray-300 flex-shrink-0" title="Edit URL">
            <PencilIcon className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <span className="text-red-400 flex-1">No URL</span>
          <button onClick={handleEdit} className="p-1 text-gray-400 hover:text-gray-300 flex-shrink-0" title="Add URL">
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Select</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">Ticker</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Industry</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider" style={{ minWidth: '300px', maxWidth: '400px' }}>
              Stock Analyze URL
            </th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Financial Data</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Business & Moat</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Financial Analysis</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Past Performance</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Future Growth</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Fair Value</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Buffett</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Munger</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Ackman</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Final Summary</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">About Report</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Competition</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Future Risk</th>
            <th className="px-3 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Meta Description</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((ticker: TickerWithMissingReportInfoExtended) => {
            const exchange: string = ticker.exchange;
            const symbol: string = ticker.symbol;
            const isSelected = selectedRows.has(ticker.id);

            return (
              <tr key={ticker.id}>
                <td className="px-3 py-4 text-sm w-16">
                  <Checkbox id={`select-${ticker.id}`} labelContent="" isChecked={isSelected} onChange={(checked) => onSelectRow(ticker.id, checked)} />
                </td>
                <td className="px-3 py-4 text-sm font-medium sticky left-0 bg-gray-800 z-10 link-color" style={{ minWidth: '200px', maxWidth: '300px' }}>
                  <Link href={`/stocks/${exchange}/${symbol}`} target="_blank">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{symbol}</span>
                      <span className="text-blue-400 text-xs">({exchange})</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate" title={ticker.name}>
                      {ticker.name}
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-4 text-sm" style={{ minWidth: '300px', maxWidth: '400px' }}>
                  <div className="text-xs text-gray-400">
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${!ticker.isMissingFinancialData ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                  >
                    {!ticker.isMissingFinancialData ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.businessAndMoatFactorResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.businessAndMoatFactorResultsCount}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.financialAnalysisFactorsResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.financialAnalysisFactorsResultsCount}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.pastPerformanceFactorsResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.pastPerformanceFactorsResultsCount}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.futureGrowthFactorsResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.futureGrowthFactorsResultsCount}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.fairValueFactorsResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.fairValueFactorsResultsCount}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingWarrenBuffettReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingWarrenBuffettReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingCharlieMungerReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingCharlieMungerReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingBillAckmanReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingBillAckmanReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingFinalSummaryReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingFinalSummaryReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${!ticker.isMissingAboutReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                  >
                    {!ticker.isMissingAboutReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingCompetitionReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingCompetitionReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingFutureRiskReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingFutureRiskReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingMetaDescriptionReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingMetaDescriptionReport ? 'Yes' : 'No'}
                  </span>
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
  const router = useRouter();
  const [localGenerating, setLocalGenerating] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showGenerateAllConfirmation, setShowGenerateAllConfirmation] = useState<boolean>(false);

  const apiUrl: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/missing-reports`;

  const { data, loading, reFetchData } = useFetchData<TickerWithMissingReportInfoExtended[]>(apiUrl, {}, 'Failed to fetch missing reports');

  const { generateAllReportsInBackground, generateSpecificReportsInBackground, isGenerating: hookGenerating } = useGenerateReports();

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

  function handleSelectAll(): void {
    if (!data || data.length === 0) return;

    const allIds = data.map((ticker) => ticker.id);
    setSelectedRows(new Set(allIds));
  }

  function handleSelectFirst50(): void {
    if (!data || data.length === 0) return;

    const first50Ids = data.slice(0, 50).map((ticker) => ticker.id);
    setSelectedRows(new Set(first50Ids));
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
      const selectedTickers: TickerIdentifier[] = (data || [])
        .filter((ticker) => selectedRows.has(ticker.id))
        .map((ticker) => ({ symbol: ticker.symbol, exchange: ticker.exchange as TickerIdentifier['exchange'] }));

      // Check if any selected tickers have missing financial data
      await handleFinancialDataValidationAndGenerate(selectedTickers, () => generateAllReportsInBackground(selectedTickers));
    } catch (err) {
      console.error('Error generating all reports for selected tickers:', err);
    } finally {
      setLocalGenerating(false);
    }
  }

  async function handleFinancialDataValidationAndGenerate(selectedTickers: TickerIdentifier[], generateFunction: () => Promise<void>): Promise<void> {
    // Get tickers with missing financial data from selected ones
    const tickersWithMissingFinancialData = (data || [])
      .filter((ticker) => selectedRows.has(ticker.id) && ticker.isMissingFinancialData)
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

    // Now proceed with report generation
    await generateFunction();
    router.push('/admin-v1/generation-requests');
  }

  async function handleGenerateMissingForSelected(): Promise<void> {
    if (selectedRows.size === 0 || isGenerating) return;

    setLocalGenerating(true);
    try {
      const tickersWithReportTypes: { ticker: TickerIdentifier; reportTypes: ReportType[] }[] = [];

      for (const t of data || []) {
        if (selectedRows.has(t.id)) {
          const missingReportTypes: ReportType[] = getMissingReportTypes(t);
          if (missingReportTypes.length > 0) {
            tickersWithReportTypes.push({
              ticker: { symbol: t.symbol, exchange: t.exchange as TickerIdentifier['exchange'] },
              reportTypes: missingReportTypes,
            });
          }
        }
      }

      if (tickersWithReportTypes.length > 0) {
        const selectedTickers = tickersWithReportTypes.map((item) => item.ticker);

        await handleFinancialDataValidationAndGenerate(selectedTickers, async () => {
          // Generate individual requests for each ticker with their specific missing reports
          for (const { ticker, reportTypes } of tickersWithReportTypes) {
            await generateSpecificReportsInBackground([ticker], reportTypes);
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
    <div className="mt-12 px-4 text-color">
      <AdminNav />

      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Missing Reports & Financial Data</h2>

        <div className="flex items-center gap-3">
          <Button onClick={handleManualRefresh} variant="outlined" className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-gray-800 border border-red-500 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-xl font-semibold">Tickers with Missing Reports or Financial Data</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Showing {data?.length || 0} tickers</span>
            </div>
          </div>

          {/* Selection controls */}
          {data && data.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              <Button onClick={handleSelectAll} variant="outlined" className="text-sm" disabled={isGenerating}>
                Select All
              </Button>
              <Button onClick={handleSelectFirst50} variant="outlined" className="text-sm" disabled={isGenerating}>
                Select First 50
              </Button>
              <Button onClick={handleClearSelection} variant="outlined" className="text-sm" disabled={isGenerating || selectedRows.size === 0}>
                Clear Selection
              </Button>
              <span className="ml-auto text-sm text-gray-400 self-center">{selectedRows.size} tickers selected</span>
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

          {loading && (!data || data.length === 0) ? (
            <div className="py-8">Loading missing reports...</div>
          ) : !data || data.length === 0 ? (
            <div className="py-4">No tickers with missing reports found.</div>
          ) : (
            <MissingReportsTable rows={data} selectedRows={selectedRows} onSelectRow={handleSelectRow} onUrlUpdate={handleUrlUpdate} />
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
    </div>
  );
}
