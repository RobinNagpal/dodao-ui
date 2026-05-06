'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

// Define types for tracking API call status
type ApiCallStatus = 'pending' | 'loading' | 'completed';

interface ApiCall {
  id: string;
  name: string;
  status: ApiCallStatus;
}

export default function GenerateWholeReport({ industryId }: { industryId: string }) {
  const { postData } = usePostData<any, any>({ successMessage: '', errorMessage: '' });
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [topLevelApiCalls, setTopLevelApiCalls] = useState<ApiCall[]>([
    { id: 'understand-industry', name: 'Industry Understanding', status: 'pending' },
    { id: 'tariff-updates', name: 'Tariff Updates', status: 'pending' },
    { id: 'industry-areas', name: 'Industry Areas', status: 'pending' },
  ]);

  const [finalApiCalls, setFinalApiCalls] = useState<ApiCall[]>([
    { id: 'executive-summary', name: 'Executive Summary', status: 'pending' },
    { id: 'report-cover', name: 'Report Cover', status: 'pending' },
    { id: 'final-conclusion', name: 'Final Conclusion', status: 'pending' },
    { id: 'seo-metadata', name: 'SEO Metadata', status: 'pending' },
  ]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setProgress(0);

    setTopLevelApiCalls((prev) => prev.map((call) => ({ ...call, status: 'pending' })));
    setFinalApiCalls((prev) => prev.map((call) => ({ ...call, status: 'pending' })));

    try {
      const today = new Date().toISOString().split('T')[0];

      const setApiCallLoading = (apiCallId: string, setStateFn: React.Dispatch<React.SetStateAction<ApiCall[]>>) => {
        setStateFn((prev) => prev.map((call) => (call.id === apiCallId ? { ...call, status: 'loading' } : call)));
      };

      const updateApiCallStatus = (apiCallId: string, setStateFn: React.Dispatch<React.SetStateAction<ApiCall[]>>) => {
        setStateFn((prev) => prev.map((call) => (call.id === apiCallId ? { ...call, status: 'completed' } : call)));
      };

      const calculateTotalApiCalls = () => topLevelApiCalls.length + finalApiCalls.length;

      const calculateCompletedApiCalls = () => {
        const topLevelCompleted = topLevelApiCalls.filter((call) => call.status === 'completed').length;
        const finalCompleted = finalApiCalls.filter((call) => call.status === 'completed').length;
        return topLevelCompleted + finalCompleted;
      };

      const updateProgress = () => {
        const total = calculateTotalApiCalls();
        const completed = calculateCompletedApiCalls();
        const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
        setProgress(newProgress);
      };

      /* -------- 1. top-level sections ------------------------------------ */
      setCurrentStep('Generating industry understanding...');
      setApiCallLoading('understand-industry', setTopLevelApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-understand-industry`, {});
      updateApiCallStatus('understand-industry', setTopLevelApiCalls);
      updateProgress();

      setCurrentStep('Generating tariff updates...');
      setApiCallLoading('tariff-updates', setTopLevelApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-tariff-updates`, {
        industry: industryId,
        date: today,
      });
      updateApiCallStatus('tariff-updates', setTopLevelApiCalls);
      updateProgress();

      setCurrentStep('Generating industry areas...');
      setApiCallLoading('industry-areas', setTopLevelApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-industry-areas`, {
        industry: industryId,
      });
      updateApiCallStatus('industry-areas', setTopLevelApiCalls);
      updateProgress();

      /* -------- 2. Final sections ----------------------------------------- */
      setCurrentStep('Generating executive summary...');
      setApiCallLoading('executive-summary', setFinalApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-executive-summary`, {});
      updateApiCallStatus('executive-summary', setFinalApiCalls);
      updateProgress();

      setCurrentStep('Generating report cover...');
      setApiCallLoading('report-cover', setFinalApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-report-cover`, {});
      updateApiCallStatus('report-cover', setFinalApiCalls);
      updateProgress();

      setCurrentStep('Generating final conclusion...');
      setApiCallLoading('final-conclusion', setFinalApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-final-conclusion`, {
        industry: industryId,
      });
      updateApiCallStatus('final-conclusion', setFinalApiCalls);
      updateProgress();

      setCurrentStep('Generating SEO metadata...');
      setApiCallLoading('seo-metadata', setFinalApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-seo-info`, {
        section: ReportType.ALL,
      });
      updateApiCallStatus('seo-metadata', setFinalApiCalls);
      updateProgress();

      setCurrentStep('Report generation completed successfully! 🎉');
      setProgress(100);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err?.message || 'Generation failed');
      setCurrentStep('Generation failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <PrivateWrapper>
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Generate Full Tariff Report</h1>
        <p className="text-gray-600 mb-6">
          This will generate all sections of the tariff report sequentially. The process may take several minutes to complete.
        </p>
        <div className="mt-4 border-t border-blue-100 pt-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">API Calls Status:</h3>

          {/* Top Level API Calls */}
          <div className="mb-4">
            <h4 className="text-xs font-medium mb-1">Top Level Sections:</h4>
            <ul className="space-y-1">
              {topLevelApiCalls.map((call) => (
                <li key={call.id} className="flex items-center text-sm">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs mr-2 ${
                      call.status === 'completed' ? 'bg-green-500' : call.status === 'loading' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    {call.status === 'completed' ? (
                      '✓'
                    ) : call.status === 'loading' ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      ''
                    )}
                  </div>
                  <span>{call.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Final API Calls */}
          <div>
            <h4 className="text-xs font-medium mb-1">Final Sections:</h4>
            <ul className="space-y-1">
              {finalApiCalls.map((call) => (
                <li key={call.id} className="flex items-center text-sm">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs mr-2 ${
                      call.status === 'completed' ? 'bg-green-500' : call.status === 'loading' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    {call.status === 'completed' ? (
                      '✓'
                    ) : call.status === 'loading' ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      ''
                    )}
                  </div>
                  <span>{call.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!running && !error && (
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors" onClick={run}>
            Start Generation
          </button>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Generation Failed</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium" onClick={run}>
              Retry
            </button>
          </div>
        )}

        {running && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                <span className="text-blue-800 font-medium">Generation in Progress</span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-800 font-medium">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                <strong>Current:</strong> {currentStep}
              </p>
            </div>

            <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              ⚠️ <strong>Important:</strong> Keep this tab open during generation. The process will continue in the background.
            </div>
          </div>
        )}

        {!running && progress === 100 && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-3">✓</div>
              <span className="text-green-800 font-medium">Report Generation Complete!</span>
            </div>
            <p className="text-green-700 text-sm mt-2">All sections have been generated successfully. You can now view the complete report.</p>
          </div>
        )}
      </div>
    </PrivateWrapper>
  );
}
