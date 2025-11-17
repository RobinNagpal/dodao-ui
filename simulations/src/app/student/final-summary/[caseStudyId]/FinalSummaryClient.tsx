'use client';

import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { FileText, Download } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import StudentNavbar from '@/components/navigation/StudentNavbar';
import BackButton from '@/components/navigation/BackButton';
import StudentLoading from '@/components/student/StudentLoading';
import { SimulationSession } from '@/types/user';
import { FinalSummaryResponse } from '@/types/api';

interface FinalSummaryClientProps {
  caseStudyId: string;
}

export default function FinalSummaryClient({ caseStudyId }: FinalSummaryClientProps) {
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const { data: summaryData, loading: loadingSummary } = useFetchData<FinalSummaryResponse>(
    `/api/student/final-summary/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load final summary'
  );

  const handleDownloadPdf = () => {
    if (!summaryData || !session) return;

    // Build the summary content
    let content = `<h1>${summaryData.caseStudy.title}</h1>\n\n`;

    summaryData.modules.forEach((module, moduleIndex) => {
      content += `<h2>${module.title}</h2>\n\n`;

      module.exercises.forEach((exercise, exerciseIndex) => {
        content += `<h3>${exercise.title}</h3>\n\n`;

        if (exercise.selectedAttempt?.promptResponse) {
          content += `${exercise.selectedAttempt.promptResponse}\n\n`;
        }
      });
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Your Final Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              h1 { color: #2563eb; font-size: 2em; margin-bottom: 20px; }
              h2 { color: #2563eb; font-size: 1.5em; margin-top: 30px; margin-bottom: 15px; }
              h3 { color: #2563eb; font-size: 1.2em; margin-top: 20px; margin-bottom: 10px; }
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
              <h1>Case Study Final Report</h1>
              <p>Student Email: ${session.email || 'N/A'}</p>
              <p>Downloaded on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              ${parseMarkdown(content)}
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
  };

  if (!session || loadingSummary) {
    return <StudentLoading text="Loading Final Summary" subtitle="Preparing your case study summary..." variant="enhanced" />;
  }

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
            <p className="text-gray-600 text-base">View your selected answers and solutions for each exercise</p>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
            <div className="prose prose-lg max-w-none">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 m-0">{summaryData.caseStudy.title}</h1>
                <button
                  onClick={handleDownloadPdf}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download PDF</span>
                </button>
              </div>

              {summaryData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">{module.title}</h2>

                  {module.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="mb-6">
                      <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">{exercise.title}</h3>

                      {exercise.selectedAttempt?.promptResponse ? (
                        <div
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.selectedAttempt.promptResponse) }}
                        />
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
