'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CaseStudyWithRelations } from '@/types/api';
import { BookOpen, Target, Brain, Clock, Lock, ArrowLeft, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudentNavbar from '@/components/navigation/StudentNavbar';
import InstructionRequiredModal from '@/components/student/InstructionRequiredModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import ViewCaseStudyModal from '@/components/student/ViewCaseStudyModal';
import ViewModuleModal from '@/components/student/ViewModuleModal';

interface StudentCaseStudyClientProps {
  caseStudyId: string;
}

interface UpdateInstructionStatusRequest {
  studentEmail: string;
  type: 'case_study' | 'module';
  moduleId?: string;
}

export default function StudentCaseStudyClient({ caseStudyId }: StudentCaseStudyClientProps) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showInstructionRequiredModal, setShowInstructionRequiredModal] = useState(false);
  const [instructionModalData, setInstructionModalData] = useState<{
    type: 'case_study' | 'module';
    message: string;
    moduleId?: string;
  } | null>(null);
  const router = useRouter();

  const {
    data: caseStudy,
    loading: loadingCaseStudy,
    reFetchData: refetchCaseStudy,
  } = useFetchData<CaseStudyWithRelations>(
    `/api/student/case-studies/${caseStudyId}?studentEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !caseStudyId || !userEmail },
    'Failed to load case study'
  );

  const { putData: updateInstructionStatus, loading: updatingStatus } = usePutData<{ success: boolean; message: string }, UpdateInstructionStatusRequest>({
    successMessage: 'Instructions marked as read!',
    errorMessage: 'Failed to update instruction status. Please try again.',
  });

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

  const hasAttempts = (exercise: any) => {
    return exercise.attempts && exercise.attempts.length > 0;
  };

  const getAttemptCount = (exercise: any) => {
    return exercise.attempts ? exercise.attempts.length : 0;
  };

  const isExerciseCompleted = (exercise: any) => {
    return exercise.attempts && exercise.attempts.some((attempt: any) => attempt.status === 'completed');
  };

  const isExerciseAccessible = (targetModuleId: string, targetExerciseId: string) => {
    const modules = caseStudy?.modules || [];
    for (const caseStudyModule of modules) {
      for (const exercise of caseStudyModule.exercises || []) {
        if (caseStudyModule.id === targetModuleId && exercise.id === targetExerciseId) {
          return true;
        }
        if (!isExerciseCompleted(exercise)) {
          return false;
        }
      }
    }
    return false;
  };

  const isModuleAccessible = (moduleId: string) => {
    const modules = caseStudy?.modules || [];
    const caseStudyModule = modules.find((m) => m.id === moduleId);
    if (!caseStudyModule) return false;

    return caseStudyModule.exercises?.some((exercise) => isExerciseAccessible(moduleId, exercise.id)) || false;
  };

  const isModuleCompleted = (module: any) => {
    return module.exercises?.every((exercise: any) => isExerciseCompleted(exercise)) || false;
  };

  const hasCaseStudyInstructionsRead = () => {
    return caseStudy?.instructionReadStatus?.readCaseInstructions || false;
  };

  const hasModuleInstructionsRead = (moduleId: string) => {
    if (!caseStudy?.instructionReadStatus?.moduleInstructions) return false;
    const moduleStatus = caseStudy.instructionReadStatus.moduleInstructions.find((m) => m.id === moduleId);
    return moduleStatus?.readModuleInstructions || false;
  };

  const handleMarkInstructionAsRead = async (type: 'case_study' | 'module', moduleId?: string) => {
    try {
      if (type === 'case_study') {
        setShowCaseStudyModal(false);
      } else {
        setShowModuleModal(false);
      }
      const result = await updateInstructionStatus(`/api/student/case-studies/${caseStudyId}`, {
        studentEmail: userEmail,
        type,
        moduleId,
      });

      if (result) {
        // Refetch case study data to get updated instruction status
        await refetchCaseStudy();
      }
    } catch (error) {
      console.error('Error updating instruction status:', error);
    }
  };

  const handleCloseCaseStudyModal = async () => {
    // Auto-mark as read when closing modal if not already read
    if (!hasCaseStudyInstructionsRead()) {
      await handleMarkInstructionAsRead('case_study');
    } else {
      setShowCaseStudyModal(false);
    }
  };

  const handleCloseModuleModal = async () => {
    // Auto-mark as read when closing modal if not already read
    if (selectedModule && !hasModuleInstructionsRead(selectedModule.id)) {
      await handleMarkInstructionAsRead('module', selectedModule.id);
    } else {
      setShowModuleModal(false);
    }
  };

  const handleModuleClick = (module: any) => {
    // Only check if case study instructions have been read, not module-specific requirements
    if (!hasCaseStudyInstructionsRead()) {
      setInstructionModalData({
        type: 'case_study',
        message: 'Please read the case study instructions first before accessing module details.',
      });
      setShowInstructionRequiredModal(true);
      return;
    }

    setSelectedModule(module);
    setShowModuleModal(true);
  };

  const handleExerciseClick = (exerciseId: string, moduleId: string) => {
    if (!isExerciseAccessible(moduleId, exerciseId)) {
      return;
    }

    // Check if case study instructions have been read first
    if (!hasCaseStudyInstructionsRead()) {
      setInstructionModalData({
        type: 'case_study',
        message: 'Please read the case study instructions first before starting any exercises.',
      });
      setShowInstructionRequiredModal(true);
      return;
    }

    // Check if module instructions have been read
    if (!hasModuleInstructionsRead(moduleId)) {
      setInstructionModalData({
        type: 'module',
        message: 'Please read the module instructions first before starting exercises.',
        moduleId: moduleId,
      });
      setShowInstructionRequiredModal(true);
      return;
    }

    const url = `/student/exercise/${exerciseId}?moduleId=${moduleId}&caseStudyId=${caseStudyId}`;
    router.push(url);
  };

  const handleViewInstructions = () => {
    setShowInstructionRequiredModal(false);

    if (instructionModalData?.type === 'case_study') {
      setShowCaseStudyModal(true);
    } else if (instructionModalData?.type === 'module' && instructionModalData.moduleId) {
      // Find the module to set as selected
      const caseStudyModule = caseStudy?.modules?.find((m) => m.id === instructionModalData.moduleId);
      if (caseStudyModule) {
        setSelectedModule(caseStudyModule);
        setShowModuleModal(true);
      }
    }
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
            <p className="text-gray-600 mb-2">The case study you’re looking for doesn’t exist or you don’t have access to it.</p>
            <Button onClick={() => router.push('/student')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const modules = caseStudy?.modules || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <StudentNavbar
        title={caseStudy.title}
        subtitle="Interactive Case Study"
        userEmail={userEmail}
        icon={<span className="text-2xl">{getSubjectIcon(caseStudy.subject)}</span>}
        iconColor="from-blue-600 to-indigo-700"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Button
            onClick={() => router.push('/student')}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-white/20 shadow-lg mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy.subject)} text-white border-0 text-sm px-3 py-1`}>
                  <span className="mr-2">{getSubjectIcon(caseStudy.subject)}</span>
                  {getSubjectDisplayName(caseStudy.subject)}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>

              <Button
                onClick={() => setShowCaseStudyModal(true)}
                className={`${
                  hasCaseStudyInstructionsRead()
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
              >
                {hasCaseStudyInstructionsRead() ? <Check className="h-4 w-4 mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
                Case Study Instructions
                {hasCaseStudyInstructionsRead() && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">✓ Read</span>}
              </Button>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Case Study Overview</CardTitle>
            <CardDescription className="text-base text-gray-700 leading-relaxed">{caseStudy.shortDescription}</CardDescription>
          </CardHeader>
        </Card>

        {modules.length > 0 && (
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Learning Path</CardTitle>
              </div>
              <CardDescription className="text-gray-600">Click on modules and exercises to view details or start learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="relative">
                  <div className="flex items-start justify-between">
                    {modules.map((module, index) => {
                      const moduleCompleted = isModuleCompleted(module);
                      const moduleAccessible = isModuleAccessible(module.id);

                      return (
                        <div key={module.id} className="flex flex-col items-center relative flex-1">
                          {index < modules.length - 1 && (
                            <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 z-0">
                              <div
                                className={`h-full transition-all duration-500 ${moduleCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                                style={{ width: moduleCompleted ? '100%' : '0%' }}
                              />
                            </div>
                          )}

                          <div
                            onClick={() => handleModuleClick(module)}
                            className={`
                              relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 mb-3 cursor-pointer hover:scale-110
                              ${
                                moduleCompleted
                                  ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                                  : moduleAccessible
                                  ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                                  : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed hover:scale-100'
                              }
                            `}
                          >
                            {moduleCompleted ? <Check className="h-6 w-6" /> : <span className="text-sm font-bold">{module.orderNumber}</span>}
                          </div>

                          <div className="text-center max-w-40 mb-4">
                            <p
                              className={`text-sm font-medium mb-1 ${
                                moduleCompleted ? 'text-green-700' : moduleAccessible ? 'text-blue-700' : 'text-gray-500'
                              }`}
                            >
                              Module {module.orderNumber}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">{module.title}</p>
                          </div>

                          <div className="w-full max-w-xs space-y-2">
                            {/* Module Details Card */}
                            <div
                              onClick={() => handleModuleClick(module)}
                              className={`
                                flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md
                                ${
                                  hasModuleInstructionsRead(module.id)
                                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                }
                              `}
                            >
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div
                                  className={`
                                    w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                                    ${hasModuleInstructionsRead(module.id) ? 'bg-green-500 border-green-500' : 'border-blue-500'}
                                  `}
                                >
                                  {hasModuleInstructionsRead(module.id) && <Check className="h-3 w-3 text-white" />}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-600 truncate font-medium">📖 Module Instructions</p>
                                </div>
                              </div>

                              <div className="flex-shrink-0 ml-2">
                                {hasModuleInstructionsRead(module.id) && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-1 py-0">✓</Badge>
                                )}
                              </div>
                            </div>

                            {module.exercises && module.exercises.length > 0 && (
                              <>
                                <div className="space-y-2">
                                  {module.exercises.map((exercise) => {
                                    const exerciseCompleted = isExerciseCompleted(exercise);
                                    const exerciseAttempted = hasAttempts(exercise);
                                    const exerciseAccessible = isExerciseAccessible(module.id, exercise.id);

                                    return (
                                      <div
                                        key={exercise.id}
                                        onClick={() => handleExerciseClick(exercise.id, module.id)}
                                        className={`
                                          flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md
                                          ${
                                            exerciseCompleted
                                              ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                              : exerciseAttempted
                                              ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                                              : exerciseAccessible
                                              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                              : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                          }
                                        `}
                                      >
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                          <div
                                            className={`
                                              w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                                              ${
                                                exerciseCompleted
                                                  ? 'bg-green-500 border-green-500'
                                                  : exerciseAttempted
                                                  ? 'bg-yellow-500 border-yellow-500'
                                                  : exerciseAccessible
                                                  ? 'border-blue-500'
                                                  : 'border-gray-300'
                                              }
                                            `}
                                          >
                                            {exerciseCompleted && <Check className="h-3 w-3 text-white" />}
                                            {exerciseAttempted && !exerciseCompleted && <Clock className="h-2 w-2 text-white" />}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-600 truncate">{`${exercise.orderNumber}) ${exercise.title}`}</p>
                                          </div>
                                        </div>

                                        <div className="flex-shrink-0 ml-2">
                                          {exerciseCompleted && <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-1 py-0">✓</Badge>}
                                          {exerciseAttempted && !exerciseCompleted && (
                                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-1 py-0">
                                              {getAttemptCount(exercise)}/3
                                            </Badge>
                                          )}
                                          {!exerciseAccessible && (
                                            <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs px-1 py-0">
                                              <Lock className="h-2 w-2" />
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <ViewModuleModal
          open={showModuleModal}
          onClose={handleCloseModuleModal}
          selectedModule={selectedModule}
          hasModuleInstructionsRead={hasModuleInstructionsRead}
          handleMarkInstructionAsRead={handleMarkInstructionAsRead}
          updatingStatus={updatingStatus}
        />

        <ViewCaseStudyModal
          open={showCaseStudyModal}
          onClose={handleCloseCaseStudyModal}
          caseStudy={caseStudy}
          hasCaseStudyInstructionsRead={hasCaseStudyInstructionsRead}
          handleMarkInstructionAsRead={handleMarkInstructionAsRead}
          updatingStatus={updatingStatus}
        />

        <InstructionRequiredModal
          open={showInstructionRequiredModal}
          onClose={() => setShowInstructionRequiredModal(false)}
          instructionModalData={instructionModalData}
          handleViewInstructions={handleViewInstructions}
        />
      </div>
    </div>
  );
}
