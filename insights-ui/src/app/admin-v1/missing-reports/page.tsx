'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { MissingReportsForTicker } from '@/app/api/[spaceId]/tickers-v1/missing-reports/route';
import { useGenerateReports } from '@/hooks/useGenerateReports';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ReportType } from '@/types/ticker-typesv1';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkbox from '@dodao/web-core/components/app/Form/Checkbox';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface MissingReportsTableProps {
  rows: MissingReportsForTicker[];
  selectedRows: Set<string>;
  onSelectRow: (tickerId: string, isSelected: boolean) => void;
}

function MissingReportsTable({ rows, selectedRows, onSelectRow }: MissingReportsTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Select</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">Ticker</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Industry</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Business & Moat</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Financial Analysis</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Past Performance</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Future Growth</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Fair Value</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Buffett</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Munger</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Ackman</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Final Summary</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Cached Score</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">About Report</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Competition</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Meta Description</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((ticker: MissingReportsForTicker) => {
            const exchange: string = ticker.exchange;
            const symbol: string = ticker.symbol;
            const isSelected = selectedRows.has(ticker.id);

            return (
              <tr key={ticker.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Checkbox id={`select-${ticker.id}`} labelContent="" isChecked={isSelected} onChange={(checked) => onSelectRow(ticker.id, checked)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-gray-800 z-10 link-color">
                  <Link href={`/stocks/${exchange}/${symbol}`} target="_blank">
                    {symbol}
                    <div className="text-xs text-gray-400">{ticker.name}</div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="text-xs text-gray-400">
                    {ticker.industry?.name || ticker.industryKey || 'Unknown Industry'}
                    <br />
                    {ticker.subIndustry?.name || ticker.subIndustryKey || 'Unknown Sub-Industry'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.businessAndMoatFactorResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.businessAndMoatFactorResultsCount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.financialAnalysisFactorsResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.financialAnalysisFactorsResultsCount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.pastPerformanceFactorsResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.pastPerformanceFactorsResultsCount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.futureGrowthFactorsResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.futureGrowthFactorsResultsCount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticker.fairValueFactorsResultsCount > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {ticker.fairValueFactorsResultsCount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingWarrenBuffettReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingWarrenBuffettReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingCharlieMungerReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingCharlieMungerReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingBillAckmanReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingBillAckmanReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingFinalSummaryReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingFinalSummaryReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingCachedScoreRepot ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingCachedScoreRepot ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${!ticker.isMissingAboutReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                  >
                    {!ticker.isMissingAboutReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      !ticker.isMissingCompetitionReport ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {!ticker.isMissingCompetitionReport ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
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
  const [pagination, setPagination] = useState<{ skip: number; take: number }>({ skip: 0, take: 50 });
  const [accumulatedData, setAccumulatedData] = useState<MissingReportsForTicker[]>([]);
  const [localGenerating, setLocalGenerating] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const baseUrl: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/missing-reports`;
  const params = new URLSearchParams();
  params.append('skip', pagination.skip.toString());
  params.append('take', pagination.take.toString());
  const apiUrl: string = `${baseUrl}?${params.toString()}`;

  const { data, loading, reFetchData } = useFetchData<MissingReportsForTicker[]>(apiUrl, {}, 'Failed to fetch missing reports');

  const { generateMissingReports, generateAllReportsInBackground, generateSpecificReportsInBackground, isGenerating: hookGenerating } = useGenerateReports();

  const isGenerating: boolean = localGenerating || hookGenerating;

  React.useEffect(() => {
    if (data) {
      if (pagination.skip === 0) {
        setAccumulatedData(data);
      } else {
        setAccumulatedData((prev) => [...prev, ...data]);
      }
    }
  }, [data, pagination.skip]);

  function handleManualRefresh(): void {
    setPagination({ skip: 0, take: 50 });
    setAccumulatedData([]);
    reFetchData();
  }

  function handleLoadMore(): void {
    setPagination((prev) => ({ skip: prev.skip + prev.take, take: prev.take }));
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
    if (accumulatedData.length === 0) return;

    const allIds = accumulatedData.map((ticker) => ticker.id);
    setSelectedRows(new Set(allIds));
  }

  function handleSelectFirst50(): void {
    if (accumulatedData.length === 0) return;

    const first50Ids = accumulatedData.slice(0, 50).map((ticker) => ticker.id);
    setSelectedRows(new Set(first50Ids));
  }

  function handleClearSelection(): void {
    setSelectedRows(new Set());
  }

  function getMissingReportTypes(ticker: MissingReportsForTicker): ReportType[] {
    const missingReports: ReportType[] = [];

    if (ticker.businessAndMoatFactorResultsCount === 0) missingReports.push(ReportType.BUSINESS_AND_MOAT);
    if (ticker.financialAnalysisFactorsResultsCount === 0) missingReports.push(ReportType.FINANCIAL_ANALYSIS);
    if (ticker.pastPerformanceFactorsResultsCount === 0) missingReports.push(ReportType.PAST_PERFORMANCE);
    if (ticker.futureGrowthFactorsResultsCount === 0) missingReports.push(ReportType.FUTURE_GROWTH);
    if (ticker.fairValueFactorsResultsCount === 0) missingReports.push(ReportType.FAIR_VALUE);
    if (ticker.isMissingWarrenBuffettReport) missingReports.push(ReportType.WARREN_BUFFETT);
    if (ticker.isMissingCharlieMungerReport) missingReports.push(ReportType.CHARLIE_MUNGER);
    if (ticker.isMissingBillAckmanReport) missingReports.push(ReportType.BILL_ACKMAN);
    if (ticker.isMissingFinalSummaryReport) missingReports.push(ReportType.FINAL_SUMMARY);
    if (ticker.isMissingCachedScoreRepot) missingReports.push(ReportType.CACHED_SCORE);
    if (ticker.isMissingCompetitionReport) missingReports.push(ReportType.COMPETITION);

    // If AboutReport is missing, add FINAL_SUMMARY to regenerate it
    // (only if it's not already in the list)
    if (ticker.isMissingAboutReport && !missingReports.includes(ReportType.FINAL_SUMMARY)) {
      missingReports.push(ReportType.FINAL_SUMMARY);
    }

    // If MetaDescription is missing, add FINAL_SUMMARY to regenerate it
    // (only if it's not already in the list)
    if (ticker.isMissingMetaDescriptionReport && !missingReports.includes(ReportType.FINAL_SUMMARY)) {
      missingReports.push(ReportType.FINAL_SUMMARY);
    }

    return missingReports;
  }

  async function handleGenerateAllForSelected(): Promise<void> {
    if (selectedRows.size === 0 || isGenerating) return;

    setLocalGenerating(true);
    try {
      const selectedTickers = accumulatedData.filter((ticker) => selectedRows.has(ticker.id)).map((ticker) => ticker.symbol);

      await generateAllReportsInBackground(selectedTickers);
      router.push('/admin-v1/generation-requests');
    } catch (err) {
      console.error('Error generating all reports for selected tickers:', err);
    } finally {
      setLocalGenerating(false);
    }
  }

  async function handleGenerateMissingForSelected(): Promise<void> {
    if (selectedRows.size === 0 || isGenerating) return;

    setLocalGenerating(true);
    try {
      const tickersWithReportTypes: { ticker: string; reportTypes: ReportType[] }[] = [];

      for (const t of accumulatedData) {
        if (selectedRows.has(t.id)) {
          const missingReportTypes: ReportType[] = getMissingReportTypes(t);
          if (missingReportTypes.length > 0) {
            tickersWithReportTypes.push({ ticker: t.symbol, reportTypes: missingReportTypes });
          }
        }
      }

      if (tickersWithReportTypes.length > 0) {
        // Use the new approach without the "many missing reports" logic
        const allTickers: string[] = tickersWithReportTypes.map((t) => t.ticker);
        const allReportTypes: ReportType[] = Array.from(new Set(tickersWithReportTypes.flatMap((t) => t.reportTypes)));

        await generateSpecificReportsInBackground(allTickers, allReportTypes);
        router.push('/admin-v1/generation-requests');
      }
    } catch (err) {
      console.error('Error generating missing reports for selected tickers:', err);
    } finally {
      setLocalGenerating(false);
    }
  }

  const hasMore: boolean = !!data && data.length === pagination.take;

  return (
    <div className="mt-12 px-4 text-color">
      <AdminNav />

      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Missing Reports</h2>

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
            <h3 className="text-xl font-semibold">Tickers with Missing Reports</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Showing {accumulatedData.length} tickers</span>
              {hasMore && (
                <Button onClick={handleLoadMore} variant="text" className="text-blue-400 hover:text-blue-300">
                  Show More
                </Button>
              )}
            </div>
          </div>

          {/* Selection controls */}
          {accumulatedData.length > 0 && (
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

          {loading && accumulatedData.length === 0 ? (
            <div className="py-8">Loading missing reports...</div>
          ) : accumulatedData.length === 0 ? (
            <div className="py-4">No tickers with missing reports found.</div>
          ) : (
            <MissingReportsTable rows={accumulatedData} selectedRows={selectedRows} onSelectRow={handleSelectRow} />
          )}
        </div>
      </div>
    </div>
  );
}
