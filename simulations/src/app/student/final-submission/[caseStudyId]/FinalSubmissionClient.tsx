'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import StudentLoading from '@/components/student/StudentLoading';
import { FileText, Send, CheckCircle, Brain, Sparkles, Target, BookOpen, Save } from 'lucide-react';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import { CaseStudyWithRelationsForStudents } from '@/types/api';
import { SimulationSession } from '@/types/user';
import StudentNavbar from '@/components/navigation/StudentNavbar';

interface FinalSubmissionClientProps {
  caseStudyId: string;
}

interface FinalSubmissionData {
  id: string;
  finalContent: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateFinalSubmissionRequest {
  caseStudyId: string;
  finalContent: string;
  studentEmail: string;
}

export default function FinalSubmissionClient({ caseStudyId }: FinalSubmissionClientProps) {
  const [finalContent, setFinalContent] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const router = useRouter();
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const { data: caseStudyData, loading: loadingCaseStudy } = useFetchData<CaseStudyWithRelationsForStudents>(
    `/api/student/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load case study details'
  );

  const {
    data: existingSubmission,
    loading: loadingSubmission,
    reFetchData: refetchSubmission,
  } = useFetchData<FinalSubmissionData>(
    `/api/student/final-submission?caseStudyId=${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load existing submission'
  );

  const { postData: submitFinalSubmission, loading: submittingSubmission } = usePostData<FinalSubmissionData, CreateFinalSubmissionRequest>({
    successMessage: 'Final submission saved successfully!',
    errorMessage: 'Failed to save final submission. Please try again.',
  });

  useEffect(() => {
    if (existingSubmission) {
      setFinalContent(existingSubmission.finalContent);
      setIsSubmitted(true);
    }
  }, [existingSubmission]);

  const handleSubmit = async () => {
    if (!finalContent.trim() || submittingSubmission || !session) {
      return;
    }

    try {
      const result = await submitFinalSubmission('/api/student/final-submission', {
        caseStudyId,
        finalContent: finalContent.trim(),
        studentEmail: session.email || '',
      });

      if (result) {
        setIsSubmitted(true);
        await refetchSubmission();
      }
    } catch (error) {
      console.error('Error submitting final submission:', error);
    }
  };

  const handleContinueToStudentHome = () => {
    router.push('/student');
  };

  if (!session || loadingCaseStudy || loadingSubmission) {
    return <StudentLoading text="Loading Final Submission" subtitle="Preparing your submission workspace..." variant="enhanced" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <StudentNavbar
        title="Final Submission"
        subtitle="Deliver Your Final Analysis"
        userEmail={session?.email || ''}
        icon={<FileText className="h-8 w-8 text-white" />}
        iconColor="from-green-500 to-emerald-600"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {caseStudyData && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl mr-3">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  Case Study Overview
                </h2>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{caseStudyData.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-4">{caseStudyData.shortDescription}</p>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Subject: {caseStudyData.subject}</span>
                      <span>•</span>
                      <span>{caseStudyData.modules?.length || 0} Modules</span>
                      <span>•</span>
                      <span>{caseStudyData.modules?.reduce((total, module) => total + (module.exercises?.length || 0), 0) || 0} Exercises</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 p-2 rounded-xl mr-3">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                Your Final Analysis
                <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
              </h2>

              <MarkdownEditor objectId={`final-submission-${caseStudyId}`} modelValue={finalContent} onUpdate={setFinalContent} maxHeight={500} label="" />

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  {isSubmitted && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Submission saved</span>
                      {existingSubmission && <span className="text-gray-500">• Last updated: {new Date(existingSubmission.updatedAt).toLocaleString()}</span>}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!finalContent.trim() || submittingSubmission}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {submittingSubmission ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span className="font-medium">Saving...</span>
                    </>
                  ) : isSubmitted ? (
                    <>
                      <Save className="h-5 w-5" />
                      <span className="font-medium">Update Submission</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span className="font-medium">Submit Final Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isSubmitted && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
                <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Submission Complete!</h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Your final case study analysis has been successfully submitted. You can continue to update it if needed.
                  </p>
                  <button
                    onClick={handleContinueToStudentHome}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Return to Student Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                Submission Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Case study completed</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">All exercises finished</span>
                </div>
                <div className={`flex items-center space-x-2 ${isSubmitted ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Final submission {isSubmitted ? 'completed' : 'pending'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <div>Word count: {finalContent.split(/\s+/).filter((word) => word.length > 0).length}</div>
                  <div>Character count: {finalContent.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                Writing Tips
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Structure your analysis with clear headings and sections</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include specific examples from the case study</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Reference insights from your AI exercise responses</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Provide actionable recommendations</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use markdown formatting for better readability</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
