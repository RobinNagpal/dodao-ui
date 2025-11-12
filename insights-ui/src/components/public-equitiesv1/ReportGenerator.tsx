import { reportTypes, useGenerateReports } from '@/hooks/useGenerateReports';
import { ReportType } from '@/types/ticker-typesv1';
import { getMissingReportTypes, TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface ReportGeneratorProps {
  selectedTickers: string[];
  tickerReports: Record<string, TickerWithMissingReportInfo>;
  onReportGenerated: (ticker: string) => void;
}

export default function ReportGenerator({ selectedTickers, tickerReports, onReportGenerated }: ReportGeneratorProps): JSX.Element {
  const router = useRouter();
  const [loadingStates] = useState<Record<string, boolean>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [showGenerationModal, setShowGenerationModal] = useState<boolean>(false);
  const [pendingTickers, setPendingTickers] = useState<string[]>([]);

  const [selectedReportTypes, setSelectedReportTypes] = useState<ReportType[]>([]);
  const [showSpecificGenerationModal, setShowSpecificGenerationModal] = useState<boolean>(false);

  React.useEffect(() => {
    const allReportTypeKeys: ReportType[] = Object.values(ReportType);
    setSelectedReportTypes(allReportTypeKeys);
  }, []);

  const { generateAllReportsForTicker, generateReportsSynchronously, generateSpecificReportsInBackground, createFullBackgroundGenerationRequests } =
    useGenerateReports();

  const handleGenerateAll = async (ticker: string): Promise<void> => {
    if (!ticker) return;
    await generateAllReportsForTicker(ticker, onReportGenerated);
  };

  const handleGenerateAllForAllTickers = (): void => {
    if (selectedTickers.length === 0) return;
    setPendingTickers([...selectedTickers]);
    setShowGenerationModal(true);
  };

  const handleSynchronousGeneration = async (): Promise<void> => {
    setShowGenerationModal(false);
    if (pendingTickers.length === 0) return;

    setIsGeneratingAll(true);
    try {
      await Promise.all(pendingTickers.map((t) => handleGenerateAll(t)));
    } finally {
      setIsGeneratingAll(false);
      setPendingTickers([]);
    }
  };

  /** Background path now uses a single BATCH request for all tickers */
  const handleBackgroundGeneration = async (): Promise<void> => {
    setShowGenerationModal(false);
    if (pendingTickers.length === 0) return;

    setIsGeneratingAll(true);
    try {
      await createFullBackgroundGenerationRequests(pendingTickers);
      router.push('/admin-v1/generation-requests');
    } finally {
      setIsGeneratingAll(false);
      setPendingTickers([]);
    }
  };

  const handleSelectAllReportTypes = (): void => {
    const allReportTypeKeys: ReportType[] = Object.values(ReportType);
    setSelectedReportTypes(allReportTypeKeys);
  };

  const handleUnselectAllReportTypes = (): void => {
    setSelectedReportTypes([]);
  };

  const handleReportTypeToggle = (reportTypeKey: ReportType): void => {
    setSelectedReportTypes((prev) => (prev.includes(reportTypeKey) ? prev.filter((k) => k !== reportTypeKey) : [...prev, reportTypeKey]));
  };

  const handleGenerateSpecificReportTypes = (): void => {
    if (selectedTickers.length === 0 || selectedReportTypes.length === 0) return;
    setPendingTickers([...selectedTickers]);
    setShowSpecificGenerationModal(true);
  };

  const handleSynchronousSpecificGeneration = async (): Promise<void> => {
    setShowSpecificGenerationModal(false);
    if (pendingTickers.length === 0 || selectedReportTypes.length === 0) return;

    setIsGeneratingAll(true);
    try {
      await generateReportsSynchronously(pendingTickers, selectedReportTypes, onReportGenerated);
    } finally {
      setIsGeneratingAll(false);
      setPendingTickers([]);
    }
  };

  const handleBackgroundSpecificGeneration = async (): Promise<void> => {
    setShowSpecificGenerationModal(false);
    if (pendingTickers.length === 0 || selectedReportTypes.length === 0) return;

    setIsGeneratingAll(true);
    try {
      await generateSpecificReportsInBackground(pendingTickers, selectedReportTypes);
      router.push('/admin-v1/generation-requests');
    } finally {
      setIsGeneratingAll(false);
      setPendingTickers([]);
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
              {selectedTickers.map((ticker) => {
                const [symbol, exchange] = ticker.split('-');
                return (
                  <th key={ticker} className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider align-top text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{symbol}</span>
                      <span className="text-xs text-gray-400">({exchange})</span>
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
                  {selectedTickers.map((ticker) => {
                    const report = tickerReports[ticker];
                    const isCompleted: boolean = !getMissingReportTypes(report).includes(reportType);

                    const isLoading: boolean = loadingStates[`${ticker}-${reportType}`];

                    return (
                      <td key={`${ticker}-${reportType}`} className="px-6 py-4 whitespace-nowrap text-sm">
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
            {isGeneratingAll ? 'Generating All Reports...' : 'Generate All Reports for All Tickers'}
          </Button>

          <Button
            variant="contained"
            onClick={handleGenerateSpecificReportTypes}
            disabled={isAnyProcessRunning || selectedTickers.length === 0 || selectedReportTypes.length === 0}
            loading={isGeneratingAll}
            className="px-8 py-3 text-lg font-semibold"
          >
            {isGeneratingAll ? 'Generating Selected Reports...' : 'Generate for Specific Report Type'}
          </Button>
        </div>
      </div>
    );
  };

  const renderGenerationModal = (): JSX.Element => {
    return (
      <FullScreenModal open={showGenerationModal} onClose={() => setShowGenerationModal(false)} title="Select Report Generation Mode">
        <div className="p-6 flex flex-col items-center space-y-8">
          <div className="text-lg text-center mb-4">How would you like to generate reports for the selected tickers?</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Synchronous Generation</h3>
              <p className="text-center mb-6">Generate reports immediately and stay on this page. This may take some time to complete.</p>
              <Button variant="contained" primary onClick={handleSynchronousGeneration} className="mt-auto w-full">
                Generate Synchronously
              </Button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Background Generation</h3>
              <p className="text-center mb-6">Create batch generation requests to be processed in the background and redirect to the requests page.</p>
              <Button variant="contained" primary onClick={handleBackgroundGeneration} className="mt-auto w-full">
                Generate in Background
              </Button>
            </div>
          </div>
        </div>
      </FullScreenModal>
    );
  };

  const renderSpecificGenerationModal = (): JSX.Element => {
    return (
      <FullScreenModal
        open={showSpecificGenerationModal}
        onClose={() => setShowSpecificGenerationModal(false)}
        title="Select Report Generation Mode for Selected Types"
      >
        <div className="p-6 flex flex-col items-center space-y-8">
          <div className="text-lg text-center mb-4">How would you like to generate the selected report types for the selected tickers?</div>

          <div className="text-center mb-4">
            <p className="text-gray-300">Selected Report Types: {selectedReportTypes.length}</p>
            <p className="text-gray-300">Selected Tickers: {pendingTickers.length}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Synchronous Generation</h3>
              <p className="text-center mb-6">Generate selected report types immediately and stay on this page. This may take some time to complete.</p>
              <Button variant="contained" primary onClick={handleSynchronousSpecificGeneration} className="mt-auto w-full">
                Generate Synchronously
              </Button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Background Generation</h3>
              <p className="text-center mb-6">
                Create batch generation requests for selected report types to be processed in the background and redirect to the requests page.
              </p>
              <Button variant="contained" primary onClick={handleBackgroundSpecificGeneration} className="mt-auto w-full">
                Generate in Background
              </Button>
            </div>
          </div>
        </div>
      </FullScreenModal>
    );
  };

  return (
    <Block title="Reports Generation" className="text-color">
      {selectedTickers.length > 0 ? (
        <>
          {renderGenerateAllButtons()}
          {renderReportsGrid()}
          {renderGenerationModal()}
          {renderSpecificGenerationModal()}
        </>
      ) : (
        <div className="text-center py-8">Select one or more tickers to generate reports</div>
      )}
    </Block>
  );
}
