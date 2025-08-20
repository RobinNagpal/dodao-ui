'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import type { ExerciseAttempt } from '@prisma/client';
import { BookOpen, Send, RotateCcw, CheckCircle, AlertCircle, Brain, Clock, MessageSquare, Eye, Sparkles, Zap, Target } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import AttemptDetailModal from '@/components/student/AttemptDetailModal';
import StudentNavbar from '@/components/navigation/StudentNavbar';

interface StudentExerciseClientProps {
  exerciseId: string;
  moduleId?: string;
  caseStudyId?: string;
}

interface ContextData {
  caseStudyContext: string;
  previousAttempts: string[];
}

interface ExerciseData {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  module: {
    orderNumber: number;
  };
}

interface CreateAttemptRequest {
  prompt: string;
  studentEmail: string;
  caseStudyContext: string;
  previousAttempts: string[];
}

interface CreateAttemptResponse {
  attempt: ExerciseAttempt;
}

interface UpdateAttemptRequest {
  attemptId: string;
  updatedResponse: string;
  studentEmail: string;
}

interface NextExerciseResponse {
  nextExerciseId?: string;
  nextModuleId?: string;
  caseStudyId?: string;
  isComplete: boolean;
  message: string;
}

export default function StudentExerciseClient({ exerciseId, moduleId, caseStudyId }: StudentExerciseClientProps) {
  // const [userEmail, setUserEmail] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_email') || '';
    }
    return '';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState<string>('');
  const [currentAttemptNumber, setCurrentAttemptNumber] = useState<number>(1);
  const [hasMovedToNext, setHasMovedToNext] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<ExerciseAttempt | null>(null);
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);

  const router = useRouter();

  // API hook to fetch exercise attempts
  const {
    data: attempts,
    loading: loadingAttempts,
    reFetchData: refetchAttempts,
  } = useFetchData<ExerciseAttempt[]>(
    `/api/student/exercises/${exerciseId}/attempts?studentEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !exerciseId || !userEmail },
    'Failed to load exercise attempts'
  );

  // API hook to fetch context for AI
  const { data: contextData, loading: loadingContext } = useFetchData<ContextData>(
    `/api/student/exercises/${exerciseId}/context?studentEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !exerciseId || !userEmail },
    'Failed to load exercise context'
  );

  // API hook to fetch exercise details
  const { data: exerciseData, loading: loadingExercise } = useFetchData<ExerciseData>(
    `/api/student/exercises/${exerciseId}?studentEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !exerciseId || !userEmail },
    'Failed to load exercise details'
  );

  // API hook to fetch next exercise info
  const { data: nextExerciseData, loading: loadingNextExercise } = useFetchData<NextExerciseResponse>(
    `/api/student/exercises/${exerciseId}/next-exercise?studentEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !exerciseId || !userEmail },
    'Failed to load next exercise info'
  );

  // API hooks for creating and updating attempts
  const { postData: createAttempt, loading: submittingAttempt } = usePostData<CreateAttemptResponse, CreateAttemptRequest>({
    successMessage: 'Response generated successfully!',
    errorMessage: 'Failed to generate AI response. Please try again.',
  });

  const { putData: updateAttempt, loading: updatingAttempt } = usePutData<ExerciseAttempt, UpdateAttemptRequest>({
    successMessage: 'Response updated successfully!',
    errorMessage: 'Failed to update response. Please try again.',
  });

  // Then in useEffect, just handle the authentication check
  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'student' || !email) {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (attempts) {
      // Show current attempt number based on completed attempts
      // When submitting a new attempt, don't count it until it's actually completed
      // This prevents showing "All attempts used" while waiting for AI response
      const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

      if (submittingAttempt) {
        // If we're currently submitting, show the attempt we're working on
        setCurrentAttemptNumber(completedAttempts.length + 1);
      } else {
        // If not submitting, show next available attempt number
        const currentNumber = completedAttempts.length >= 3 ? 3 : completedAttempts.length + 1;
        setCurrentAttemptNumber(currentNumber);
      }
    }
  }, [attempts, submittingAttempt]);

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || submittingAttempt || (attempts && attempts.length >= 3)) {
      return;
    }

    try {
      const result = await createAttempt(`/api/student/exercises/${exerciseId}/attempts`, {
        prompt: prompt.trim(),
        studentEmail: userEmail,
        caseStudyContext: contextData?.caseStudyContext || '',
        previousAttempts: contextData?.previousAttempts || [],
      });

      if (result) {
        // Clear the prompt and refetch attempts
        setPrompt('');
        await refetchAttempts();
      }
    } catch (error) {
      console.error('Error submitting prompt:', error);
      // Error handling is done by the usePostData hook
    }
  };

  const handleMoveToNext = () => {
    setHasMovedToNext(true);

    if (!nextExerciseData) {
      // Fallback to case study if no navigation data
      if (caseStudyId) {
        router.push(`/student/case-study/${caseStudyId}`);
      } else {
        router.push('/student');
      }
      return;
    }

    if (nextExerciseData.isComplete) {
      // Case study is complete, navigate to final submission
      router.push(`/student/final-submission/${nextExerciseData.caseStudyId}`);
    } else if (nextExerciseData.nextExerciseId) {
      // Navigate to next exercise
      router.push(
        `/student/exercise/${nextExerciseData.nextExerciseId}?moduleId=${nextExerciseData.nextModuleId || moduleId}&caseStudyId=${
          nextExerciseData.caseStudyId || caseStudyId
        }`
      );
    } else {
      // Fallback to case study
      if (caseStudyId) {
        router.push(`/student/case-study/${caseStudyId}`);
      } else {
        router.push('/student');
      }
    }
  };

  const openAttemptModal = (attempt: ExerciseAttempt) => {
    setSelectedAttempt(attempt);
    setIsAttemptModalOpen(true);
  };

  const closeAttemptModal = () => {
    setSelectedAttempt(null);
    setIsAttemptModalOpen(false);
  };

  const handleSaveAttemptEdit = async (attemptId: string, updatedResponse: string) => {
    try {
      const result = await updateAttempt(`/api/student/exercises/${exerciseId}/attempts/update`, {
        attemptId,
        updatedResponse,
        studentEmail: userEmail,
      });

      if (result) {
        await refetchAttempts();
      }
    } catch (error) {
      console.error('Error updating attempt:', error);
    }
  };

  const getAttemptStatusIcon = (attempt: ExerciseAttempt) => {
    if (attempt.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (attempt.status === 'failed') {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getAttemptStatusText = (attempt: ExerciseAttempt) => {
    if (attempt.status === 'completed') {
      return 'Completed';
    } else if (attempt.status === 'failed') {
      return 'Failed';
    }
    return 'Processing';
  };

  const canSubmitNewAttempt = () => {
    if (!attempts) return true;

    // Count completed attempts (completed or failed)
    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

    return !hasMovedToNext && completedAttempts.length < 3;
  };

  const shouldShowPromptInput = () => {
    if (!attempts) return true;

    // Show prompt input if we haven't completed 3 attempts OR if we're currently submitting
    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

    return !hasMovedToNext && (completedAttempts.length < 3 || submittingAttempt);
  };

  const shouldShowAllAttemptsUsed = () => {
    if (!attempts) return false;

    // Only show "All Attempts Used" when we have completed 3 attempts AND we're not currently submitting
    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

    return !hasMovedToNext && completedAttempts.length >= 3 && !submittingAttempt;
  };

  const hasSuccessfulAttempt = () => {
    return attempts && attempts.some((attempt) => attempt.status === 'completed' && attempt.promptResponse);
  };

  const latestAttempt = attempts && attempts.length > 0 ? attempts[attempts.length - 1] : null;

  if (isLoading || loadingAttempts || loadingContext || loadingExercise || loadingNextExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading AI Exercise</h3>
          <p className="text-gray-600">Preparing your interactive learning experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <StudentNavbar
        title="AI Exercise Studio"
        subtitle="Interactive Learning with AI"
        userEmail={userEmail}
        moduleNumber={exerciseData?.module?.orderNumber}
        exerciseNumber={exerciseData?.orderNumber}
        icon={<Brain className="h-8 w-8 text-white" />}
        iconColor="from-blue-500 to-purple-600"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Exercise Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exercise Context */}
            {contextData && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl mr-3">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  Exercise Context
                </h2>

                {(() => {
                  const contextLines = contextData.caseStudyContext.split('\n');
                  const caseStudyTitle = contextLines.find((line) => line.startsWith('Case Study:'))?.replace('Case Study: ', '') || '';
                  const caseStudyDesc = contextLines.find((line) => line.startsWith('Description:'))?.replace('Description: ', '') || '';
                  const moduleTitle = contextLines.find((line) => line.startsWith('Module:'))?.replace('Module: ', '') || '';
                  const moduleDesc = contextLines.find((line) => line.startsWith('Module Description:'))?.replace('Module Description: ', '') || '';

                  return (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Case Study
                        </h3>
                        <h4 className="text-gray-800 font-medium text-lg">{caseStudyTitle}</h4>
                        <p className="text-gray-600 mt-2 leading-relaxed">{caseStudyDesc}</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          Current Module
                        </h3>
                        <h4 className="text-gray-800 font-medium text-lg">{moduleTitle}</h4>
                        <p className="text-gray-600 mt-2 leading-relaxed">{moduleDesc}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Exercise Details */}
            {exerciseData && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl mr-3">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Current Exercise
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{exerciseData.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{exerciseData.shortDescription}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                      Exercise Instructions
                    </h4>
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                      <div className="markdown-body prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(exerciseData.details) }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Prompt Input */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 p-2 rounded-xl mr-3">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                Your Prompt
                <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
              </h2>

              {shouldShowPromptInput() ? (
                <div className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Write your prompt here... Ask the AI to help you analyze the case study, provide insights, or guide you through the business concepts."
                      className="w-full h-40 p-6 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-lg leading-relaxed transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      disabled={submittingAttempt}
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-400">{prompt.length > 0 && `${prompt.length} characters`}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {prompt.trim() && (
                        <button
                          onClick={() => setPrompt('')}
                          className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleSubmitPrompt}
                      disabled={!prompt.trim() || submittingAttempt || !canSubmitNewAttempt()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {submittingAttempt ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span className="font-medium">Processing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span className="font-medium">Submit Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  {hasSuccessfulAttempt() && !hasMovedToNext && !submittingAttempt && (
                    <div className="border-t border-gray-200 pt-6 mt-8">
                      <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <p className="text-gray-700 mb-4 font-medium">Great work! You can continue to the next exercise or try again.</p>
                        <button
                          onClick={handleMoveToNext}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          {nextExerciseData?.isComplete ? 'Submit Final Analysis' : 'Continue to Next Exercise'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : shouldShowAllAttemptsUsed() ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">All Attempts Completed</h3>
                  <p className="text-gray-600 mb-6 text-lg">You have used all 3 attempts for this exercise.</p>
                  {!hasMovedToNext && !submittingAttempt && (
                    <button
                      onClick={handleMoveToNext}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {nextExerciseData?.isComplete ? 'Submit Final Analysis' : 'Continue to Next Exercise'}
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {/* Enhanced AI Responses */}
            {(latestAttempt && latestAttempt.promptResponse) || submittingAttempt ? (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl mr-3">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  AI Response
                  <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
                </h2>

                {submittingAttempt ? (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-purple-600 animate-pulse" />
                        </div>
                      </div>
                      <span className="text-purple-700 font-semibold text-lg">Generating AI response...</span>
                    </div>
                    <p className="text-purple-600 text-center leading-relaxed">
                      Please wait while our AI analyzes your prompt and generates a comprehensive response.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
                    <div
                      className="markdown-body prose prose-purple prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(latestAttempt!.promptResponse!) }}
                    />
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Attempt History */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                Attempt History
              </h3>

              {attempts && attempts.length > 0 ? (
                <div className="space-y-3">
                  {attempts.map((attempt, index) => (
                    <div key={attempt.id} className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-900 bg-blue-100 px-3 py-1 rounded-full">Attempt {attempt.attemptNumber}</span>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              {getAttemptStatusIcon(attempt)}
                              <span className="text-xs text-gray-600 font-medium">{getAttemptStatusText(attempt)}</span>
                            </div>
                            <button
                              onClick={() => openAttemptModal(attempt)}
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>

                        {attempt.prompt && <p className="text-sm text-gray-600 truncate bg-gray-50 p-2 rounded-lg">{attempt.prompt}</p>}
                        <div className="text-xs text-gray-500 mt-2">{new Date(attempt.createdAt).toLocaleString()}</div>
                        {attempt.error && <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-lg">Error: {attempt.error}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">No attempts yet</p>
                </div>
              )}
            </div>

            {/* Enhanced Exercise Progress */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                Progress
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Attempts Used</span>
                    <span className="font-medium">
                      {(() => {
                        if (!attempts) return '0/3';
                        const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
                        return `${completedAttempts.length}${submittingAttempt ? ' (+1)' : ''}/3`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${(() => {
                          if (!attempts) return 0;
                          const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
                          const currentProgress = submittingAttempt ? completedAttempts.length + 0.5 : completedAttempts.length;
                          return (currentProgress / 3) * 100;
                        })()}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {attempts && attempts.length > 0 && (
                  <div className="text-sm space-y-2">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Exercise started</span>
                    </div>
                    {attempts.some((a) => a.status === 'completed') && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>AI response received</span>
                      </div>
                    )}
                    {(() => {
                      const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
                      return (
                        completedAttempts.length >= 3 && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>All attempts completed</span>
                          </div>
                        )
                      );
                    })()}
                    {submittingAttempt && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
                        <span>Generating response...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attempt Detail Modal */}
      <AttemptDetailModal
        isOpen={isAttemptModalOpen}
        onClose={closeAttemptModal}
        attempt={selectedAttempt}
        onSaveEdit={handleSaveAttemptEdit}
        isUpdating={updatingAttempt}
      />
    </div>
  );
}
