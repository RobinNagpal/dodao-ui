'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import type { CaseStudyWithRelations } from '@/types/api';
import { ArrowLeft, BookOpen, GraduationCap, Target, Play, ChevronRight } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';

interface StudentCaseStudyClientProps {
  caseStudyId: string;
}

export default function StudentCaseStudyClient({ caseStudyId }: StudentCaseStudyClientProps) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // API hook to fetch case study data
  const { data: caseStudy, loading: loadingCaseStudy } = useFetchData<CaseStudyWithRelations>(
    `/api/student/case-studies/${caseStudyId}?studentEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !caseStudyId || !userEmail },
    'Failed to load case study'
  );

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'student' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setIsLoading(false);
  }, [router]);

  const handleBack = () => {
    router.push('/student');
  };

  const handleStartExercise = (exerciseId: string, moduleId: string) => {
    // Check if exercise is accessible
    if (!isExerciseAccessible(moduleId, exerciseId)) {
      alert('Please complete the previous exercises first before accessing this one.');
      return;
    }
    router.push(`/student/exercise/${exerciseId}?moduleId=${moduleId}&caseStudyId=${caseStudyId}`);
  };

  const getSubjectDisplayName = (subject: string) => {
    const displayNames: Record<string, string> = {
      HR: 'Human Resources',
      ECONOMICS: 'Economics',
      MARKETING: 'Marketing',
      FINANCE: 'Finance',
      OPERATIONS: 'Operations',
    };
    return displayNames[subject] || subject;
  };

  // Function to check if an exercise has been attempted
  const hasAttempts = (exercise: any) => {
    return exercise.attempts && exercise.attempts.length > 0;
  };

  // Function to get attempt count for an exercise
  const getAttemptCount = (exercise: any) => {
    return exercise.attempts ? exercise.attempts.length : 0;
  };

  // Function to check if an exercise is completed (has at least one successful attempt)
  const isExerciseCompleted = (exercise: any) => {
    return exercise.attempts && exercise.attempts.some((attempt: any) => attempt.status === 'completed');
  };

  // Function to get the next available exercise for the student
  const getNextAvailableExercise = () => {
    for (const caseStudyModule of modules) {
      for (const exercise of caseStudyModule.exercises || []) {
        if (!isExerciseCompleted(exercise)) {
          return { moduleId: caseStudyModule.id, exerciseId: exercise.id };
        }
      }
    }
    return null; // All exercises completed
  };

  // Function to check if an exercise is accessible (previous exercises completed)
  const isExerciseAccessible = (targetModuleId: string, targetExerciseId: string) => {
    for (const caseStudyModule of modules) {
      for (const exercise of caseStudyModule.exercises || []) {
        // If we reach the target exercise, it's accessible
        if (caseStudyModule.id === targetModuleId && exercise.id === targetExerciseId) {
          return true;
        }
        // If we find an incomplete exercise before the target, target is not accessible
        if (!isExerciseCompleted(exercise)) {
          return false;
        }
      }
    }
    return false;
  };

  // Function to check if a module is accessible (at least one exercise is accessible)
  const isModuleAccessible = (moduleId: string) => {
    const caseStudyModule = modules.find((m) => m.id === moduleId);
    if (!caseStudyModule) return false;

    // Module is accessible if any of its exercises are accessible or if previous modules are completed
    return caseStudyModule.exercises?.some((exercise) => isExerciseAccessible(moduleId, exercise.id)) || false;
  };

  if (isLoading || loadingCaseStudy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-900">Loading case study...</span>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Case study not found</h3>
          <p className="text-gray-600 mb-4">The case study you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <button onClick={handleBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const modules = caseStudy?.modules || [];
  const totalExercises = modules.reduce((total, module) => total + (module.exercises?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{caseStudy.title}</h1>
                <p className="text-gray-600">Case Study Learning</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">Logged in as {userEmail}</div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="text-lg font-semibold text-gray-900">{getSubjectDisplayName(caseStudy.subject)}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modules</p>
                  <p className="text-lg font-semibold text-gray-900">{modules.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Exercises</p>
                  <p className="text-lg font-semibold text-gray-900">{totalExercises}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Case Study Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{getSubjectDisplayName(caseStudy.subject)}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Study Overview</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">{caseStudy.shortDescription}</p>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <div className="markdown-body prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(caseStudy.details) }} />
            </div>
          </div>

          {/* Learning Modules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Path</h2>
              <p className="text-gray-600">Complete exercises sequentially to progress through the case study</p>
            </div>

            <div className="space-y-6">
              {modules.map((module, moduleIndex) => {
                const moduleAccessible = isModuleAccessible(module.id);

                return (
                  <div key={module.id} className={`border rounded-xl ${moduleAccessible ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            moduleAccessible ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          Module {module.orderNumber}
                        </div>
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {module.exercises?.length || 0} exercises
                        </span>
                        {!moduleAccessible && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Locked</span>}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                      <p className="text-gray-600 mb-4">{module.shortDescription}</p>

                      {/* Module Details */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4">
                        <h4 className="text-lg font-medium text-gray-900 mb-3">Module Details</h4>
                        <div className="markdown-body prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(module.details) }} />
                      </div>

                      {module.exercises && module.exercises.length > 0 && (
                        <div className="space-y-3">
                          {module.exercises.map((exercise) => {
                            const exerciseAccessible = isExerciseAccessible(module.id, exercise.id);
                            const isCompleted = isExerciseCompleted(exercise);
                            const nextAvailable = getNextAvailableExercise();
                            const isCurrentExercise = nextAvailable?.exerciseId === exercise.id;

                            return (
                              <div
                                key={exercise.id}
                                className={`border rounded-lg p-4 ${exerciseAccessible ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        isCompleted
                                          ? 'bg-green-100 text-green-800'
                                          : exerciseAccessible
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-500'
                                      }`}
                                    >
                                      Exercise {exercise.orderNumber}
                                    </div>

                                    {isCompleted && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">✓ Completed</span>}

                                    {hasAttempts(exercise) && !isCompleted && (
                                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                        {getAttemptCount(exercise)}/3 attempts
                                      </span>
                                    )}

                                    {isCurrentExercise && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">Current</span>}

                                    {!exerciseAccessible && <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-medium">🔒 Locked</span>}
                                  </div>

                                  <button
                                    onClick={() => handleStartExercise(exercise.id, module.id)}
                                    disabled={!exerciseAccessible}
                                    className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 text-sm ${
                                      exerciseAccessible ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <Play className="h-4 w-4" />
                                    <span>{hasAttempts(exercise) ? 'Continue' : 'Start'}</span>
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </div>

                                <h4 className="font-medium text-gray-900 mb-2">{exercise.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{exercise.shortDescription}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {modules.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No modules available</h3>
                <p className="text-gray-600">This case study doesn’t have any modules yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
