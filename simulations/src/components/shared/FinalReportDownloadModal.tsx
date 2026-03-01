'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Check, Loader2 } from 'lucide-react';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { FinalReportData, downloadFinalReportPdf } from '@/utils/final-report-utils';

interface FinalReportDownloadModalProps {
  open: boolean;
  onClose: () => void;
  // Option 1: Pass data directly (for students who already have it)
  reportData?: FinalReportData;
  // Option 2: Pass IDs to fetch (for instructors)
  studentId?: string | null;
  caseStudyId?: string;
}

export default function FinalReportDownloadModal({ open, onClose, reportData: providedReportData, studentId, caseStudyId }: FinalReportDownloadModalProps) {
  const [includePrompt, setIncludePrompt] = useState(true);
  const [includeResponse, setIncludeResponse] = useState(true);

  // Only fetch if we don't have provided data and have the required IDs
  const shouldFetch = !providedReportData && studentId && caseStudyId;

  const {
    data: fetchedReportData,
    loading,
    reFetchData,
  } = useFetchData<FinalReportData>(
    shouldFetch ? `/api/instructor/students/${studentId}/final-report/${caseStudyId}` : '',
    { skipInitialFetch: true },
    'Failed to load report data'
  );

  // Trigger fetch when modal opens (only if we need to fetch)
  useEffect(() => {
    if (open && shouldFetch) {
      reFetchData();
    }
  }, [open, shouldFetch, reFetchData]);

  // Use provided data or fetched data
  const reportData = providedReportData || fetchedReportData;
  const isLoading = shouldFetch && loading;

  const canExport = (includePrompt || includeResponse) && reportData;

  const handleExport = () => {
    if (!canExport || !reportData) return;

    downloadFinalReportPdf(reportData, {
      includePrompt,
      includeResponse,
    });

    onClose();
  };

  return (
    <FullPageModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Export Final Report</span>
        </div>
      }
    >
      <div className="flex justify-center">
        <div className="w-80 space-y-6 pb-4 pt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-3" />
              <p className="text-gray-600">Loading report data...</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-700 mb-4 text-center text-sm">Select what to include in your PDF export:</p>

                <div className="space-y-3">
                  {/* Include Prompt Checkbox */}
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div
                      onClick={() => setIncludePrompt(!includePrompt)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                        includePrompt ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white group-hover:border-blue-400'
                      }`}
                    >
                      {includePrompt && <Check className="h-4 w-4" />}
                    </div>
                    <span className="text-gray-900 font-medium">Include Prompt</span>
                  </label>

                  {/* Include Response Checkbox */}
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div
                      onClick={() => setIncludeResponse(!includeResponse)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                        includeResponse ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white group-hover:border-blue-400'
                      }`}
                    >
                      {includeResponse && <Check className="h-4 w-4" />}
                    </div>
                    <span className="text-gray-900 font-medium">Include Response</span>
                  </label>
                </div>

                {!includePrompt && !includeResponse && <p className="text-red-500 text-sm mt-4 text-center">Please select at least one option to export.</p>}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleExport}
                  disabled={!canExport}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                >
                  <Download className="h-5 w-5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </FullPageModal>
  );
}
