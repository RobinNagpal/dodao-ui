'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import type { ExerciseAttempt } from '@prisma/client';
import { Send, RotateCcw, CheckCircle, AlertCircle, Brain, Clock, MessageSquare, Eye, Sparkles, Zap, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseMarkdown } from '@/utils/parse-markdown';
import AttemptDetailModal from '@/components/student/AttemptDetailModal';
import StudentNavbar from '@/components/navigation/StudentNavbar';
import ViewAiResponseModal from '@/components/student/ViewAiResponseModal';
import StudentProgressStepper, { ProgressData, ModuleProgress, ExerciseProgress } from '@/components/student/StudentProgressStepper';

interface StudentExerciseClientProps {
  exerciseId: string;
  moduleId?: string;
  caseStudyId?: string;
}

interface ContextData {
  caseStudy: {
    title: string;
    shortDescription: string;
    details: string;
  };
  module: {
    title: string;
    shortDescription: string;
    details: string;
  };
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

// Using imported types from StudentProgressStepper

export default function StudentExerciseClient({ exerciseId, moduleId, caseStudyId }: StudentExerciseClientProps) {
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
  const [showAiResponseModal, setShowAiResponseModal] = useState(false);
  const [currentAiResponse, setCurrentAiResponse] = useState<string>('');
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);

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

