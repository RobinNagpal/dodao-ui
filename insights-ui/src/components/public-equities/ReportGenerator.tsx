import React, { useState } from 'react';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AnalysisRequest, TickerAnalysisResponse, TickerV1 } from '@/types/public-equity/analysis-factors-types';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface AnalysisStatus {
  businessAndMoat: boolean;
  financialAnalysis: boolean;
  pastPerformance: boolean;
  futureGrowth: boolean;
  fairValue: boolean;
  competition: boolean;
  investorAnalysis: {
    WARREN_BUFFETT: boolean;
    CHARLIE_MUNGER: boolean;
    BILL_ACKMAN: boolean;
  };
  futureRisk: boolean;
  finalSummary: boolean;
}

interface TickerReportV1 {
  ticker: TickerV1;
  analysisStatus: AnalysisStatus;
}

interface ReportGeneratorProps {
  selectedTickers: string[];
  tickerReports: Record<string, TickerReportV1>;
  onReportGenerated: (ticker: string) => void;
}

export default function ReportGenerator({ selectedTickers, tickerReports, onReportGenerated }: ReportGeneratorProps): JSX.Element {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);

  // Post hooks for analysis generation
  const { postData: postAnalysis, loading: analysisLoading } = usePostData<TickerAnalysisResponse, AnalysisRequest>({
    successMessage: 'Analysis generation started successfully!',
    errorMessage: 'Failed to generate analysis.',
  });

  const analysisTypes = [
    { key: 'business-and-moat', label: 'Business & Moat', statusKey: 'businessAndMoat' as keyof AnalysisStatus },
    { key: 'financial-analysis', label: 'Financial Analysis', statusKey: 'financialAnalysis' as keyof AnalysisStatus },
    { key: 'competition', label: 'Competition', statusKey: 'competition' as keyof AnalysisStatus },
    { key: 'past-performance', label: 'Past Performance', statusKey: 'pastPerformance' as keyof AnalysisStatus },
    { key: 'future-growth', label: 'Future Growth', statusKey: 'futureGrowth' as keyof AnalysisStatus },
    { key: 'fair-value', label: 'Fair Value', statusKey: 'fairValue' as keyof AnalysisStatus },
    { key: 'future-risk', label: 'Future Risk', statusKey: 'futureRisk' as keyof AnalysisStatus },
    { key: 'final-summary', label: 'Final Summary', statusKey: 'finalSummary' as keyof AnalysisStatus },
  ];

  const investorAnalysisTypes = [
    { key: 'WARREN_BUFFETT', label: 'Warren Buffett Analysis' },
    { key: 'CHARLIE_MUNGER', label: 'Charlie Munger Analysis' },
    { key: 'BILL_ACKMAN', label: 'Bill Ackman Analysis' },
  ];

  const handleGenerateAnalysis = async (analysisType: string, ticker: string) => {
    if (!ticker) return;

    setLoadingStates((prev) => ({ ...prev, [`${ticker}-${analysisType}`]: true }));

    try {
      const payload: AnalysisRequest = {};

      const result = await postAnalysis(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/${analysisType}`, payload);

      if (result) {
        // Notify parent component to refresh the ticker report
        onReportGenerated(ticker);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`${ticker}-${analysisType}`]: false }));
    }
  };

  const handleGenerateInvestorAnalysis = async (investorKey: string, ticker: string) => {
    if (!ticker) return;

    setLoadingStates((prev) => ({ ...prev, [`${ticker}-investor-${investorKey}`]: true }));

    try {
      const payload: AnalysisRequest = {
        investorKey: investorKey,
      };

      const result = await postAnalysis(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/investor-analysis`, payload);

      if (result) {
        // Notify parent component to refresh the ticker report
        onReportGenerated(ticker);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`${ticker}-investor-${investorKey}`]: false }));
    }
  };

  const handleGenerateAll = async (ticker: string): Promise<void> => {
    if (!ticker) return;

    // Generate in sequence to respect dependencies (competition first, then past-performance and future-growth)
    const sequence = [
      'business-and-moat',
      'financial-analysis',
      'fair-value',
      'future-risk',
      'competition', // Must come before past-performance and future-growth
      'past-performance',
      'future-growth',
    ];

    for (const analysisType of sequence) {
      await handleGenerateAnalysis(analysisType, ticker);
      // Add a small delay between calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Generate investor analysis for all investors
    const allInvestors = ['WARREN_BUFFETT', 'CHARLIE_MUNGER', 'BILL_ACKMAN'];
    for (const investorKey of allInvestors) {
      await handleGenerateInvestorAnalysis(investorKey, ticker);
      // Add a small delay between calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  // Function to generate all reports for all tickers in parallel
  const handleGenerateAllForAllTickers = async (): Promise<void> => {
    if (selectedTickers.length === 0) return;

    // Set global loading state
    setIsGeneratingAll(true);

    try {
      // Create an array of promises for each ticker
      const tickerPromises = selectedTickers.map(async (ticker) => {
        // For each ticker, we still need to process reports sequentially
        // to respect dependencies, but we can process different tickers in parallel
        await handleGenerateAll(ticker);
      });

      // Execute all ticker promises in parallel
      await Promise.all(tickerPromises);
    } finally {
      // Reset global loading state
      setIsGeneratingAll(false);
    }
  };

  // Function to generate a specific analysis type for all selected tickers in parallel
  const handleGenerateAnalysisForAllTickers = async (analysisType: string): Promise<void> => {
    if (selectedTickers.length === 0) return;

    // Mark all cells for this analysis type as loading
    const newLoadingStates = { ...loadingStates };
    selectedTickers.forEach((ticker) => {
      newLoadingStates[`${ticker}-${analysisType}`] = true;
    });
    setLoadingStates(newLoadingStates);

    try {
      // Create an array of promises for each ticker
      const tickerPromises = selectedTickers.map(async (ticker) => {
        if (!tickerReports[ticker]) return;

        const payload: AnalysisRequest = {};
        await postAnalysis(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/${analysisType}`, payload);
        onReportGenerated(ticker);
      });

      // Execute all ticker promises in parallel
      await Promise.all(tickerPromises);
    } finally {
      // Reset loading states for this analysis type
      const finalLoadingStates = { ...loadingStates };
      selectedTickers.forEach((ticker) => {
        finalLoadingStates[`${ticker}-${analysisType}`] = false;
      });
      setLoadingStates(finalLoadingStates);
    }
  };

  // Function to generate a specific investor analysis for all selected tickers in parallel
  const handleGenerateInvestorAnalysisForAllTickers = async (investorKey: string): Promise<void> => {
    if (selectedTickers.length === 0) return;

    // Mark all cells for this investor analysis as loading
    const newLoadingStates = { ...loadingStates };
    selectedTickers.forEach((ticker) => {
      newLoadingStates[`${ticker}-investor-${investorKey}`] = true;
    });
    setLoadingStates(newLoadingStates);

    try {
      // Create an array of promises for each ticker
      const tickerPromises = selectedTickers.map(async (ticker) => {
        if (!tickerReports[ticker]) return;

        const payload: AnalysisRequest = {
          investorKey: investorKey,
        };
        await postAnalysis(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/investor-analysis`, payload);
        onReportGenerated(ticker);
      });

      // Execute all ticker promises in parallel
      await Promise.all(tickerPromises);
    } finally {
      // Reset loading states for this investor analysis
      const finalLoadingStates = { ...loadingStates };
      selectedTickers.forEach((ticker) => {
        finalLoadingStates[`${ticker}-investor-${investorKey}`] = false;
      });
      setLoadingStates(finalLoadingStates);
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
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Report Type</th>
              {selectedTickers.map((ticker) => (
                <th
                  key={ticker}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider align-top text-center"
                >
                  {ticker}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Generate For All selected tickers
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Regular Analysis Types */}
            {analysisTypes.map((analysis) => {
              // Check if any ticker is loading this analysis type
              const isAnyLoading = selectedTickers.some((ticker) => loadingStates[`${ticker}-${analysis.key}`]);

              return (
                <tr key={analysis.key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{analysis.label}</td>
                  {selectedTickers.map((ticker) => {
                    const report = tickerReports[ticker];
                    const isCompleted = report?.analysisStatus[analysis.statusKey];
                    const isLoading = loadingStates[`${ticker}-${analysis.key}`];

                    return (
                      <td key={`${ticker}-${analysis.key}`} className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-green-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => handleGenerateAnalysisForAllTickers(analysis.key)}
                      disabled={isAnyLoading || isGeneratingAll || selectedTickers.length === 0 || selectedTickers.some((ticker) => !tickerReports[ticker])}
                      loading={isAnyLoading}
                      className="ml-auto"
                    >
                      {isAnyLoading ? 'Generating...' : 'Generate For All for this specific factor'}
                    </Button>
                  </td>
                </tr>
              );
            })}

            {/* Investor Analysis Types */}
            {investorAnalysisTypes.map((investor) => {
              // Check if any ticker is loading this investor analysis
              const isAnyLoading = selectedTickers.some((ticker) => loadingStates[`${ticker}-investor-${investor.key}`]);

              return (
                <tr key={investor.key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{investor.label}</td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => handleGenerateInvestorAnalysisForAllTickers(investor.key)}
                      disabled={isAnyLoading || isGeneratingAll || selectedTickers.length === 0 || selectedTickers.some((ticker) => !tickerReports[ticker])}
                      loading={isAnyLoading}
                      className="ml-auto"
                    >
                      {isAnyLoading ? 'Generating...' : 'Generate For All for this specific investor analysis'}
                    </Button>
                  </td>
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
        {/* Common Generate All button for all tickers */}
        <div className="flex justify-center">
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
        </div>

        {/* Individual Generate All buttons for each ticker */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          {selectedTickers.map((ticker) => (
            <Button key={ticker} variant="outlined" onClick={() => handleGenerateAll(ticker)} disabled={isAnyProcessRunning} className="px-4 py-2">
              Generate All for {ticker}
            </Button>
          ))}
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
