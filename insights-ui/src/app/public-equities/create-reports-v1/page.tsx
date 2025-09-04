'use client';

import React, { useState, useEffect } from 'react';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { INDUSTRY_OPTIONS, SUB_INDUSTRY_OPTIONS, INVESTOR_OPTIONS, getIndustryDisplayName, getSubIndustryDisplayName } from '@/lib/mappingsV1';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { AnalysisRequest, TickerAnalysisResponse, TickerV1 } from '@/types/public-equity/analysis-factors-types';

interface NewTickerResponse {
  success: boolean;
  ticker: TickerV1;
}

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

interface NewTickerForm {
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl: string;
  summary: string;
}

interface GenerationSettings {
  investorKey: string;
}

export default function CreateReportsV1Page(): JSX.Element {
  const [showAddTickerForm, setShowAddTickerForm] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    investorKey: 'WARREN_BUFFETT',
  });
  const [newTickerForm, setNewTickerForm] = useState<NewTickerForm>({
    name: '',
    symbol: '',
    exchange: 'NASDAQ',
    industryKey: 'REITS',
    subIndustryKey: 'RESIDENTIAL_REITS',
    websiteUrl: '',
    summary: '',
  });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  // Fetch all tickers
  const {
    data: tickers,
    loading: tickersLoading,
    reFetchData: refetchTickers,
  } = useFetchData<TickerV1[]>(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, { cache: 'no-cache' }, 'Failed to fetch tickers');

  // Fetch selected ticker report
  const {
    data: tickerReport,
    loading: reportLoading,
    reFetchData: refetchTickerReport,
  } = useFetchData<TickerReportV1>(
    selectedTicker ? `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${selectedTicker}` : '',
    {
      cache: 'no-cache',
      skipInitialFetch: !selectedTicker, // Only fetch when ticker is selected
    },
    'Failed to fetch ticker report'
  );

  // Post hooks for analysis generation
  const { postData: postAnalysis, loading: analysisLoading } = usePostData<TickerAnalysisResponse, AnalysisRequest>({
    successMessage: 'Analysis generation started successfully!',
    errorMessage: 'Failed to generate analysis.',
  });

  // Post hook for adding new ticker
  const { postData: postNewTicker, loading: addTickerLoading } = usePostData<NewTickerResponse, NewTickerForm>({
    successMessage: 'Ticker added successfully!',
    errorMessage: 'Failed to add ticker.',
  });

  const exchangeItems: StyledSelectItem[] = [
    { id: 'NASDAQ', label: 'NASDAQ' },
    { id: 'NYSE', label: 'NYSE' },
    { id: 'AMEX', label: 'AMEX' },
    { id: 'TSX', label: 'TSX' },
  ];

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

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await postNewTicker(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, newTickerForm);
    if (result) {
      setShowAddTickerForm(false);
      setNewTickerForm({
        name: '',
        symbol: '',
        exchange: 'NASDAQ',
        industryKey: 'REITS',
        subIndustryKey: 'RESIDENTIAL_REITS',
        websiteUrl: '',
        summary: '',
      });
      // Refresh the tickers list to include the new ticker
      await refetchTickers();
    }
  };

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
        // Refresh the ticker report to show updated analysis status
        await refetchTickerReport();
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
        // Refresh the ticker report to show updated analysis status
        await refetchTickerReport();
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

  const getTickerItems = (): StyledSelectItem[] => {
    return (
      tickers?.map((ticker) => ({
        id: ticker.symbol,
        label: `${ticker.symbol} - ${ticker.name}`,
      })) || []
    );
  };

  if (tickersLoading) {
    return <FullPageLoader />;
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <Block title="Ticker Reports V1 Management" className="text-color">
          <div className="space-y-4">
            {/* Add New Ticker Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Ticker Analyses</h2>
              <Button variant="contained" primary onClick={() => setShowAddTickerForm(true)}>
                Add New Ticker
              </Button>
            </div>

            {/* Ticker Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StyledSelect label="Select Ticker" selectedItemId={selectedTicker} items={getTickerItems()} setSelectedItemId={setSelectedTicker} />
            </div>

            {/* Generation Settings */}
            <Block title="Generation Settings" className=" dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StyledSelect
                  label="Investor Style (for Investor Analysis)"
                  selectedItemId={generationSettings.investorKey}
                  items={INVESTOR_OPTIONS.map((opt) => ({ id: opt.key, label: opt.name }))}
                  setSelectedItemId={(key) =>
                    setGenerationSettings((prev) => ({
                      ...prev,
                      investorKey: key || 'WARREN_BUFFETT',
                    }))
                  }
                />
              </div>
            </Block>

            {/* Analysis Status and Actions */}
            {selectedTicker && tickerReport && (
              <Block title={`Analysis Status: ${tickerReport.ticker.name} (${tickerReport.ticker.symbol})`} className="text-color">
                {reportLoading ? (
                  <div className="text-center py-8">Loading report...</div>
                ) : (
                  <div className="space-y-4">
                    {/* Ticker Info */}
                    <div className=" dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <strong>Industry:</strong> {getIndustryDisplayName(tickerReport.ticker.industryKey)}
                        </div>
                        <div>
                          <strong>Sub-Industry:</strong> {getSubIndustryDisplayName(tickerReport.ticker.subIndustryKey)}
                        </div>
                        <div>
                          <strong>Exchange:</strong> {tickerReport.ticker.exchange}
                        </div>
                      </div>
                      {tickerReport.ticker.websiteUrl && (
                        <div className="mt-2">
                          <strong>Website:</strong>{' '}
                          <a href={tickerReport.ticker.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {tickerReport.ticker.websiteUrl}
                          </a>
                        </div>
                      )}
                      {tickerReport.ticker.summary && (
                        <div className="mt-2">
                          <strong>Summary:</strong> {tickerReport.ticker.summary}
                        </div>
                      )}
                    </div>

                    {/* Generate All Button */}
                    <div className="flex justify-center">
                      <Button
                        variant="contained"
                        primary
                        onClick={() => handleGenerateAll(selectedTicker)}
                        disabled={Object.values(loadingStates).some(Boolean)}
                        className="px-8 py-3"
                      >
                        {Object.values(loadingStates).some(Boolean) ? 'Generating...' : 'Generate All Analyses'}
                      </Button>
                    </div>

                    {/* Individual Analysis Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {analysisTypes.map((analysis) => {
                        const isCompleted = tickerReport.analysisStatus[analysis.statusKey];
                        const isLoading = loadingStates[`${selectedTicker}-${analysis.key}`];

                        return (
                          <div key={analysis.key} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{analysis.label}</h4>
                              <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>

                            <div className="text-sm text-gray-600">Status: {isCompleted ? 'Completed' : 'Not Generated'}</div>

                            <Button
                              variant="outlined"
                              size="sm"
                              onClick={() => handleGenerateAnalysis(analysis.key, selectedTicker)}
                              disabled={isLoading}
                              loading={isLoading}
                              className="w-full"
                            >
                              {isLoading ? 'Generating...' : isCompleted ? 'Regenerate' : 'Generate'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Investor Analysis Status */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Investor Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {investorAnalysisTypes.map((investor) => {
                          const isCompleted =
                            tickerReport.analysisStatus.investorAnalysis[investor.key as keyof typeof tickerReport.analysisStatus.investorAnalysis];
                          const isLoading = loadingStates[`${selectedTicker}-investor-${investor.key}`];

                          return (
                            <div key={investor.key} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{investor.label}</h4>
                                <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                              </div>

                              <div className="text-sm text-gray-600">Status: {isCompleted ? 'Completed' : 'Not Generated'}</div>

                              <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => handleGenerateInvestorAnalysis(investor.key, selectedTicker)}
                                disabled={isLoading}
                                loading={isLoading}
                                className="w-full"
                              >
                                {isLoading ? 'Generating...' : isCompleted ? 'Regenerate' : 'Generate'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </Block>
            )}
          </div>
        </Block>

        {/* Add Ticker Modal/Form */}
        {showAddTickerForm && (
          <Block title="Add New Ticker" className="text-color">
            <form onSubmit={handleAddTicker} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Company Name</label>
                  <input
                    type="text"
                    value={newTickerForm.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTickerForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Symbol</label>
                  <input
                    type="text"
                    value={newTickerForm.symbol}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTickerForm((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    required
                    className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <StyledSelect
                  label="Exchange"
                  selectedItemId={newTickerForm.exchange}
                  items={exchangeItems}
                  setSelectedItemId={(exchange) => setNewTickerForm((prev) => ({ ...prev, exchange: exchange || 'NASDAQ' }))}
                />

                <StyledSelect
                  label="Industry"
                  selectedItemId={newTickerForm.industryKey}
                  items={INDUSTRY_OPTIONS.map((opt) => ({ id: opt.key, label: opt.name }))}
                  setSelectedItemId={(industry) => setNewTickerForm((prev) => ({ ...prev, industryKey: industry || 'REITS' }))}
                />

                <StyledSelect
                  label="Sub-Industry"
                  selectedItemId={newTickerForm.subIndustryKey}
                  items={SUB_INDUSTRY_OPTIONS.map((opt) => ({ id: opt.key, label: opt.name }))}
                  setSelectedItemId={(subIndustry) => setNewTickerForm((prev) => ({ ...prev, subIndustryKey: subIndustry || 'RESIDENTIAL_REITS' }))}
                />

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Website URL</label>
                  <input
                    type="url"
                    value={newTickerForm.websiteUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTickerForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Summary</label>
                <textarea
                  value={newTickerForm.summary}
                  onChange={(e) => setNewTickerForm((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief description of the company..."
                  rows={3}
                  className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" variant="contained" primary loading={addTickerLoading} disabled={addTickerLoading}>
                  {addTickerLoading ? 'Adding...' : 'Add Ticker'}
                </Button>

                <Button type="button" variant="outlined" onClick={() => setShowAddTickerForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Block>
        )}
      </div>
    </PageWrapper>
  );
}
