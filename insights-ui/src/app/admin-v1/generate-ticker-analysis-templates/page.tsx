'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import SearchBar, { SearchResult } from '@/components/core/SearchBar/SearchBar';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import AdminNav from '../AdminNav';
import { GenerateAnalysisRequest, GeneratedAnalysis } from '../../api/admin-v1/ticker-analysis-generation/route';
import { AnalysisTemplateWithRelations } from '../../api/admin-v1/detailed-reports/route';

export default function GenerateTickerAnalysisTemplatesPage() {
  const [selectedTicker, setSelectedTicker] = useState<SearchResult | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const { data: templates, loading: templatesLoading } = useFetchData<AnalysisTemplateWithRelations[]>(
    `${getBaseUrl()}/api/admin-v1/detailed-reports`,
    { cache: 'no-cache' },
    'Failed to fetch analysis templates'
  );

  const {
    data: generatedAnalyses,
    loading: generatedAnalysesLoading,
    reFetchData: refetchGeneratedAnalyses,
  } = useFetchData<GeneratedAnalysis[]>(`${getBaseUrl()}/api/admin-v1/ticker-analysis-generation`, { cache: 'no-cache' }, 'Failed to fetch generated analyses');

  const { postData: generateAnalysis, loading: generateAnalysisLoading } = usePostData<GeneratedAnalysis, GenerateAnalysisRequest>({
    successMessage: 'Analysis generated successfully!',
    errorMessage: 'Failed to generate analysis.',
  });

  const handleTickerSelect = (ticker: SearchResult) => {
    setSelectedTicker(ticker);
  };

  const handleGenerateAnalysis = async () => {
    if (!selectedTicker || !selectedTemplateId || !selectedCategoryId) {
      alert('Please select a ticker, analysis template, and category');
      return;
    }

    await generateAnalysis(`${getBaseUrl()}/api/admin-v1/ticker-analysis-generation`, {
      tickerId: selectedTicker.id,
      analysisTemplateId: selectedTemplateId,
      categoryId: selectedCategoryId,
    });

    // Refetch generated analyses
    refetchGeneratedAnalyses();

    // Reset selections
    setSelectedTicker(null);
    setSelectedTemplateId('');
    setSelectedCategoryId('');
  };

  const templateOptions =
    templates?.map((template) => ({
      id: template.id,
      label: template.name,
    })) || [];

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);
  const categoryOptions =
    selectedTemplate?.categories?.map((cat) => ({
      id: cat.id,
      label: cat.name,
    })) || [];

  return (
    <PageWrapper>
      <AdminNav />
      <div className="text-color">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl heading-color">Generate Ticker Analysis</h1>
          <Link href="/admin-v1/detailed-reports" className="text-blue-600 hover:underline">
            Manage Templates
          </Link>
        </div>

        <p className="text-gray-600 mb-8">Generate detailed analysis for specific tickers using analysis templates and categories.</p>

        {/* Generation Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Generate New Analysis</h2>

          <div className="space-y-6">
            {/* Ticker Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search and Select Ticker *</label>
              <div className="mb-2">
                <SearchBar placeholder="Search stocks by symbol or company name..." onResultClick={handleTickerSelect} />
              </div>
              {selectedTicker && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{selectedTicker.symbol}</strong> - {selectedTicker.name}
                      <div className="text-sm text-gray-600">
                        {selectedTicker.exchange} | Score: {selectedTicker.cachedScoreEntry?.finalScore || 'N/A'}
                      </div>
                    </div>
                    <Button onClick={() => setSelectedTicker(null)} variant="outlined" size="sm">
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Template Selection */}
            <div>
              <StyledSelect
                label="Select Analysis Template *"
                selectedItemId={selectedTemplateId}
                items={templateOptions}
                setSelectedItemId={(id) => {
                  setSelectedTemplateId(id || '');
                  setSelectedCategoryId(''); // Reset category when template changes
                }}
              />
            </div>

            {/* Category Selection */}
            <div>
              <StyledSelect
                label="Select Category *"
                selectedItemId={selectedCategoryId}
                items={categoryOptions}
                setSelectedItemId={(id) => setSelectedCategoryId(id || '')}
              />
              {!selectedTemplateId && <p className="text-sm text-gray-500 mt-1">Please select an analysis template first</p>}
            </div>

            {/* Generate Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleGenerateAnalysis}
                primary
                loading={generateAnalysisLoading}
                disabled={!selectedTicker || !selectedTemplateId || !selectedCategoryId || categoryOptions.length === 0}
              >
                Generate Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* Generated Analyses Table */}
        <div>
          <h2 className="text-2xl heading-color mb-4">Generated Analyses</h2>
          {generatedAnalysesLoading ? (
            <p>Loading generated analyses...</p>
          ) : generatedAnalyses && generatedAnalyses.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedAnalyses.map((analysis) => (
                    <tr key={analysis.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{analysis.ticker.symbol}</div>
                          <div className="text-sm text-gray-500">{analysis.ticker.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analysis.analysisTemplate.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analysis.category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/stocks/${analysis.ticker.exchange}/${analysis.ticker.symbol}/${analysis.analysisTemplateId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No analyses generated yet</p>
              <p className="text-sm text-gray-400">Generate your first analysis using the form above</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
