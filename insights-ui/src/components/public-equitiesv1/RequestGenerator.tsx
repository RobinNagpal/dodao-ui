import { GenerationRequestPayload } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { INVESTOR_OPTIONS } from '@/types/ticker-typesv1';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1GenerationRequest } from '@prisma/client';
import React, { useState } from 'react';

interface RequestGeneratorProps {
  selectedTickers: string[];
  tickerRequests: Record<string, TickerV1GenerationRequest>;
  onRequestCreated: (ticker: string) => void;
}

export default function RequestGenerator({ selectedTickers, tickerRequests, onRequestCreated }: RequestGeneratorProps): JSX.Element {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isCreatingAll, setIsCreatingAll] = useState<boolean>(false);

  // Post hooks for request creation
  const { postData: postRequest, loading: requestLoading } = usePostData<TickerV1GenerationRequest[], GenerationRequestPayload[]>({
    successMessage: 'Request creation started successfully!',
    errorMessage: 'Failed to create request.',
  });

  const analysisTypes = [
    { key: 'financial-analysis', label: 'Financial Analysis', statusKey: 'regenerateFinancialAnalysis' },
    { key: 'competition', label: 'Competition', statusKey: 'regenerateCompetition' },
    { key: 'business-and-moat', label: 'Business & Moat', statusKey: 'regenerateBusinessAndMoat' },
    { key: 'past-performance', label: 'Past Performance', statusKey: 'regeneratePastPerformance' },
    { key: 'future-growth', label: 'Future Growth', statusKey: 'regenerateFutureGrowth' },
    { key: 'fair-value', label: 'Fair Value', statusKey: 'regenerateFairValue' },
    { key: 'future-risk', label: 'Future Risk', statusKey: 'regenerateFutureRisk' },
    { key: 'final-summary', label: 'Final Summary', statusKey: 'regenerateFinalSummary' },
    { key: 'cached-score', label: 'Cached Score', statusKey: 'regenerateCachedScore' },
  ];

  const investorAnalysisTypes = INVESTOR_OPTIONS.map((investor) => ({
    key: investor.key,
    label: `${investor.name} Analysis`,
    // Convert SCREAMING_SNAKE_CASE to PascalCase for Prisma field names
    fieldName: `regenerate${investor.key.charAt(0).toUpperCase()}${investor.key
      .slice(1)
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}`,
  }));

  const handleCreateAll = async (ticker: string): Promise<void> => {
    if (!ticker) return;

    // Create request with all analysis types set to true
    const payload: GenerationRequestPayload = {
      ticker,
      regenerateCompetition: true,
      regenerateFinancialAnalysis: true,
      regenerateBusinessAndMoat: true,
      regeneratePastPerformance: true,
      regenerateFutureGrowth: true,
      regenerateFairValue: true,
      regenerateFutureRisk: true,
      regenerateWarrenBuffett: true,
      regenerateCharlieMunger: true,
      regenerateBillAckman: true,
      regenerateFinalSummary: true,
      regenerateCachedScore: true,
    };

    const result = await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, [payload]);

    if (result && result.length > 0) {
      // Notify parent component to refresh the ticker request
      onRequestCreated(ticker);
    }
  };

  // Function to create all requests for all tickers in a single request
  const handleCreateAllForAllTickers = async (): Promise<void> => {
    if (selectedTickers.length === 0) return;

    // Set global loading state
    setIsCreatingAll(true);

    try {
      // Create an array of payloads for all tickers
      const payloads: GenerationRequestPayload[] = selectedTickers.map((ticker) => ({
        ticker,
        regenerateCompetition: true,
        regenerateFinancialAnalysis: true,
        regenerateBusinessAndMoat: true,
        regeneratePastPerformance: true,
        regenerateFutureGrowth: true,
        regenerateFairValue: true,
        regenerateFutureRisk: true,
        regenerateWarrenBuffett: true,
        regenerateCharlieMunger: true,
        regenerateBillAckman: true,
        regenerateFinalSummary: true,
        regenerateCachedScore: true,
      }));

      // Send all payloads in a single request
      const result = await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);

      if (result && result.length > 0) {
        // Notify parent component to refresh all ticker requests
        selectedTickers.forEach((ticker) => onRequestCreated(ticker));
      }
    } finally {
      // Reset global loading state
      setIsCreatingAll(false);
    }
  };

  // Function to create a specific request type for all selected tickers in a single request
  const handleCreateRequestForAllTickers = async (analysisType: string): Promise<void> => {
    if (selectedTickers.length === 0) return;

    // Mark all cells for this analysis type as loading
    const newLoadingStates = { ...loadingStates };
    selectedTickers.forEach((ticker) => {
      newLoadingStates[`${ticker}-${analysisType}`] = true;
    });
    setLoadingStates(newLoadingStates);

    try {
      // Filter out tickers that don't have requests
      const validTickers = selectedTickers.filter((ticker) => tickerRequests[ticker]);

      if (validTickers.length === 0) return;

      // Create an array of payloads for all valid tickers
      const payloads: GenerationRequestPayload[] = validTickers.map((ticker) => ({
        ticker,
        regenerateCompetition: analysisType === 'competition',
        regenerateFinancialAnalysis: analysisType === 'financial-analysis',
        regenerateBusinessAndMoat: analysisType === 'business-and-moat',
        regeneratePastPerformance: analysisType === 'past-performance',
        regenerateFutureGrowth: analysisType === 'future-growth',
        regenerateFairValue: analysisType === 'fair-value',
        regenerateFutureRisk: analysisType === 'future-risk',
        regenerateWarrenBuffett: false,
        regenerateCharlieMunger: false,
        regenerateBillAckman: false,
        regenerateFinalSummary: analysisType === 'final-summary',
        regenerateCachedScore: analysisType === 'cached-score',
      }));

      // Send all payloads in a single request
      const result = await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);

      if (result && result.length > 0) {
        // Notify parent component to refresh all ticker requests
        validTickers.forEach((ticker) => onRequestCreated(ticker));
      }
    } finally {
      // Reset loading states for this analysis type
      const finalLoadingStates = { ...loadingStates };
      selectedTickers.forEach((ticker) => {
        finalLoadingStates[`${ticker}-${analysisType}`] = false;
      });
      setLoadingStates(finalLoadingStates);
    }
  };

  // Function to create a specific investor request for all selected tickers in a single request
  const handleCreateInvestorRequestForAllTickers = async (investorKey: string): Promise<void> => {
    if (selectedTickers.length === 0) return;

    // Mark all cells for this investor analysis as loading
    const newLoadingStates = { ...loadingStates };
    selectedTickers.forEach((ticker) => {
      newLoadingStates[`${ticker}-investor-${investorKey}`] = true;
    });
    setLoadingStates(newLoadingStates);

    try {
      // Filter out tickers that don't have requests
      const validTickers = selectedTickers.filter((ticker) => tickerRequests[ticker]);

      if (validTickers.length === 0) return;

      // Create an array of payloads for all valid tickers
      const payloads: GenerationRequestPayload[] = validTickers.map((ticker) => ({
        ticker,
        regenerateCompetition: false,
        regenerateFinancialAnalysis: false,
        regenerateBusinessAndMoat: false,
        regeneratePastPerformance: false,
        regenerateFutureGrowth: false,
        regenerateFairValue: false,
        regenerateFutureRisk: false,
        regenerateWarrenBuffett: investorKey === 'WARREN_BUFFETT',
        regenerateCharlieMunger: investorKey === 'CHARLIE_MUNGER',
        regenerateBillAckman: investorKey === 'BILL_ACKMAN',
        regenerateFinalSummary: false,
        regenerateCachedScore: false,
      }));

      // Send all payloads in a single request
      const result = await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);

      if (result && result.length > 0) {
        // Notify parent component to refresh all ticker requests
        validTickers.forEach((ticker) => onRequestCreated(ticker));
      }
    } finally {
      // Reset loading states for this investor analysis
      const finalLoadingStates = { ...loadingStates };
      selectedTickers.forEach((ticker) => {
        finalLoadingStates[`${ticker}-investor-${investorKey}`] = false;
      });
      setLoadingStates(finalLoadingStates);
    }
  };

  // Function to render the grid view of requests
  const renderRequestsGrid = () => {
    if (selectedTickers.length === 0) {
      return <div className="text-center py-4">No tickers selected</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Request Type</th>
              {selectedTickers.map((ticker) => (
                <th key={ticker} className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider align-top text-center">
                  {ticker}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Create Request For All selected tickers</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {/* Regular Analysis Types */}
            {analysisTypes.map((analysis) => {
              // Check if any ticker is loading this analysis type
              const isAnyLoading = selectedTickers.some((ticker) => loadingStates[`${ticker}-${analysis.key}`]);

              return (
                <tr key={analysis.key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{analysis.label}</td>
                  {selectedTickers.map((ticker) => {
                    const request = tickerRequests[ticker];
                    const isRequested = request?.[analysis.statusKey as keyof typeof request];
                    const isLoading = loadingStates[`${ticker}-${analysis.key}`];

                    return (
                      <td key={`${ticker}-${analysis.key}`} className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`h-3 w-3 rounded-full ${isRequested ? 'bg-blue-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                          {request && <div className="text-xs text-gray-400">{request.status}</div>}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => handleCreateRequestForAllTickers(analysis.key)}
                      disabled={isAnyLoading || isCreatingAll || selectedTickers.length === 0 || selectedTickers.some((ticker) => !tickerRequests[ticker])}
                      loading={isAnyLoading}
                      className="ml-auto"
                    >
                      {isAnyLoading ? 'Creating...' : 'Create Request For All for this specific factor'}
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
                    const request = tickerRequests[ticker];
                    const isRequested = request?.[investor.fieldName as keyof typeof request];
                    const isLoading = loadingStates[`${ticker}-investor-${investor.key}`];

                    return (
                      <td key={`${ticker}-${investor.key}`} className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`h-3 w-3 rounded-full ${isRequested ? 'bg-blue-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                          {request && <div className="text-xs text-gray-400">{request.status}</div>}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => handleCreateInvestorRequestForAllTickers(investor.key)}
                      disabled={isAnyLoading || isCreatingAll || selectedTickers.length === 0 || selectedTickers.some((ticker) => !tickerRequests[ticker])}
                      loading={isAnyLoading}
                      className="ml-auto"
                    >
                      {isAnyLoading ? 'Creating...' : 'Create Request For All for this specific investor analysis'}
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

  // Function to render the "Create All" buttons
  const renderCreateAllButtons = () => {
    const isAnyLoading = Object.values(loadingStates).some((loading) => loading);
    const isAnyProcessRunning = isCreatingAll || isAnyLoading;

    return (
      <div className="space-y-4 my-4">
        {/* Common Create All button for all tickers */}
        <div className="flex justify-center">
          <Button
            variant="contained"
            primary
            onClick={handleCreateAllForAllTickers}
            disabled={isAnyProcessRunning || selectedTickers.length === 0}
            loading={isCreatingAll}
            className="px-8 py-3 text-lg font-semibold"
          >
            {isCreatingAll ? 'Creating All Requests...' : 'Create All Requests for All Tickers'}
          </Button>
        </div>

        {/* Individual Create All buttons for each ticker */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          {selectedTickers.map((ticker) => (
            <Button key={ticker} variant="outlined" onClick={() => handleCreateAll(ticker)} disabled={isAnyProcessRunning} className="px-4 py-2">
              Create All for {ticker}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Block title="Request Creation" className="text-color">
      {selectedTickers.length > 0 ? (
        <>
          {renderCreateAllButtons()}
          {renderRequestsGrid()}
        </>
      ) : (
        <div className="text-center py-8">Select one or more tickers to create requests</div>
      )}
    </Block>
  );
}
