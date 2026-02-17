'use client';

import { useState, useEffect } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { FileText, Download, Eye, Sparkles, CheckCircle, Bot, Save } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import StudentNavbar from '@/components/navigation/StudentNavbar';
import BackButton from '@/components/navigation/BackButton';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { FinalSummaryResponse } from '@/types/api';
import type { ReactElement } from 'react';

interface FinalSummaryClientProps {
  caseStudyId: string;
}

interface FinalSummaryData {
  id: string;
  response: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateFinalSummaryRequest {
  caseStudyId: string;
  studentEmail: string;
}

export default function FinalSummaryClient({ caseStudyId }: FinalSummaryClientProps): ReactElement | null {
  const [isSaved, setIsSaved] = useState(false);

  const { data: summaryData, loading: loadingSummary } = useFetchData<FinalSummaryResponse>(
    `/api/student/final-summary/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId },
    'Failed to load final summary'
  );

  const { session, renderAuthGuard } = useAuthGuard({
    allowedRoles: 'any',
    loadingType: 'student',
    loadingText: 'Loading Final Summary',
    loadingSubtitle: 'Preparing your case study summary...',
    additionalLoadingConditions: [loadingSummary],
  });

  const { postData: saveFinalSummary, loading: savingSummary } = usePostData<FinalSummaryData, CreateFinalSummaryRequest>({
    successMessage: 'Final summary saved successfully!',
    errorMessage: 'Failed to save final summary. Please try again.',
  });

  const handleSaveFinalSummary = async () => {
    if (!session || savingSummary) return;

    try {
      const result = await saveFinalSummary(`/api/student/final-summary/${caseStudyId}`, {
        caseStudyId,
        studentEmail: session.email || '',
      });

      if (result) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving final summary:', error);
    }
  };

  const handleDownloadPdf = () => {
    if (!summaryData || !session) return;

    // Build the summary content
    let content = `<h1>${summaryData.caseStudy.title}</h1>\n\n`;

    summaryData.modules.forEach((module, moduleIndex) => {
      content += `<h2>Module ${module.orderNumber}: ${module.title}</h2>\n\n`;

      module.exercises.forEach((exercise, exerciseIndex) => {
        content += `<h3>Exercise ${exercise.orderNumber}: ${exercise.title}</h3>\n\n`;

        if (exercise.selectedAttempt?.prompt) {
          content += `<h4>Student Prompt:</h4>\n`;
          content += `<div style="background-color: #eff6ff; padding: 15px; margin: 10px 0; border-left: 4px solid #3b82f6; border-radius: 5px;">${exercise.selectedAttempt.prompt}</div>\n\n`;
        }

        if (exercise.selectedAttempt?.promptResponse) {
          content += `<h4>Selected Response:</h4>\n`;
          content += `<div style="background-color: #f9fafb; padding: 15px; margin: 10px 0; border-left: 4px solid #6b7280; border-radius: 5px;">${exercise.selectedAttempt.promptResponse}</div>\n\n`;
        }
      });
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Case Study Final Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 12px 10px; line-height: 1.6; }
              h1 { color: #2563eb; font-size: 1.5em; margin-bottom: 15px; }
              h2 { color: #2563eb; font-size: 1.2em; margin-top: 25px; margin-bottom: 10px; }
              h3 { color: #2563eb; font-size: 1.1em; margin-top: 15px; margin-bottom: 8px; }
              .header { text-align: left; margin-bottom: 25px; }
              .student-info { margin-bottom: 5px; }
              .content { max-width: none; margin: 0; }
              @media print {
                body { margin: 10px 8px; }
                .no-print { display: none; }
                @page { margin: 12mm 10mm; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="student-info">Student: ${summaryData.student.name || summaryData.student.email || 'N/A'}</div>
              <div class="student-info">Email: ${summaryData.student.email || 'N/A'}</div>
              <div>Downloaded on ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="content">
              ${parseMarkdown(content)}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return loadingGuard as ReactElement;

  if (!summaryData || summaryData.modules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <StudentNavbar
          title="Final Summary"
          subtitle="Case Study Conclusion"
          userEmail={session?.email || ''}
          icon={<FileText className="h-8 w-8 text-white" />}
          iconColor="from-purple-500 to-pink-600"
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <BackButton userType="student" text="Back to Case Study" href={`/student/case-study/${caseStudyId}`} />
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8 text-center">
            <p className="text-gray-600 text-base">No exercises with selected attempts found. Please select your best attempts for each exercise first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <StudentNavbar
        title="Final Report"
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Final Report</h1>
            <p className="text-gray-600 text-base mb-4">This is your compiled final report with all your selected solutions for each exercise.</p>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                💡 <strong>Important:</strong> Click Save Report to store this final summary for your instructor to review. You can also download it as a PDF
                for your records.
              </p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
            <div className="prose prose-lg max-w-none">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 m-0 flex-1 min-w-0">{summaryData.caseStudy.title}</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                  <button
                    onClick={handleSaveFinalSummary}
                    disabled={savingSummary}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] whitespace-nowrap"
                  >
                    {savingSummary ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : isSaved ? (
                      <>
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 flex-shrink-0" />
                        <span>Save Report</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 min-w-[120px] whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 flex-shrink-0" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {summaryData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    Module {module.orderNumber}: {module.title}
                  </h2>

                  {module.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="mb-6">
                      <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
                        Exercise {exercise.orderNumber}: {exercise.title}
                      </h3>

                      {exercise.selectedAttempt?.prompt && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">Student Prompt:</h4>
                          <div
                            className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.selectedAttempt.prompt) }}
                          />
                        </div>
                      )}

                      {exercise.selectedAttempt?.promptResponse ? (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">Selected Response:</h4>
                          <div
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.selectedAttempt.promptResponse) }}
                          />
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No selected solution available</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
