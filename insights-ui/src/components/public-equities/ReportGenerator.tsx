import React, { useState } from 'react';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AnalysisRequest, TickerAnalysisResponse, TickerV1 } from '@/types/public-equity/analysis-factors-types';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getIndustryDisplayName, getSubIndustryDisplayName } from '@/lib/mappingsV1';

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
}

interface TickerReportV1 {
  ticker: TickerV1;
  analysisStatus: AnalysisStatus;
}

interface GenerationSettings {
  investorKey: string;
}

interface ReportGeneratorProps {
  selectedTickers: string[];
  tickerReports: Record<string, TickerReportV1>;
  onReportGenerated: (ticker: string) => void;
  generationSettings: GenerationSettings;
}

export default function ReportGenerator({ selectedTickers, tickerReports, onReportGenerated, generationSettings }: ReportGeneratorProps): JSX.Element {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

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

      // Add investorKey for investor analysis
      if (analysisType === 'investor-analysis') {
        payload.investorKey = generationSettings.investorKey;
      }

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

  const handleGenerateAll = async (ticker: string) => {
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
                <th key={ticker} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Regular Analysis Types */}
            {analysisTypes.map((analysis) => (
              <tr key={analysis.key}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{analysis.label}</td>
                {selectedTickers.map((ticker) => {
                  const report = tickerReports[ticker];
                  const isCompleted = report?.analysisStatus[analysis.statusKey];
                  const isLoading = loadingStates[`${ticker}-${analysis.key}`];

                  return (
                    <td key={`${ticker}-${analysis.key}`} className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => handleGenerateAnalysis(analysis.key, ticker)}
                          disabled={isLoading || !report}
                          loading={isLoading}
                          className="w-full"
                        >
                          {isLoading ? 'Generating...' : isCompleted ? 'Regenerate' : 'Generate'}
                        </Button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Investor Analysis Types */}
            {investorAnalysisTypes.map((investor) => (
              <tr key={investor.key}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{investor.label}</td>
                {selectedTickers.map((ticker) => {
                  const report = tickerReports[ticker];
                  const isCompleted = report?.analysisStatus.investorAnalysis[investor.key as keyof typeof report.analysisStatus.investorAnalysis];
                  const isLoading = loadingStates[`${ticker}-investor-${investor.key}`];

                  return (
                    <td key={`${ticker}-${investor.key}`} className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => handleGenerateInvestorAnalysis(investor.key, ticker)}
                          disabled={isLoading || !report}
                          loading={isLoading}
                          className="w-full"
                        >
                          {isLoading ? 'Generating...' : isCompleted ? 'Regenerate' : 'Generate'}
                        </Button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Function to render the "Generate All" buttons for each ticker
  const renderGenerateAllButtons = () => {
    return (
      <div className="flex flex-wrap gap-4 justify-center my-4">
        {selectedTickers.map((ticker) => (
          <Button
            key={ticker}
            variant="contained"
            primary
            onClick={() => handleGenerateAll(ticker)}
            disabled={Object.values(loadingStates).some((loading) => loading)}
            className="px-4 py-2"
          >
            Generate All for {ticker}
          </Button>
        ))}
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
