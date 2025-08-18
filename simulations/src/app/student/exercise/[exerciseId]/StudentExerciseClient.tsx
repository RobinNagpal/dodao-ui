'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import type { ExerciseAttempt } from '@prisma/client';
import { ArrowLeft, BookOpen, GraduationCap, Send, RotateCcw, CheckCircle, AlertCircle, Brain, Clock, MessageSquare, Eye, Edit3, Save, X } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';

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
  const [expandedAttempts, setExpandedAttempts] = useState<Set<string>>(new Set());
  const [editingAttempts, setEditingAttempts] = useState<Set<string>>(new Set());
  const [editedResponses, setEditedResponses] = useState<Record<string, string>>({});

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

  const handleBack = () => {
    if (caseStudyId) {
      router.push(`/student/case-study/${caseStudyId}`);
    } else {
      router.push('/student');
    }
  };

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
    // In a real implementation, you might want to mark this exercise as completed
    // and navigate to the next exercise or back to the case study
    handleBack();
  };

  const toggleAttemptExpansion = (attemptId: string) => {
    setExpandedAttempts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attemptId)) {
        newSet.delete(attemptId);
      } else {
        newSet.add(attemptId);
      }
      return newSet;
    });
  };

  const startEditingAttempt = (attemptId: string, currentResponse: string) => {
    setEditingAttempts((prev) => new Set(prev).add(attemptId));
    setEditedResponses((prev) => ({
      ...prev,
      [attemptId]: currentResponse,
    }));
  };

  const cancelEditingAttempt = (attemptId: string) => {
    setEditingAttempts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(attemptId);
      return newSet;
    });
    setEditedResponses((prev) => {
      const newResponses = { ...prev };
      delete newResponses[attemptId];
      return newResponses;
    });
  };

  const saveEditedAttempt = async (attemptId: string) => {
    const editedResponse = editedResponses[attemptId];
    if (!editedResponse) return;

    try {
      const result = await updateAttempt(`/api/student/exercises/${exerciseId}/attempts/update`, {
        attemptId,
        updatedResponse: editedResponse,
        studentEmail: userEmail,
      });

      if (result) {
        // Clear editing state
        cancelEditingAttempt(attemptId);

        // Refetch attempts to get updated data
        await refetchAttempts();
      }
    } catch (error) {
      console.error('Error updating attempt:', error);
      // Error handling is done by the usePutData hook
    }
  };

  const updateEditedResponse = (attemptId: string, newValue: string) => {
    setEditedResponses((prev) => ({
      ...prev,
      [attemptId]: newValue,
    }));
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

  if (isLoading || loadingAttempts || loadingContext || loadingExercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-900">Loading exercise...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Case Study</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Exercise</h1>
                <p className="text-gray-600">Interactive Learning with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {(() => {
                  if (!attempts) return `Next attempt: 1/3`;

                  const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');

                  if (submittingAttempt) {
                    return `Generating response... (${completedAttempts.length + 1}/3)`;
                  } else if (completedAttempts.length >= 3) {
                    return 'All 3 attempts used';
                  } else {
                    return `Next attempt: ${completedAttempts.length + 1}/3`;
                  }
                })()}
              </div>
              <div className="text-sm text-gray-500">Logged in as {userEmail}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Exercise Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exercise Context */}
            {contextData && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Exercise Context
                </h2>

                {/* Parse and extract context information */}
                {(() => {
                  const contextLines = contextData.caseStudyContext.split('\n');
                  const caseStudyTitle = contextLines.find((line) => line.startsWith('Case Study:'))?.replace('Case Study: ', '') || '';
                  const caseStudyDesc = contextLines.find((line) => line.startsWith('Description:'))?.replace('Description: ', '') || '';
                  const moduleTitle = contextLines.find((line) => line.startsWith('Module:'))?.replace('Module: ', '') || '';
                  const moduleDesc = contextLines.find((line) => line.startsWith('Module Description:'))?.replace('Module Description: ', '') || '';

                  return (
                    <div className="space-y-4">
                      {/* Case Study Info */}
                      <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Case Study</h3>
                        <h4 className="text-gray-800 font-medium">{caseStudyTitle}</h4>
                        <p className="text-sm text-gray-600 mt-1">{caseStudyDesc}</p>
                      </div>

                      {/* Module Info */}
                      <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Module</h3>
                        <h4 className="text-gray-800 font-medium">{moduleTitle}</h4>
                        <p className="text-sm text-gray-600 mt-1">{moduleDesc}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Exercise Details */}
            {exerciseData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Exercise</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{exerciseData.title}</h3>
                    <p className="text-gray-600 mt-1">{exerciseData.shortDescription}</p>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Exercise Instructions</h4>
                    <div className="markdown-body prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(exerciseData.details) }} />
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Your Prompt
              </h2>

              {shouldShowPromptInput() ? (
                <div className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Write your prompt here... Ask the AI to help you analyze the case study, provide insights, or guide you through the business concepts."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={submittingAttempt}
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">{prompt.length > 0 && `${prompt.length} characters`}</div>

                    <div className="flex items-center space-x-3">
                      {prompt.trim() && (
                        <button onClick={() => setPrompt('')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1">
                          <RotateCcw className="h-4 w-4" />
                          <span>Clear</span>
                        </button>
                      )}

                      <button
                        onClick={handleSubmitPrompt}
                        disabled={!prompt.trim() || submittingAttempt || !canSubmitNewAttempt()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingAttempt ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Show Continue button after successful attempt */}
                  {hasSuccessfulAttempt() && !hasMovedToNext && !submittingAttempt && (
                    <div className="border-t pt-4 mt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">You can continue to the next exercise or try again (up to 3 attempts total).</p>
                        <button onClick={handleMoveToNext} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          Continue to Next Exercise
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : shouldShowAllAttemptsUsed() ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Attempts Used</h3>
                  <p className="text-gray-600 mb-4">You have used all 3 attempts for this exercise.</p>
                  {!hasMovedToNext && !submittingAttempt && (
                    <button onClick={handleMoveToNext} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Continue to Next Exercise
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {/* AI Responses */}
            {(latestAttempt && latestAttempt.promptResponse) || submittingAttempt ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  AI Response
                </h2>

                {submittingAttempt ? (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span className="text-purple-700 font-medium">Generating AI response...</span>
                    </div>
                    <p className="text-sm text-purple-600 mt-2 text-center">Please wait while our AI analyzes your prompt and generates a response.</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                    <div
                      className="markdown-body prose prose-purple max-w-none"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(latestAttempt!.promptResponse!) }}
                    />
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attempt History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attempt History</h3>

              {attempts && attempts.length > 0 ? (
                <div className="space-y-3">
                  {attempts.map((attempt, index) => (
                    <div key={attempt.id} className="border border-gray-200 rounded-lg">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">Attempt {attempt.attemptNumber}</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {getAttemptStatusIcon(attempt)}
                              <span className="text-xs text-gray-600">{getAttemptStatusText(attempt)}</span>
                            </div>
                            <button
                              onClick={() => toggleAttemptExpansion(attempt.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span>{expandedAttempts.has(attempt.id) ? 'Hide' : 'View'}</span>
                            </button>
                          </div>
                        </div>

                        {attempt.prompt && <p className="text-sm text-gray-600 truncate">{attempt.prompt}</p>}
                        <div className="text-xs text-gray-500 mt-2">{new Date(attempt.createdAt).toLocaleString()}</div>
                        {attempt.error && <div className="text-xs text-red-600 mt-1">Error: {attempt.error}</div>}
                      </div>

                      {/* Expanded View */}
                      {expandedAttempts.has(attempt.id) && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* Full Prompt */}
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Your Prompt:</h5>
                              <div className="bg-white rounded-lg p-3 border">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{attempt.prompt}</p>
                              </div>
                            </div>

                            {/* AI Response */}
                            {attempt.promptResponse && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">AI Response:</h5>
                                  {attempt.status === 'completed' && !editingAttempts.has(attempt.id) && (
                                    <button
                                      onClick={() => startEditingAttempt(attempt.id, attempt.promptResponse || '')}
                                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                      <span>Edit</span>
                                    </button>
                                  )}
                                </div>

                                {editingAttempts.has(attempt.id) ? (
                                  <div className="space-y-3">
                                    <MarkdownEditor
                                      objectId={attempt.id}
                                      modelValue={editedResponses[attempt.id] || ''}
                                      onUpdate={(value) => updateEditedResponse(attempt.id, value)}
                                      placeholder="Edit the AI response..."
                                      maxHeight={300}
                                    />
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => saveEditedAttempt(attempt.id)}
                                        disabled={updatingAttempt}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
                                      >
                                        <Save className="h-3 w-3" />
                                        <span>{updatingAttempt ? 'Saving...' : 'Save'}</span>
                                      </button>
                                      <button
                                        onClick={() => cancelEditingAttempt(attempt.id)}
                                        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors flex items-center space-x-1"
                                      >
                                        <X className="h-3 w-3" />
                                        <span>Cancel</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div
                                      className="markdown-body prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{ __html: parseMarkdown(attempt.promptResponse) }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No attempts yet</p>
                </div>
              )}
            </div>

            {/* Exercise Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Attempts Used</span>
                    <span>
                      {(() => {
                        if (!attempts) return '0/3';
                        const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
                        return `${completedAttempts.length}${submittingAttempt ? ' (+1)' : ''}/3`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                  <div className="text-sm text-gray-600">
                    <p>✓ Exercise started</p>
                    {attempts.some((a) => a.status === 'completed') && <p>✓ AI response received</p>}
                    {(() => {
                      const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed' || attempt.status === 'failed');
                      return completedAttempts.length >= 3 && <p>✓ All attempts used</p>;
                    })()}
                    {submittingAttempt && <p className="text-blue-600">🔄 Generating response...</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
