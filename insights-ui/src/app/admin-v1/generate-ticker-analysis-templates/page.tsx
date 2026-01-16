'use client';

import React, { useState, useEffect } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import SearchBar, { SearchResult } from '@/components/core/SearchBar/SearchBar';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import AdminNav from '../AdminNav';
import { GeneratedAnalysis } from '../../api/analysis-templates/detailed-reports/route';
import { AnalysisTemplateWithRelations } from '../../api/analysis-templates/route';
import { GenerateAnalysisTypeResponse } from '../../api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/[analysisTemplateId]/[categoryId]/[analysisTypeId]/route';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getAnalysisResultColorClasses } from '@/utils/score-utils';
import { TrashIcon } from '@heroicons/react/24/outline';
import DeleteConfirmationModal from '../industry-management/DeleteConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';

interface AnalysisTypeStatus {
  analysisTypeId: string;
  analysisTypeName: string;
  status: ProcessingStatus;
  output?: string;
  result?: string;
  error?: string;
}

export default function GenerateTickerAnalysisTemplatesPage() {
  const [selectedTicker, setSelectedTicker] = useState<SearchResult | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [analysisTypesStatus, setAnalysisTypesStatus] = useState<AnalysisTypeStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<GeneratedAnalysis | null>(null);

  const { data: templates, loading: templatesLoading } = useFetchData<AnalysisTemplateWithRelations[]>(
    `${getBaseUrl()}/api/analysis-templates`,
    { cache: 'no-cache' },
    'Failed to fetch analysis templates'
  );

  const {
    data: generatedAnalyses,
    loading: generatedAnalysesLoading,
    reFetchData: refetchGeneratedAnalyses,
  } = useFetchData<GeneratedAnalysis[]>(`${getBaseUrl()}/api/analysis-templates/detailed-reports`, { cache: 'no-cache' }, 'Failed to fetch generated analyses');

  const { postData: generateSingleAnalysis } = usePostData<GenerateAnalysisTypeResponse, {}>({
    successMessage: '',
    errorMessage: '',
  });

  const { deleteData, loading } = useDeleteData({
    successMessage: 'Analysis deleted successfully',
    errorMessage: 'Failed to delete analysis',
  });

  const handleTickerSelect = (ticker: SearchResult) => {
    setSelectedTicker(ticker);
    // Reset analysis types status when ticker changes
    setAnalysisTypesStatus([]);
  };

  const handleDeleteClick = (analysis: GeneratedAnalysis) => {
    setAnalysisToDelete(analysis);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!analysisToDelete) return;

    const url = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${analysisToDelete.ticker.exchange}/${analysisToDelete.ticker.symbol}/${
      analysisToDelete.analysisTemplateId
    }/${analysisToDelete.categoryId}`;

    await deleteData(url);
    setDeleteModalOpen(false);
    setAnalysisToDelete(null);
    refetchGeneratedAnalyses();
  };

  // Update analysis types status when template or category changes
  useEffect(() => {
    if (selectedTemplateId && selectedCategoryId) {
      const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);
      const selectedCategory = selectedTemplate?.categories?.find((c) => c.id === selectedCategoryId);

      if (selectedCategory?.analysisTypes) {
        const newAnalysisTypesStatus: AnalysisTypeStatus[] = selectedCategory.analysisTypes.map((analysisType) => ({
          analysisTypeId: analysisType.id,
          analysisTypeName: analysisType.name,
          status: ProcessingStatus.NotStarted,
        }));
        setAnalysisTypesStatus(newAnalysisTypesStatus);
      }
    } else {
      setAnalysisTypesStatus([]);
    }
  }, [selectedTemplateId, selectedCategoryId, templates]);

  const handleGenerateAnalysis = async () => {
    if (!selectedTicker || !selectedTemplateId || !selectedCategoryId || analysisTypesStatus.length === 0) {
      return;
    }

    setIsGenerating(true);
    setCurrentGeneratingIndex(0);

    try {
      // Process each analysis type sequentially
      for (let i = 0; i < analysisTypesStatus.length; i++) {
        setCurrentGeneratingIndex(i);
        const analysisType = analysisTypesStatus[i];

        // Update status to InProgress
        setAnalysisTypesStatus((prev) => prev.map((item, index) => (index === i ? { ...item, status: ProcessingStatus.InProgress } : item)));

        try {
          const response = await generateSingleAnalysis(
            `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${selectedTicker.exchange}/${
              selectedTicker.symbol
            }/${selectedTemplateId}/${selectedCategoryId}/${analysisType.analysisTypeId}`
          );

          if (response?.success) {
            // Update status to Completed
            setAnalysisTypesStatus((prev) =>
              prev.map((item, index) =>
                index === i
                  ? {
                      ...item,
                      status: ProcessingStatus.Completed,
                      output: response.output,
                      result: response.result,
                    }
                  : item
              )
            );
          } else {
            throw new Error('Generation failed');
          }
        } catch (error) {
          // Update status to Failed
          setAnalysisTypesStatus((prev) =>
            prev.map((item, index) =>
              index === i
                ? {
                    ...item,
                    status: ProcessingStatus.Failed,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  }
                : item
            )
          );
        }
      }

      // Refetch generated analyses
      refetchGeneratedAnalyses();
    } finally {
      setIsGenerating(false);
      setCurrentGeneratingIndex(-1);
    }
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
    <div className="mt-12 px-4 text-color max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Generate Ticker Analysis</h1>
        <Link href="/admin-v1/analysis-templates" className="text-blue-600 hover:underline">
          Manage Templates
        </Link>
      </div>

      <p className="text-gray-600 mb-8">Generate detailed analysis for specific tickers using analysis templates and categories.</p>

      {/* Generation Form */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Generate New Analysis</h2>

        <div className="space-y-6">
          {/* Ticker Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search and Select Ticker *</label>
            <div className="mb-2">
              <SearchBar placeholder="Search stocks by symbol or company name..." onResultClick={handleTickerSelect} />
            </div>
            {selectedTicker && (
              <div className="p-3 bg-gray-700 border border-gray-600 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <strong className="text-white">{selectedTicker.symbol}</strong> - <span className="text-gray-300">{selectedTicker.name}</span>
                    <div className="text-sm text-gray-400">
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

          {/* Analysis Types Status */}
          {analysisTypesStatus.length > 0 && (
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Analysis Types to Generate</h3>
              <div className="space-y-3">
                {analysisTypesStatus.map((analysisType, index) => {
                  const { textColorClass, bgColorClass, displayLabel } = getAnalysisResultColorClasses(analysisType.result);

                  return (
                    <div key={analysisType.analysisTypeId} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-white">{analysisType.analysisTypeName}</span>
                        {analysisType.error && <div className="text-sm text-red-400 mt-1">{analysisType.error}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        {isGenerating && currentGeneratingIndex === index && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        )}

                        {analysisType.result && analysisType.status === ProcessingStatus.Completed && (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bgColorClass} bg-opacity-20 ${textColorClass}`}>{displayLabel}</span>
                        )}

                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            analysisType.status === ProcessingStatus.InProgress
                              ? 'bg-blue-900 text-blue-200'
                              : analysisType.status === ProcessingStatus.NotStarted
                              ? 'bg-gray-600 text-gray-300'
                              : analysisType.status === ProcessingStatus.Failed
                              ? 'bg-red-900 text-red-200'
                              : 'bg-green-900 text-green-200'
                          }`}
                        >
                          {analysisType.status === ProcessingStatus.InProgress
                            ? 'Processing...'
                            : analysisType.status === ProcessingStatus.NotStarted
                            ? 'Not Started'
                            : analysisType.status === ProcessingStatus.Failed
                            ? 'Failed'
                            : 'Completed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleGenerateAnalysis}
              primary
              loading={isGenerating}
              disabled={!selectedTicker || !selectedTemplateId || !selectedCategoryId || categoryOptions.length === 0 || analysisTypesStatus.length === 0}
            >
              {isGenerating ? `Generating... (${currentGeneratingIndex + 1}/${analysisTypesStatus.length})` : 'Generate All Analyses'}
            </Button>
            {analysisTypesStatus.length > 0 && !isGenerating && (
              <Button
                onClick={() => {
                  setAnalysisTypesStatus((prev) =>
                    prev.map((item) => ({
                      ...item,
                      status: ProcessingStatus.NotStarted,
                      output: undefined,
                      result: undefined,
                      error: undefined,
                    }))
                  );
                }}
                variant="outlined"
              >
                Reset Status
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Generated Analyses Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Generated Analyses</h2>
        {generatedAnalysesLoading ? (
          <p className="text-gray-300">Loading generated analyses...</p>
        ) : generatedAnalyses && generatedAnalyses.length > 0 ? (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Generated At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-600">
                {generatedAnalyses.map((analysis) => (
                  <tr key={analysis.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{analysis.ticker.symbol}</div>
                        <div className="text-sm text-gray-400">{analysis.ticker.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{analysis.analysisTemplate.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{analysis.category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(analysis.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/stocks/${analysis.ticker.exchange}/${analysis.ticker.symbol}/${analysis.analysisTemplateId}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(analysis)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                          title="Delete analysis"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No analyses generated yet</p>
            <p className="text-sm text-gray-500">Generate your first analysis using the form above</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        title="Delete Analysis"
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAnalysisToDelete(null);
        }}
        onDelete={handleConfirmDelete}
        deleting={loading}
        deleteButtonText="Delete Analysis"
        confirmationText="DELETE"
      />
    </div>
  );
}
