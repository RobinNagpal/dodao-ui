import { GenerationRequestPayload } from '@/app/api/[spaceId]/tickers-v1/[ticker]/generation-requests/route';
import { AnalysisRequest, TickerAnalysisResponse, TickerV1 } from '@/types/public-equity/analysis-factors-types';
import {
  AnalysisStatus,
  analysisTypes,
  createBackgroundGenerationRequest,
  generateAllReports,
  generateSelectedReportsInBackground,
  generateSelectedReportsSynchronously,
  investorAnalysisTypes,
} from '@/utils/report-generator-utils';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export interface TickerReportV1 {
  ticker: TickerV1;
  analysisStatus: AnalysisStatus;
}

interface ReportGeneratorProps {
  selectedTickers: string[];
  tickerReports: Record<string, TickerReportV1>;
  onReportGenerated: (ticker: string) => void;
}

export default function ReportGenerator({ selectedTickers, tickerReports, onReportGenerated }: ReportGeneratorProps): JSX.Element {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [showGenerationModal, setShowGenerationModal] = useState<boolean>(false);
  const [pendingTickers, setPendingTickers] = useState<string[]>([]);

  // New state for selected report types
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [showSpecificGenerationModal, setShowSpecificGenerationModal] = useState<boolean>(false);

  // Initialize selected report types to all by default
  React.useEffect(() => {
    const allReportTypeKeys = [...analysisTypes.map((a) => a.key), ...investorAnalysisTypes.map((i) => `investor-${i.key}`)];
    setSelectedReportTypes(allReportTypeKeys);
  }, []);

  // Post hooks for analysis generation
  const { postData: postAnalysis, loading: analysisLoading } = usePostData<TickerAnalysisResponse, AnalysisRequest>({
    successMessage: 'Analysis generation started successfully!',
    errorMessage: 'Failed to generate analysis.',
  });

  // Post hook for background generation requests
  const { postData: postRequest } = usePostData<any, GenerationRequestPayload>({
    successMessage: 'Background generation request created successfully!',
    errorMessage: 'Failed to create background generation request.',
  });

  const handleGenerateAll = async (ticker: string): Promise<void> => {
    if (!ticker) return;

    // Use the utility function to generate all reports
    await generateAllReports(ticker, postAnalysis, onReportGenerated);
  };

  // Function to show the generation modal
  const handleGenerateAllForAllTickers = (): void => {
    if (selectedTickers.length === 0) return;

    // Store the selected tickers for later use
    setPendingTickers([...selectedTickers]);

    // Show the modal
    setShowGenerationModal(true);
  };

  // Function to handle synchronous report generation
  const handleSynchronousGeneration = async (): Promise<void> => {
    // Close the modal
    setShowGenerationModal(false);

    if (pendingTickers.length === 0) return;

    // Set global loading state
    setIsGeneratingAll(true);

    try {
      // Create an array of promises for each ticker
      const tickerPromises = pendingTickers.map(async (ticker) => {
        // For each ticker, we still need to process reports sequentially
        // to respect dependencies, but we can process different tickers in parallel
        await handleGenerateAll(ticker);
      });

      // Execute all ticker promises in parallel
      await Promise.all(tickerPromises);
    } finally {
      // Reset global loading state
      setIsGeneratingAll(false);
      // Clear pending tickers
      setPendingTickers([]);
    }
  };

  // Function to handle background report generation
  const handleBackgroundGeneration = async (): Promise<void> => {
    // Close the modal
    setShowGenerationModal(false);

    if (pendingTickers.length === 0) return;

    // Set global loading state
    setIsGeneratingAll(true);

    try {
      // Create background generation requests for each ticker
      const tickerPromises = pendingTickers.map(async (ticker) => {
        await createBackgroundGenerationRequest(ticker, postRequest);
      });

      // Execute all ticker promises in parallel
      await Promise.all(tickerPromises);

      // Redirect to the generation requests page
      router.push('/admin-v1/generation-requests');
    } finally {
      // Reset global loading state
      setIsGeneratingAll(false);
      // Clear pending tickers
      setPendingTickers([]);
    }
  };

  // Helper functions for report type selection
  const handleSelectAllReportTypes = (): void => {
    const allReportTypeKeys = [...analysisTypes.map((a) => a.key), ...investorAnalysisTypes.map((i) => `investor-${i.key}`)];
    setSelectedReportTypes(allReportTypeKeys);
  };

  const handleUnselectAllReportTypes = (): void => {
    setSelectedReportTypes([]);
  };

  const handleReportTypeToggle = (reportTypeKey: string): void => {
    setSelectedReportTypes((prev) => {
      if (prev.includes(reportTypeKey)) {
        return prev.filter((key) => key !== reportTypeKey);
      } else {
        return [...prev, reportTypeKey];
      }
    });
  };

  // Function to show the specific generation modal
  const handleGenerateSpecificReportTypes = (): void => {
    if (selectedTickers.length === 0 || selectedReportTypes.length === 0) return;

    // Store the selected tickers for later use
    setPendingTickers([...selectedTickers]);

    // Show the modal
    setShowSpecificGenerationModal(true);
  };

  // Function to handle synchronous specific report generation
  const handleSynchronousSpecificGeneration = async (): Promise<void> => {
    // Close the modal
    setShowSpecificGenerationModal(false);

    if (pendingTickers.length === 0 || selectedReportTypes.length === 0) return;

    // Set global loading state
    setIsGeneratingAll(true);

    try {
      await generateSelectedReportsSynchronously(pendingTickers, selectedReportTypes, postAnalysis, onReportGenerated);
    } finally {
      // Reset global loading state
      setIsGeneratingAll(false);
      // Clear pending tickers
      setPendingTickers([]);
    }
  };

  // Function to handle background specific report generation
  const handleBackgroundSpecificGeneration = async (): Promise<void> => {
    // Close the modal
    setShowSpecificGenerationModal(false);

    if (pendingTickers.length === 0 || selectedReportTypes.length === 0) return;

    // Set global loading state
    setIsGeneratingAll(true);

    try {
      await generateSelectedReportsInBackground(pendingTickers, selectedReportTypes, postRequest);

      // Redirect to the generation requests page
      router.push('/admin-v1/generation-requests');
    } finally {
      // Reset global loading state
      setIsGeneratingAll(false);
      // Clear pending tickers
      setPendingTickers([]);
    }
  };

  // Function to render the grid view of reports
  const renderReportsGrid = () => {
    if (selectedTickers.length === 0) {
      return <div className="text-center py-4">No tickers selected</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Report Type</th>
              {selectedTickers.map((ticker) => (
                <th key={ticker} className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider align-top text-center">
                  {ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {/* Regular Analysis Types */}
            {analysisTypes.map((analysis) => {
              const isSelected = selectedReportTypes.includes(analysis.key);

              return (
                <tr key={analysis.key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleReportTypeToggle(analysis.key)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span>{analysis.label}</span>
                    </div>
                  </td>
                  {selectedTickers.map((ticker) => {
                    const report = tickerReports[ticker];
                    const isCompleted = analysis.statusKey && report?.analysisStatus[analysis.statusKey];
                    const isLoading = loadingStates[`${ticker}-${analysis.key}`];

                    return (
                      <td key={`${ticker}-${analysis.key}`} className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-green-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Investor Analysis Types */}
            {investorAnalysisTypes.map((investor) => {
              const investorKey = `investor-${investor.key}`;
              const isSelected = selectedReportTypes.includes(investorKey);

              return (
                <tr key={investor.key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleReportTypeToggle(investorKey)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span>{investor.label}</span>
                    </div>
                  </td>
                  {selectedTickers.map((ticker) => {
                    const report = tickerReports[ticker];
                    const isCompleted = report?.analysisStatus.investorAnalysis[investor.key as keyof typeof report.analysisStatus.investorAnalysis];
                    const isLoading = loadingStates[`${ticker}-investor-${investor.key}`];

                    return (
                      <td key={`${ticker}-${investor.key}`} className="px-6 py-4 whitespace-nowrap text-sm">
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

  // Function to render the "Generate All" buttons
  const renderGenerateAllButtons = () => {
    const isAnyLoading = Object.values(loadingStates).some((loading) => loading);
    const isAnyProcessRunning = isGeneratingAll || isAnyLoading;

    return (
      <div className="space-y-4 my-4">
        {/* Report Type Selection Controls */}
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
            {selectedReportTypes.length} of {analysisTypes.length + investorAnalysisTypes.length} report types selected
          </div>
        </div>

        {/* Generation Buttons */}
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

  // Function to render the generation modal
  const renderGenerationModal = () => {
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
              <p className="text-center mb-6">Create generation requests to be processed in the background and redirect to the requests page.</p>
              <Button variant="contained" primary onClick={handleBackgroundGeneration} className="mt-auto w-full">
                Generate in Background
              </Button>
            </div>
          </div>
        </div>
      </FullScreenModal>
    );
  };

  // Function to render the specific generation modal
  const renderSpecificGenerationModal = () => {
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
                Create generation requests for selected report types to be processed in the background and redirect to the requests page.
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
