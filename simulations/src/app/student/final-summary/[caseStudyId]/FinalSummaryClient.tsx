'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Brain, FileText, Download, Eye, Sparkles, CheckCircle } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import StudentNavbar from '@/components/navigation/StudentNavbar';
import ViewAiResponseModal from '@/components/student/ViewAiResponseModal';
import BackButton from '@/components/navigation/BackButton';
import StudentLoading from '@/components/student/StudentLoading';
import { SimulationSession } from '@/types/user';

interface FinalSummaryClientProps {
  caseStudyId: string;
}

interface FinalSummaryData {
  id: string;
  response: string | null;
  status: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GenerateSummaryRequest {
  prompt: string;
}

interface GenerateSummaryResponse {
  summary: FinalSummaryData;
}

interface SummaryContextData {
  caseStudy: {
    title: string;
    shortDescription: string;
    details: string;
  };
  modules: Array<{
    title: string;
    shortDescription: string;
    details: string;
    exercises: Array<{
      title: string;
      shortDescription: string;
      details: string;
      attempts: Array<{
        promptResponse: string | null;
      }>;
    }>;
  }>;
  finalSummaryPromptInstructions: string | null;
  fullPrompt: string;
}

export default function FinalSummaryClient({ caseStudyId }: FinalSummaryClientProps) {
  const [showAiResponseModal, setShowAiResponseModal] = useState(false);
  const [currentAiResponse, setCurrentAiResponse] = useState<string>('');

  const router = useRouter();
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const {
    data: summaryData,
    loading: loadingSummary,
    reFetchData: refetchSummary,
  } = useFetchData<FinalSummaryData>(
    `/api/student/final-summary/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load final summary'
  );

  const { data: contextData, loading: loadingContext } = useFetchData<SummaryContextData>(
    `/api/student/final-summary/${caseStudyId}/context`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load summary context'
  );

  const { postData: generateSummary, loading: generatingSummary } = usePostData<GenerateSummaryResponse, GenerateSummaryRequest>({
    successMessage: 'Final summary generated successfully!',
    errorMessage: 'Failed to generate final summary. Please try again.',
  });

  const handleGenerateSummary = async () => {
    if (!contextData?.fullPrompt) {
      console.error('No prompt available for generation');
      return;
    }

    try {
      const result = await generateSummary(`/api/student/final-summary/${caseStudyId}/generate`, {
        prompt: contextData.fullPrompt,
      });

      if (result) {
        await refetchSummary();

        if (result.summary.response) {
          setCurrentAiResponse(result.summary.response);
          setShowAiResponseModal(true);
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleViewSummary = () => {
    if (summaryData?.response) {
      setCurrentAiResponse(summaryData.response);
      setShowAiResponseModal(true);
    }
  };

  const handleDownloadPdf = () => {
    if (summaryData?.response) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Case Study Final Summary</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1, h2, h3 { color: #2563eb; }
                .header { text-align: center; margin-bottom: 40px; }
                .content { max-width: 800px; margin: 0 auto; }
                @media print {
                  body { margin: 20px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Case Study Final Summary</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
              </div>
              <div class="content">
                ${parseMarkdown(summaryData.response)}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (!session || loadingSummary || loadingContext) {
    return <StudentLoading text="Loading Final Summary" subtitle="Preparing your case study summary..." variant="enhanced" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <StudentNavbar
        title="Final Summary"
        subtitle="Case Study Conclusion"
        userEmail={session?.email || ''}
        icon={<FileText className="h-8 w-8 text-white" />}
        iconColor="from-purple-500 to-pink-600"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <BackButton userType="student" text="Back to Case Study" href={`/student/case-study/${caseStudyId}`} />

        <div className="space-y-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Study Final Summary</h1>
            <p className="text-gray-600 text-base">Generate a comprehensive conclusion and analysis of your entire case study journey</p>
          </div>

          {contextData && (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl mr-3">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                AI Prompt Preview
                <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 max-h-96 overflow-y-auto">
                <div className="markdown-body prose prose-lg max-w-none text-sm" dangerouslySetInnerHTML={{ __html: parseMarkdown(contextData.fullPrompt) }} />
              </div>
            </div>
          )}

          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
            {!summaryData || summaryData.status === 'failed' ? (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Generate Your Final Summary</h3>
                <p className="text-gray-600 mb-8 text-base">Click below to generate a comprehensive AI-powered summary of your case study analysis</p>
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary || !contextData?.fullPrompt}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mx-auto"
                >
                  {generatingSummary ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span className="font-medium text-lg">Generating Summary...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-6 w-6" />
                      <span className="font-medium text-lg">Generate Final Summary</span>
                    </>
                  )}
                </button>
                {summaryData?.status === 'failed' && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">Previous generation failed: {summaryData.error}</p>
                  </div>
                )}
              </div>
            ) : summaryData.status === 'completed' && summaryData.response ? (
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Summary Generated Successfully!</h3>
                <p className="text-gray-600 mb-8 text-base">Your comprehensive case study summary is ready to view</p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handleViewSummary}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                  >
                    <Eye className="h-5 w-5" />
                    <span>View Summary</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download PDF</span>
                  </button>
                </div>
                <div className="mt-6 text-sm text-gray-500">
                  Generated on {new Date(summaryData.createdAt).toLocaleDateString()} at {new Date(summaryData.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="bg-gray-200 rounded-full w-20 h-20 mx-auto mb-6"></div>
                  <div className="bg-gray-200 rounded h-6 w-48 mx-auto mb-4"></div>
                  <div className="bg-gray-200 rounded h-4 w-64 mx-auto"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ViewAiResponseModal open={showAiResponseModal} onClose={() => setShowAiResponseModal(false)} aiResponse={currentAiResponse} />
    </div>
  );
}