  // API hook to fetch progress data for vertical stepper
  const { data: progressData, loading: loadingProgress } = useFetchData<ProgressData>(
    `/api/student/exercises/${exerciseId}/progress?studentEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !exerciseId || !userEmail },
    'Failed to load progress data'
  );

  // API hooks for creating and updating attempts
  const { postData: createAttempt, loading: submittingAttempt } = usePostData<CreateAttemptResponse, CreateAttemptRequest>({
    successMessage: 'Response generated successfully!',
    errorMessage: 'Failed to generate AI response. Please try again.',
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
      });

      if (result) {
        // Clear the prompt, reset retry state, and refetch attempts
        setPrompt('');
        setShowRetryPrompt(false);
        await refetchAttempts();

        // Show AI response in modal if successful
        if (result.attempt.promptResponse) {
          setCurrentAiResponse(result.attempt.promptResponse);
          setShowAiResponseModal(true);
        }
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
      // Case study is complete, navigate to final summary
      router.push(`/student/final-summary/${nextExerciseData.caseStudyId}`);
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

    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
    const hasSuccess = attempts.some((attempt) => attempt.status === 'completed' && attempt.promptResponse);

    // Don't show prompt input if student has successful attempt and hasn't clicked retry
    if (hasSuccess && completedAttempts.length < 3 && !showRetryPrompt && !submittingAttempt) {
      return false;
    }

    // Show prompt input in these cases:
    // 1. No attempts yet
    // 2. No successful attempts yet (failed attempts only)
    // 3. All attempts used
    // 4. Currently submitting
    // 5. User explicitly clicked retry
    return !hasMovedToNext && (completedAttempts.length < 3 || submittingAttempt || showRetryPrompt);
  };

  const shouldShowAllAttemptsUsed = () => {
    if (!attempts) return false;

    // Only show "All Attempts Used" when we have completed 3 attempts AND we're not currently submitting
    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

    return !hasMovedToNext && completedAttempts.length >= 3 && !submittingAttempt;
  };

  const addCaseStudyContext = () => {
    if (!contextData?.caseStudy) return;

    const context = `Case Study: ${contextData.caseStudy.title}
Description: ${contextData.caseStudy.shortDescription}
Details: ${contextData.caseStudy.details}

`;

    setPrompt((prev) => prev + context);
  };

  const addModuleContext = () => {
    if (!contextData?.module) return;

    const context = `Module: ${contextData.module.title}
Description: ${contextData.module.shortDescription}
Details: ${contextData.module.details}

`;

    setPrompt((prev) => prev + context);
  };

  const shouldShowSuccessStateWithRetry = () => {
    if (!attempts || hasMovedToNext || submittingAttempt || showRetryPrompt) return false;

    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
    const hasSuccess = attempts.some((attempt) => attempt.status === 'completed' && attempt.promptResponse);

    // Show success state with retry option when:
    // 1. Has at least one successful attempt
    // 2. Haven't used all 3 attempts yet
    // 3. Not currently submitting or in retry mode
    return hasSuccess && completedAttempts.length < 3;
  };

  if (isLoading || loadingAttempts || loadingContext || loadingExercise || loadingNextExercise || loadingProgress) {
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
        <div className="mb-6 flex items-center space-x-3">
          {caseStudyId && (
            <Button
              onClick={() => router.push(`/student/case-study/${caseStudyId}`)}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main Page
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Exercise Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Exercise Details */}
            {exerciseData && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
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
              {shouldShowPromptInput() && (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <div className="bg-gradient-to-br from-green-500 to-teal-600 p-2 rounded-xl mr-3">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Your Prompt
                    <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
                  </h2>

                  {/* Context Badge Buttons */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 font-medium">Add context:</span>
                    <button
                      onClick={addCaseStudyContext}
                      disabled={!contextData?.caseStudy}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Case Study Context
                    </button>
                    <button
                      onClick={addModuleContext}
                      disabled={!contextData?.module}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Module Context
                    </button>
                  </div>
                </div>
              )}

              {shouldShowPromptInput() ? (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Write your prompt here... Ask the AI to help you analyze the case study, provide insights, or guide you through the business concepts."
                      className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-base leading-relaxed transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                </div>
              ) : shouldShowSuccessStateWithRetry() ? (
                <div className="text-center py-4">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Great work!</h3>
                  <p className="text-gray-600 mb-6 text-lg">You can continue to the next exercise or try again.</p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={handleMoveToNext}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {nextExerciseData?.isComplete ? 'Continue to Summary' : 'Next Exercise'}
                    </button>
                    <button
                      onClick={() => setShowRetryPrompt(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Attempt Again
                    </button>
                  </div>
                </div>
              ) : shouldShowAllAttemptsUsed() ? (
                <div className="text-center py-4">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">All Attempts Completed</h3>
                  <p className="text-gray-600 mb-6 text-lg">You have used all 3 attempts for this exercise.</p>
                  {!hasMovedToNext && !submittingAttempt && (
                    <button
                      onClick={handleMoveToNext}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {nextExerciseData?.isComplete ? 'Continue to Summary' : 'Continue to Next Exercise'}
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {/* Attempt Rows */}
            {attempts && attempts.length > 0 && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    Your Attempts
                  </h2>
                  <div className="text-sm text-gray-600">
                    Remaining Attempts:{' '}
                    <span className="font-bold text-blue-600">
                      {Math.max(0, 3 - attempts.filter((a) => a.status === 'completed' || a.status === 'failed').length)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {attempts.map((attempt, index) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Attempt {attempt.attemptNumber}</span>
                          <div className="flex items-center space-x-1">
                            {getAttemptStatusIcon(attempt)}
                            <span
                              className={`text-sm font-medium ${
                                attempt.status === 'completed' ? 'text-green-600' : attempt.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                              }`}
                            >
                              {getAttemptStatusText(attempt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(attempt.createdAt).toLocaleDateString()} at {new Date(attempt.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openAttemptModal(attempt)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vertical Progress Stepper */}
          <div className="lg:col-span-1">{progressData && <StudentProgressStepper progressData={progressData} />}</div>
        </div>
      </div>

      {/* Attempt Detail Modal */}
      <AttemptDetailModal isOpen={isAttemptModalOpen} onClose={closeAttemptModal} attempt={selectedAttempt} />

      {/* AI Response Modal */}
      <ViewAiResponseModal open={showAiResponseModal} onClose={() => setShowAiResponseModal(false)} aiResponse={currentAiResponse} />
    </div>
  );
}
