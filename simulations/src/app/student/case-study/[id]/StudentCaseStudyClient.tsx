'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import type { CaseStudyWithRelations } from '@/types/api';
import { ArrowLeft, BookOpen, Target, Play, ChevronRight, Brain, Sparkles, Clock, CheckCircle2, Lock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, string> = {
      HR: '👥',
      ECONOMICS: '📊',
      MARKETING: '📈',
      FINANCE: '💰',
      OPERATIONS: '⚙️',
    };
    return icons[subject] || '📚';
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      HR: 'from-green-500 to-emerald-600',
      ECONOMICS: 'from-blue-500 to-cyan-600',
      MARKETING: 'from-pink-500 to-rose-600',
      FINANCE: 'from-yellow-500 to-orange-600',
      OPERATIONS: 'from-purple-500 to-indigo-600',
    };
    return colors[subject] || 'from-gray-500 to-gray-600';
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
    const modules = caseStudy?.modules || [];
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
    const modules = caseStudy?.modules || [];
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
    const modules = caseStudy?.modules || [];
    const caseStudyModule = modules.find((m) => m.id === moduleId);
    if (!caseStudyModule) return false;

    // Module is accessible if any of its exercises are accessible or if previous modules are completed
    return caseStudyModule.exercises?.some((exercise) => isExerciseAccessible(moduleId, exercise.id)) || false;
  };

  // Calculate progress
  const calculateProgress = () => {
    const modules = caseStudy?.modules || [];
    const totalExercises = modules.reduce((total, module) => total + (module.exercises?.length || 0), 0);
    const completedExercises = modules.reduce(
      (total, module) => total + (module.exercises?.filter((exercise) => isExerciseCompleted(exercise)).length || 0),
      0
    );
    return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  };

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

  if (isLoading || loadingCaseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading case study...</h3>
            <p className="text-gray-600">Preparing your learning experience</p>
          </div>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg max-w-md">
          <CardContent className="text-center py-16">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Case Study Not Found</h3>
            <p className="text-gray-600">The case study you’re looking for doesn’t exist or you don’t have access to it.</p>
            <Button onClick={handleBack} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const modules = caseStudy?.modules || [];
  const totalExercises = modules.reduce((total, module) => total + (module.exercises?.length || 0), 0);
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <header className="backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all duration-200 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-lg">
                  <span className="text-2xl">{getSubjectIcon(caseStudy.subject)}</span>
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-400 to-blue-500 p-1 rounded-full">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">{caseStudy.title}</h1>
                <p className="text-gray-600">Interactive Case Study</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium text-blue-600">{userEmail}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="text-lg font-semibold text-gray-900">{getSubjectDisplayName(caseStudy.subject)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modules</p>
                    <p className="text-lg font-semibold text-gray-900">{modules.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Exercises</p>
                    <p className="text-lg font-semibold text-gray-900">{totalExercises}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-lg font-semibold text-gray-900">{Math.round(progress)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress bar */}
          <div className="pb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-white/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-4">
                <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy.subject)} text-white border-0 text-sm px-3 py-1`}>
                  <span className="mr-2">{getSubjectIcon(caseStudy.subject)}</span>
                  {getSubjectDisplayName(caseStudy.subject)}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Case Study Overview</CardTitle>
              <CardDescription className="text-lg text-gray-700 leading-relaxed">{caseStudy.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                <div className="markdown-body prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(caseStudy.details) }} />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Learning Path</CardTitle>
              </div>
              <CardDescription className="text-gray-600">Complete exercises sequentially to progress through the case study</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modules.map((module, moduleIndex) => {
                  const moduleAccessible = isModuleAccessible(module.id);
                  const moduleCompleted = module.exercises?.every((exercise) => isExerciseCompleted(exercise)) || false;

                  return (
                    <Card
                      key={module.id}
                      className={`transition-all duration-300 ${
                        moduleAccessible ? 'border-gray-200 bg-white shadow-md hover:shadow-lg' : 'border-gray-100 bg-gray-50/50'
                      }`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <Badge
                            className={`${
                              moduleCompleted
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                : moduleAccessible
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-500'
                            } px-3 py-1 text-sm font-medium`}
                          >
                            Module {module.orderNumber}
                          </Badge>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Target className="h-4 w-4" />
                            <span>{module.exercises?.length || 0} exercises</span>
                          </div>
                          {moduleCompleted && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {!moduleAccessible && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>

                        <CardTitle className="text-xl font-bold text-gray-900 mb-2">{module.title}</CardTitle>
                        <CardDescription className="text-gray-600">{module.shortDescription}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Module Details */}
                        <Card className="bg-gray-50/50 border-gray-100">
                          <CardContent className="p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Module Details</h4>
                            <div
                              className="markdown-body prose prose-gray max-w-none text-sm"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(module.details) }}
                            />
                          </CardContent>
                        </Card>

                        {module.exercises && module.exercises.length > 0 && (
                          <div className="space-y-3">
                            {module.exercises.map((exercise) => {
                              const exerciseAccessible = isExerciseAccessible(module.id, exercise.id);
                              const isCompleted = isExerciseCompleted(exercise);
                              const nextAvailable = getNextAvailableExercise();
                              const isCurrentExercise = nextAvailable?.exerciseId === exercise.id;

                              return (
                                <Card
                                  key={exercise.id}
                                  className={`transition-all duration-200 ${
                                    exerciseAccessible ? 'border-gray-200 bg-white hover:shadow-md' : 'border-gray-100 bg-gray-50'
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        <Badge
                                          className={`text-xs font-medium ${
                                            isCompleted
                                              ? 'bg-green-100 text-green-800 border-green-200'
                                              : exerciseAccessible
                                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                                              : 'bg-gray-100 text-gray-500 border-gray-200'
                                          }`}
                                        >
                                          Exercise {exercise.orderNumber}
                                        </Badge>

                                        {isCompleted && (
                                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Completed
                                          </Badge>
                                        )}

                                        {hasAttempts(exercise) && !isCompleted && (
                                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {getAttemptCount(exercise)}/3 attempts
                                          </Badge>
                                        )}

                                        {isCurrentExercise && (
                                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                            <Target className="h-3 w-3 mr-1" />
                                            Current
                                          </Badge>
                                        )}

                                        {!exerciseAccessible && (
                                          <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">
                                            <Lock className="h-3 w-3 mr-1" />
                                            Locked
                                          </Badge>
                                        )}
                                      </div>

                                      <Button
                                        onClick={() => handleStartExercise(exercise.id, module.id)}
                                        disabled={!exerciseAccessible}
                                        className={`transition-all duration-200 ${
                                          exerciseAccessible
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transform hover:scale-[1.02]'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                        size="sm"
                                      >
                                        <Play className="h-4 w-4 mr-2" />
                                        <span>{hasAttempts(exercise) ? 'Continue' : 'Start'}</span>
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                      </Button>
                                    </div>

                                    <h4 className="font-medium text-gray-900 mb-2">{exercise.title}</h4>
                                    <p className="text-sm text-gray-600">{exercise.shortDescription}</p>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {modules.length === 0 && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                  <CardContent className="text-center py-16">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No Modules Available</h3>
                    <p className="text-gray-600">This case study doesn’t have any modules yet.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
