import { TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import LlmProviderModelSelector, { getDefaultLlmProviderModelSelection, LlmProviderModelSelection } from '@/components/llm/LlmProviderModelSelector';
import { reportTypes, useGenerateReports } from '@/hooks/useGenerateReports';
import { ReportType } from '@/types/ticker-typesv1';
import { getMissingReportTypes, TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface ReportGeneratorProps {
  selectedTickers: TickerIdentifier[];
  tickerReports: Record<string, TickerWithMissingReportInfo>;
  onReportGenerated: (ticker: TickerIdentifier) => void;
}

export default function ReportGenerator({ selectedTickers, tickerReports, onReportGenerated }: ReportGeneratorProps): JSX.Element {
  const router = useRouter();
  const [loadingStates] = useState<Record<string, boolean>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);

  const [selectedReportTypes, setSelectedReportTypes] = useState<ReportType[]>([]);

  // LLM provider/model to use for this round of generation.
  const [llmSelection, setLlmSelection] = useState<LlmProviderModelSelection>(getDefaultLlmProviderModelSelection());

  React.useEffect(() => {
    const allReportTypeKeys: ReportType[] = reportTypes.map((rt) => rt.key);
    setSelectedReportTypes(allReportTypeKeys);
  }, []);

  const { generateSpecificReportsInBackground, createFullBackgroundGenerationRequests } = useGenerateReports();

  // Generation now always runs in the background: it creates generation requests
  // (with the chosen provider/model) and redirects to the requests page. There is
  // no synchronous option anymore.
  const handleGenerateAllForAllTickers = async (): Promise<void> => {
    if (selectedTickers.length === 0) return;

    setIsGeneratingAll(true);
    try {
      await createFullBackgroundGenerationRequests(selectedTickers, llmSelection);
      router.push('/admin-v1/generation-requests');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleSelectAllReportTypes = (): void => {
    const allReportTypeKeys: ReportType[] = reportTypes.map((rt) => rt.key);
    setSelectedReportTypes(allReportTypeKeys);
  };

  const handleUnselectAllReportTypes = (): void => {
    setSelectedReportTypes([]);
  };

  const handleReportTypeToggle = (reportTypeKey: ReportType): void => {
    setSelectedReportTypes((prev) => (prev.includes(reportTypeKey) ? prev.filter((k) => k !== reportTypeKey) : [...prev, reportTypeKey]));
  };

  const handleGenerateSpecificReportTypes = async (): Promise<void> => {
    if (selectedTickers.length === 0 || selectedReportTypes.length === 0) return;

    setIsGeneratingAll(true);
    try {
      await generateSpecificReportsInBackground(selectedTickers, selectedReportTypes, llmSelection);
      router.push('/admin-v1/generation-requests');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const renderReportsGrid = (): JSX.Element => {
    if (selectedTickers.length === 0) {
      return <div className="text-center py-4">No tickers selected</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Report Type</th>
              {selectedTickers.map((ticker, index) => {
                return (
                  <th
                    key={`${ticker.exchange}-${ticker.symbol}-${index}`}
                    className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider align-top text-center"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{ticker.symbol}</span>
                      <span className="text-xs text-gray-400">({ticker.exchange})</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {reportTypes.map((reportTypeInfo) => {
              const reportType = reportTypeInfo.key;
              const isSelected: boolean = selectedReportTypes.includes(reportType);
              return (
                <tr key={reportType}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleReportTypeToggle(reportType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span>{reportTypeInfo.label}</span>
                    </div>
                  </td>
                  {selectedTickers.map((ticker, tickerIndex) => {
                    const tickerKey = `${ticker.exchange}-${ticker.symbol}`;
                    const report = tickerReports[tickerKey];
                    const isCompleted: boolean = report ? !getMissingReportTypes(report).includes(reportType) : false;

                    const isLoading: boolean = loadingStates[`${tickerKey}-${reportType}`];

                    return (
                      <td key={`${tickerKey}-${reportType}-${tickerIndex}`} className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-green-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGenerateAllButtons = (): JSX.Element => {
    const isAnyProcessRunning: boolean = isGeneratingAll;

    return (
      <div className="space-y-4 my-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Select LLM Provider &amp; Model</h3>
          <LlmProviderModelSelector selection={llmSelection} onChange={setLlmSelection} />
          <div className="text-sm text-gray-400 mt-2">All selected reports will be generated with this provider and model.</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Select Report Types</h3>
            <div className="flex gap-2">
              <Button variant="outlined" size="sm" onClick={handleSelectAllReportTypes} disabled={isAnyProcessRunning}>
                Select All
              </Button>
              <Button variant="outlined" size="sm" onClick={handleUnselectAllReportTypes} disabled={isAnyProcessRunning}>
                Unselect All
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-300">
            {selectedReportTypes.length} of {reportTypes.length} report types selected
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="contained"
            primary
            onClick={handleGenerateAllForAllTickers}
            disabled={isAnyProcessRunning || selectedTickers.length === 0}
            loading={isGeneratingAll}
            className="px-8 py-3 text-lg font-semibold"
          >
            {isGeneratingAll ? 'Creating Requests...' : 'Generate All Reports for All Tickers'}
          </Button>

          <Button
            variant="contained"
            onClick={handleGenerateSpecificReportTypes}
            disabled={isAnyProcessRunning || selectedTickers.length === 0 || selectedReportTypes.length === 0}
            loading={isGeneratingAll}
            className="px-8 py-3 text-lg font-semibold"
          >
            {isGeneratingAll ? 'Creating Requests...' : 'Generate for Specific Report Type'}
          </Button>
        </div>
        <div className="text-sm text-gray-400 text-center">
          Reports are generated in the background. You will be redirected to the generation requests page.
        </div>
      </div>
    );
  };

  return (
    <Block title="Reports Generation" className="text-color">
      {selectedTickers.length > 0 ? (
        <>
          {renderGenerateAllButtons()}
          {renderReportsGrid()}
        </>
      ) : (
        <div className="text-center py-8">Select one or more tickers to generate reports</div>
      )}
    </Block>
  );
}
