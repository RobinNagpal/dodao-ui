'use client';

import React, { useState, useEffect, use } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { AnalysisTemplateReportWithRelations } from '../../../../api/analysis-template-reports/route';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { getAnalysisResultColorClasses } from '@/utils/score-utils';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';

interface AnalysisParameterStatus {
  parameterId: string;
  parameterName: string;
  status: ProcessingStatus;
  output?: string;
  result?: string;
  error?: string;
}

interface GenerateAnalysisResponse {
  success: boolean;
  parameterId: string;
  output: string;
  result: string;
}

export default function GenerateAnalysisTemplateReportPage({ params }: { params: Promise<{ analysisTemplateReportId: string }> }) {
  const { analysisTemplateReportId } = use(params);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [analysisParametersStatus, setAnalysisParametersStatus] = useState<AnalysisParameterStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1);

  const { data: analysisTemplateReport, loading: reportLoading } = useFetchData<AnalysisTemplateReportWithRelations>(
    `${getBaseUrl()}/api/analysis-template-reports/${analysisTemplateReportId}`,
    { cache: 'no-cache' },
    'Failed to fetch analysis template report'
  );

  const { postData: generateSingleAnalysis } = usePostData<GenerateAnalysisResponse, {}>({
    successMessage: '',
    errorMessage: '',
  });

  // Update analysis parameters status when category changes
  useEffect(() => {
    if (selectedCategoryId && analysisTemplateReport) {
      const selectedCategory = analysisTemplateReport.analysisTemplate.categories.find((cat) => cat.id === selectedCategoryId);

      if (selectedCategory?.analysisParameters) {
        const newParametersStatus: AnalysisParameterStatus[] = selectedCategory.analysisParameters.map((param) => ({
          parameterId: param.id,
          parameterName: param.name,
          status: ProcessingStatus.NotStarted,
        }));
        setAnalysisParametersStatus(newParametersStatus);
      }
    } else {
      setAnalysisParametersStatus([]);
    }
  }, [selectedCategoryId, analysisTemplateReport]);

  const handleGenerateAnalysis = async () => {
    if (!selectedCategoryId || analysisParametersStatus.length === 0) {
      return;
    }

    setIsGenerating(true);
    setCurrentGeneratingIndex(0);

    try {
      // Process each analysis parameter sequentially
      for (let i = 0; i < analysisParametersStatus.length; i++) {
        setCurrentGeneratingIndex(i);
        const parameter = analysisParametersStatus[i];

        // Update status to InProgress
        setAnalysisParametersStatus((prev) => prev.map((item, index) => (index === i ? { ...item, status: ProcessingStatus.InProgress } : item)));

        try {
          const response = await generateSingleAnalysis(
            `${getBaseUrl()}/api/analysis-template-reports/${analysisTemplateReportId}/${selectedCategoryId}/${parameter.parameterId}`
          );

          if (response?.success) {
            // Update status to Completed
            setAnalysisParametersStatus((prev) =>
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
          setAnalysisParametersStatus((prev) =>
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
    } finally {
      setIsGenerating(false);
      setCurrentGeneratingIndex(-1);
    }
  };

  const categoryOptions =
    analysisTemplateReport?.analysisTemplate.categories.map((cat) => ({
      id: cat.id,
      label: cat.name,
    })) || [];

  if (reportLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="mt-12 px-4 text-color max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Generate Analysis Report</h1>
          <div className="mt-2 text-gray-600">
            <p className="font-medium">{analysisTemplateReport?.analysisTemplate.name}</p>
            <p className="text-sm">
              {(() => {
                const inputObj = analysisTemplateReport?.inputObj as any;
                return inputObj?.tickerSymbol ? `Ticker: ${inputObj.tickerSymbol} (${inputObj.exchange})` : `Company: ${inputObj?.companyName || 'Unknown'}`;
              })()}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href={`/admin-v1/analysis-template-report/${analysisTemplateReportId}`} className="text-blue-600 hover:underline">
            View Results
          </Link>
          <Link href="/admin-v1/analysis-template-report" className="text-blue-600 hover:underline">
            Back to Reports
          </Link>
        </div>
      </div>

      <p className="text-gray-600 mb-8">Generate detailed analysis for selected categories using the analysis template parameters.</p>

      {/* Generation Form */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Generate Analysis</h2>

        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <StyledSelect
              label="Select Category *"
              selectedItemId={selectedCategoryId}
              items={categoryOptions}
              setSelectedItemId={(id) => setSelectedCategoryId(id || '')}
            />
          </div>

          {/* Analysis Parameters Status */}
          {analysisParametersStatus.length > 0 && (
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Parameters to Analyze</h3>
              <div className="space-y-3">
                {analysisParametersStatus.map((parameter, index) => {
                  const { textColorClass, bgColorClass, displayLabel } = getAnalysisResultColorClasses(parameter.result);

                  return (
                    <div key={parameter.parameterId} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-white">{parameter.parameterName}</span>
                        {parameter.error && <div className="text-sm text-red-400 mt-1">{parameter.error}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        {isGenerating && currentGeneratingIndex === index && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        )}

                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            parameter.status === ProcessingStatus.InProgress
                              ? 'bg-blue-900 text-blue-200'
                              : parameter.status === ProcessingStatus.NotStarted
                              ? 'bg-gray-600 text-gray-300'
                              : parameter.status === ProcessingStatus.Failed
                              ? 'bg-red-900 text-red-200'
                              : 'bg-green-900 text-green-200'
                          }`}
                        >
                          {parameter.status === ProcessingStatus.InProgress
                            ? 'Processing...'
                            : parameter.status === ProcessingStatus.NotStarted
                            ? 'Not Started'
                            : parameter.status === ProcessingStatus.Failed
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
              disabled={!selectedCategoryId || categoryOptions.length === 0 || analysisParametersStatus.length === 0}
            >
              {isGenerating ? `Generating... (${currentGeneratingIndex + 1}/${analysisParametersStatus.length})` : 'Generate All Analyses'}
            </Button>
            {analysisParametersStatus.length > 0 && !isGenerating && (
              <Button
                onClick={() => {
                  setAnalysisParametersStatus((prev) =>
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
            {analysisParametersStatus.some((p) => p.status === ProcessingStatus.Completed) && !isGenerating && (
              <Link href={`/admin-v1/analysis-template-report/${analysisTemplateReportId}`}>
                <Button variant="outlined">View All Results →</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
