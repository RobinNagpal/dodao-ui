'use client';

import BackButton from '@/components/navigation/BackButton';
import StudentNavbar from '@/components/navigation/StudentNavbar';
import AttemptDetailModal from '@/components/shared/AttemptDetailModal';
import ViewCaseStudyInstructionsModal from '@/components/shared/ViewCaseStudyInstructionsModal';
import ViewModuleModal from '@/components/shared/ViewModuleModal';
import StudentLoading from '@/components/student/StudentLoading';
import StudentProgressStepper from '@/components/student/StudentProgressStepper';
import ViewAiResponseModal from '@/components/student/ViewAiResponseModal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CaseStudyWithRelationsForStudents, ExerciseWithAttemptsResponse, StudentNavigationData } from '@/types/api';
import { calculateNavigationData } from '@/lib/navigation-utils';
import { SimulationSession } from '@/types/user';
import { parseMarkdown } from '@/utils/parse-markdown';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { ExerciseAttempt } from '@prisma/client';
import { AlertCircle, ArrowLeft, Bot, CheckCircle, Clock, Eye, FileText, MessageSquare, Plus, RotateCcw, Send, Sparkles, Star, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface StudentExerciseClientProps {
  exerciseId: string;
  moduleId?: string;
  caseStudyId?: string;
}

interface CreateAttemptRequest {
  prompt: string;
}

interface CreateAttemptResponse {
  attempt: ExerciseAttempt;
}

interface NextExerciseResponse {
  nextExerciseId?: string;
  nextModuleId?: string;
  caseStudyId?: string;
  isComplete: boolean;
  message: string;
  previousExerciseId?: string;
  previousModuleId?: string;
  isFirstExercise: boolean;
  isNextExerciseInDifferentModule: boolean;
}

interface SelectAttemptRequest {
  attemptId: string;
}

interface SelectAttemptResponse {
  attempts: ExerciseAttempt[];
}

export default function StudentExerciseClient({ exerciseId, moduleId, caseStudyId }: StudentExerciseClientProps) {
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;
  const [prompt, setPrompt] = useState<string>('');
  const [currentAttemptNumber, setCurrentAttemptNumber] = useState<number>(1);
  const [hasMovedToNext, setHasMovedToNext] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<ExerciseAttempt | null>(null);
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);
  const [showAiResponseModal, setShowAiResponseModal] = useState(false);
  const [currentAiResponse, setCurrentAiResponse] = useState<string>('');
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simple auto-expand function - just resize with max height
  const autoExpandTextarea = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;

      // Simple approach: reset height and set to scrollHeight with max height of 800px
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 160), 800)}px`;
    }
  };

  const router = useRouter();

  // Fetch exercise data with attempts
  const { data: exerciseData, loading: loadingExercise } = useFetchData<ExerciseWithAttemptsResponse>(
    `${getBaseUrl()}/api/case-studies/${caseStudyId}/case-study-modules/${moduleId}/exercises/${exerciseId}`,
    { skipInitialFetch: !exerciseId || !session || !caseStudyId || !moduleId },
    'Failed to load exercise data'
  );

  // Fetch case study data for navigation and progress
  const { data: caseStudyData, loading: loadingCaseStudy } = useFetchData<CaseStudyWithRelationsForStudents>(
    `${getBaseUrl()}/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load case study data'
  );

  // Local state to override fetched attempts when we have fresher data
  const [localAttempts, setLocalAttempts] = useState<ExerciseAttempt[] | null>(null);

  // Use local attempts if available, otherwise use fetched attempts from exercise data
  const currentAttempts = localAttempts || exerciseData?.attempts;

  // Reset local attempts when exercise data changes (for initial load)
  useEffect(() => {
    if (exerciseData?.attempts && !localAttempts) {
      setLocalAttempts(exerciseData.attempts);
    }
  }, [exerciseData?.attempts, localAttempts]);

  // Calculate navigation data using the utility function
  const navigationData = useMemo(() => calculateNavigationData(caseStudyData, moduleId, exerciseId), [caseStudyData, moduleId, exerciseId]);

  // Get current module data for context
  const currentModule = caseStudyData?.modules?.find((m) => m.id === moduleId);

  const { postData: createAttempt, loading: submittingAttempt } = usePostData<CreateAttemptResponse, CreateAttemptRequest>({
    successMessage: 'Response generated successfully!',
    errorMessage: 'Failed to generate AI response. Please try again.',
  });

  const { postData: selectAttempt, loading: selectingAttempt } = usePostData<SelectAttemptResponse, SelectAttemptRequest>({
    successMessage: 'Attempt selected for summary!',
    errorMessage: 'Failed to select attempt. Please try again.',
  });

  useEffect(() => {
    if (currentAttempts) {
      const completedAttempts = currentAttempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

      if (submittingAttempt) {
        setCurrentAttemptNumber(completedAttempts.length + 1);
      } else {
        const currentNumber = completedAttempts.length >= 3 ? 3 : completedAttempts.length + 1;
        setCurrentAttemptNumber(currentNumber);
      }
    }
  }, [currentAttempts, submittingAttempt]);

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || submittingAttempt || (currentAttempts && currentAttempts.length >= 3)) {
      return;
    }

    try {
      const result = await createAttempt(`/api/student/exercises/${exerciseId}/attempts`, {
        prompt: prompt.trim(),
      });

      if (result) {
        setPrompt('');
        setShowRetryPrompt(false);
        setShowConfirmationModal(false);

        // Update local attempts with the new attempt instead of refetching
        if (currentAttempts) {
          setLocalAttempts([...currentAttempts, result.attempt]);
        } else {
          setLocalAttempts([result.attempt]);
        }

        if (result.attempt.promptResponse) {
          setCurrentAiResponse(result.attempt.promptResponse);
          setShowAiResponseModal(true);
        }
      }
    } catch (error) {
      console.error('Error submitting prompt:', error);
    }
  };

  const handleSubmitClick = () => {
    if (!prompt.trim() || submittingAttempt || (currentAttempts && currentAttempts.length >= 3)) {
      return;
    }
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = () => {
    handleSubmitPrompt();
  };

  const handleMoveToNext = () => {
    setHasMovedToNext(true);

    if (!navigationData) {
      if (caseStudyId) {
        router.push(`/student/case-study/${caseStudyId}`);
      } else {
        router.push('/student');
      }
      return;
    }

    if (navigationData.isComplete) {
      router.push(`/student/final-summary/${navigationData.caseStudyId}`);
    } else if (navigationData.nextExerciseId) {
      router.push(
        `/student/exercise/${navigationData.nextExerciseId}?moduleId=${navigationData.nextModuleId || moduleId}&caseStudyId=${
          navigationData.caseStudyId || caseStudyId
        }`
      );
    } else {
      if (caseStudyId) {
        router.push(`/student/case-study/${caseStudyId}`);
      } else {
        router.push('/student');
      }
    }
  };

  const handleMoveToPrevious = () => {
    if (!navigationData || !navigationData.previousExerciseId) {
      return;
    }

    router.push(
      `/student/exercise/${navigationData.previousExerciseId}?moduleId=${navigationData.previousModuleId || moduleId}&caseStudyId=${
        navigationData.caseStudyId || caseStudyId
      }`
    );
  };

  const handleSelectAttempt = useCallback(
    async (attemptId: string) => {
      if (selectingAttempt) return;

      try {
        const result = await selectAttempt(`${getBaseUrl()}/api/student/exercises/${exerciseId}/attempts/select`, {
          attemptId,
        });

        if (result) {
          // Update local attempts with the result instead of refetching
          setLocalAttempts(result.attempts);
        }
      } catch (error) {
        console.error('Error selecting attempt:', error);
      }
    },
    [selectingAttempt, selectAttempt, exerciseId]
  );

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

  const getRemainingAttempts = () => {
    if (!currentAttempts) return 3;
    const completedAttempts = currentAttempts.filter((a) => a.status === 'completed' || a.status === 'failed');
    return Math.max(0, 3 - completedAttempts.length);
  };

  const canSubmitNewAttempt = () => {
    if (!currentAttempts) return true;

    const completedAttempts = currentAttempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

    return !hasMovedToNext && completedAttempts.length < 3;
  };

  const shouldShowPromptInput = () => {
    if (!currentAttempts) return true;

    const completedAttempts = currentAttempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
    const hasSuccess = currentAttempts.some((attempt) => attempt.status === 'completed' && attempt.promptResponse);

    if (hasSuccess && completedAttempts.length < 3 && !showRetryPrompt && !submittingAttempt) {
      return false;
    }

    return !hasMovedToNext && (completedAttempts.length < 3 || submittingAttempt || showRetryPrompt);
  };

  const shouldShowAllAttemptsUsed = () => {
    if (!currentAttempts) return false;

    const completedAttempts = currentAttempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

    return !hasMovedToNext && completedAttempts.length >= 3 && !submittingAttempt;
  };

  const handleOpenCaseStudyModal = () => {
    setShowCaseStudyModal(true);
  };

  const handleCloseCaseStudyModal = () => {
    setShowCaseStudyModal(false);
  };

  const handleOpenModuleModal = () => {
    setShowModuleModal(true);
  };

  const handleCloseModuleModal = () => {
    setShowModuleModal(false);
  };

  const shouldShowSuccessStateWithRetry = () => {
    if (!currentAttempts || hasMovedToNext || submittingAttempt || showRetryPrompt) return false;

    const completedAttempts = currentAttempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
    const hasSuccess = currentAttempts.some((attempt) => attempt.status === 'completed' && attempt.promptResponse);

    return hasSuccess && completedAttempts.length < 3;
  };

  if (loadingExercise || loadingCaseStudy) {
    return <StudentLoading text="Loading AI Exercise" subtitle="Preparing your interactive learning experience..." variant="enhanced" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <StudentNavbar
        title="AI Exercise Studio"
        subtitle="Interactive Learning with AI"
        userEmail={session?.email || session?.username}
        moduleNumber={currentModule?.orderNumber}
        exerciseNumber={exerciseData?.orderNumber}
        icon={<Bot className="h-8 w-8 text-white" />}
        iconColor="from-blue-500 to-purple-600"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <BackButton userType="student" text="Back to Main Page" href={`/student/case-study/${caseStudyId}`} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {exerciseData && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{exerciseData.title}</h3>
                    </div>

                    <div className="flex items-center space-x-3 ml-4">
                      <button
                        onClick={handleOpenCaseStudyModal}
                        disabled={!caseStudyData}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Case Study Details"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Case Study Details
                      </button>
                      <button
                        onClick={handleOpenModuleModal}
                        disabled={!currentModule}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Module Details"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Module Details
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                    Exercise Details:
                  </h4>
                  <div className="markdown-body prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(exerciseData.details) }} />

                  {exerciseData.promptHint && (
                    <div className="pt-6">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="prompt-hint" className="border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center text-left">
                              <FileText className="h-5 w-5 text-blue-500 mr-2" />
                              <span className="font-semibold text-gray-900">Prompt Hint</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <div
                              className="markdown-body prose prose-lg max-w-none"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(exerciseData.promptHint) }}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                </div>
              )}

              {shouldShowPromptInput() ? (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                      }}
                      onInput={() => {
                        // Simple auto-expand on input
                        autoExpandTextarea();
                      }}
                      placeholder="Write your prompt here... Ask the AI to help you analyze the case study, provide insights, or guide you through the business concepts."
                      className="w-full min-h-[160px] max-h-[800px] p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-base leading-relaxed transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-y-auto"
                      disabled={submittingAttempt}
                      style={{ height: '160px' }} // Initial height
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-400">{prompt.length > 0 && `${prompt.length} characters`}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {!navigationData?.isFirstExercise && (
                        <button
                          onClick={handleMoveToPrevious}
                          className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Previous Exercise</span>
                        </button>
                      )}
                      {prompt.trim() && (
                        <button
                          onClick={() => {
                            setPrompt('');
                            // Reset textarea height to default after clearing
                            setTimeout(() => autoExpandTextarea(), 0);
                          }}
                          className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleSubmitClick}
                      disabled={!prompt.trim() || submittingAttempt || !canSubmitNewAttempt()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Great work!</h3>
                  <p className="text-gray-600 mb-4 text-base">You can continue to the next exercise or try again.</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-start">
                      {!navigationData?.isFirstExercise && (
                        <button
                          onClick={handleMoveToPrevious}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                        >
                          <ArrowLeft className="h-5 w-5" />
                          <span>Previous Exercise</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={handleMoveToNext}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {navigationData?.isComplete ? 'Continue to Report' : navigationData?.isNextExerciseInDifferentModule ? 'Next Module' : 'Next Exercise'}
                      </button>
                      <button
                        onClick={() => setShowRetryPrompt(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2  rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Attempt Again
                      </button>
                    </div>
                    <div className="flex-1"></div>
                  </div>
                </div>
              ) : shouldShowAllAttemptsUsed() ? (
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">All Attempts Completed</h3>
                  <p className="text-gray-600 mb-4 text-base">You have used all 3 attempts for this exercise.</p>
                  {!hasMovedToNext && !submittingAttempt && (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex justify-start">
                        {!navigationData?.isFirstExercise && (
                          <button
                            onClick={handleMoveToPrevious}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                          >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Previous Exercise</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          onClick={handleMoveToNext}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          {navigationData?.isComplete
                            ? 'Continue to Report'
                            : navigationData?.isNextExerciseInDifferentModule
                            ? 'Next Module'
                            : 'Continue to Next Exercise'}
                        </button>
                      </div>
                      <div className="flex-1"></div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {currentAttempts && currentAttempts.length > 0 && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    Your Attempts
                  </h2>
                  <div className="text-sm text-gray-600">
                    Remaining Attempts: <span className="font-bold text-blue-600">{getRemainingAttempts()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentAttempts.map((attempt, index) => (
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
                        {attempt.status === 'completed' && attempt.promptResponse && (
                          <button
                            onClick={() => handleSelectAttempt(attempt.id)}
                            disabled={selectingAttempt}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                              attempt.selectedForSummary
                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-2 border-yellow-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:border-gray-300'
                            } ${selectingAttempt ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Star className={`h-4 w-4 ${attempt.selectedForSummary ? 'fill-current text-yellow-500' : ''}`} />

                            <span>{attempt.selectedForSummary ? 'Selected for Final Report' : 'Select for Final Report'}</span>
                          </button>
                        )}
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

          <div className="lg:col-span-1">
            {caseStudyData && (
              <StudentProgressStepper
                progressData={{
                  caseStudyId: caseStudyData.id,
                  currentModuleId: moduleId || '',
                  currentExerciseId: exerciseId,
                  modules: caseStudyData.modules || [],
                }}
              />
            )}
          </div>
        </div>
      </div>

      <AttemptDetailModal isOpen={isAttemptModalOpen} onClose={closeAttemptModal} attempt={selectedAttempt} />

      <ViewAiResponseModal open={showAiResponseModal} onClose={() => setShowAiResponseModal(false)} aiResponse={currentAiResponse} />

      <ConfirmationModal
        open={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSubmit}
        confirming={submittingAttempt}
        title="Submit Prompt Confirmation"
        content={
          <div className="mb-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-700">Have you added all necessary context (Case Study and Module details)?</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-700">Have you reviewed the prompt hint provided above for guidance?</span>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4 italic">Adding context helps the AI provide more relevant and accurate responses for this exercise.</p>
          </div>
        }
        askForTextInput={false}
        showSemiTransparentBg={true}
      />

      {caseStudyData && currentModule && (
        <ViewModuleModal
          open={showModuleModal}
          onClose={handleCloseModuleModal}
          selectedModule={currentModule as unknown as import('@prisma/client').CaseStudyModule}
          hasModuleInstructionsRead={() => true}
          handleMarkInstructionAsRead={async () => {}}
          updatingStatus={true}
          caseStudy={caseStudyData}
          onModuleUpdate={(updatedModule) => {
            // Students don't edit, so this should not be called
            console.log('Student tried to update module - this should not happen');
          }}
        />
      )}

      {caseStudyData && (
        <ViewCaseStudyInstructionsModal
          open={showCaseStudyModal}
          onClose={handleCloseCaseStudyModal}
          caseStudy={caseStudyData}
          hasCaseStudyInstructionsRead={() => true}
          handleMarkInstructionAsRead={async () => {}}
          updatingStatus={true}
          onCaseStudyUpdate={(updatedCaseStudy) => {
            // Students don't edit, so this should not be called
            console.log('Student tried to update case study - this should not happen');
          }}
        />
      )}
    </div>
  );
}
