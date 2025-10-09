'use client';

import BackButton from '@/components/navigation/BackButton';
import StudentNavbar from '@/components/navigation/StudentNavbar';
import ViewCaseStudyInstructionsModal from '@/components/shared/ViewCaseStudyInstructionsModal';
import ViewModuleModal from '@/components/shared/ViewModuleModal';
import InstructionRequiredModal from '@/components/student/InstructionRequiredModal';
import StudentLoading from '@/components/student/StudentLoading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CaseStudyWithRelationsForStudents } from '@/types/api';
import { SimulationSession } from '@/types/user';
import { getSubjectColor, getSubjectDisplayName, getSubjectIcon } from '@/utils/subject-utils';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BookOpen, BotIcon, Check, Clock, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface StudentCaseStudyClientProps {
  caseStudyId: string;
}

interface UpdateInstructionStatusRequest {
  type: 'case_study' | 'module';
  moduleId?: string;
}

export default function StudentCaseStudyClient({ caseStudyId }: StudentCaseStudyClientProps) {
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
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const {
    data: caseStudy,
    loading: loadingCaseStudy,
    reFetchData: refetchCaseStudy,
  } = useFetchData<CaseStudyWithRelationsForStudents>(
    `${getBaseUrl()}/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load case study'
  );

  const { putData: updateInstructionStatus, loading: updatingStatus } = usePutData<{ success: boolean; message: string }, UpdateInstructionStatusRequest>({
    successMessage: 'Instructions marked as read!',
    errorMessage: 'Failed to update instruction status. Please try again.',
  });

  const hasAttempts = (exercise: any) => {
    return exercise.attemptCount > 0;
  };

  const getAttemptCount = (exercise: any) => {
    return exercise.attemptCount || 0;
  };

  const isExerciseCompleted = (exercise: any) => {
    return exercise.isExerciseCompleted || false;
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
    return module.isModuleCompleted || false;
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
      const result = await updateInstructionStatus(`${getBaseUrl()}/api/case-studies/${caseStudyId}`, {
        type,
        moduleId,
      });

      if (result) {
        await refetchCaseStudy();
      }
    } catch (error) {
      console.error('Error updating instruction status:', error);
    }
  };

  const handleCloseCaseStudyModal = async () => {
    if (!hasCaseStudyInstructionsRead()) {
      await handleMarkInstructionAsRead('case_study');
    } else {
      setShowCaseStudyModal(false);
    }
  };

  const handleCloseModuleModal = async () => {
    if (selectedModule && !hasModuleInstructionsRead(selectedModule.id)) {
      await handleMarkInstructionAsRead('module', selectedModule.id);
    } else {
      setShowModuleModal(false);
    }
  };

  const handleModuleClick = (module: any) => {
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

    if (!hasCaseStudyInstructionsRead()) {
      setInstructionModalData({
        type: 'case_study',
        message: 'Please read the case study instructions first before starting any exercises.',
      });
      setShowInstructionRequiredModal(true);
      return;
    }

    if (!hasModuleInstructionsRead(moduleId)) {
      setInstructionModalData({
        type: 'module',
        message: 'Please read the module instructions first before starting exercises.',
        moduleId: moduleId,
      });
      setShowInstructionRequiredModal(true);
      return;
    }

    const url = `${getBaseUrl()}/student/exercise/${exerciseId}?moduleId=${moduleId}&caseStudyId=${caseStudyId}`;
    router.push(url);
  };

  const handleViewInstructions = () => {
    setShowInstructionRequiredModal(false);

    if (instructionModalData?.type === 'case_study') {
      setShowCaseStudyModal(true);
    } else if (instructionModalData?.type === 'module' && instructionModalData.moduleId) {
      const caseStudyModule = caseStudy?.modules?.find((m) => m.id === instructionModalData.moduleId);
      if (caseStudyModule) {
        setSelectedModule(caseStudyModule);
        setShowModuleModal(true);
      }
    }
  };

  if (isLoading || loadingCaseStudy) {
    return <StudentLoading text="Loading case study..." subtitle="Preparing your learning experience" variant="enhanced" />;
  }

  const modules = caseStudy?.modules || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <StudentNavbar
        title={caseStudy?.title || 'Case Study Not Found'}
        subtitle="Case Study Details"
        icon={<span className="text-2xl">{getSubjectIcon(caseStudy?.subject || 'MARKETING')}</span>}
        iconColor="from-blue-600 to-indigo-700"
        showLogout={true}
        userEmail={session?.email || session?.username}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <BackButton userType="student" text="Back to Dashboard" href="/student" />

        {modules.length > 0 && (
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy?.subject || 'MARKETING')} text-white border-0 text-sm px-3 py-1`}>
                    <span className="mr-2">{getSubjectIcon(caseStudy?.subject || 'MARKETING')}</span>
                    {getSubjectDisplayName(caseStudy?.subject || 'MARKETING')}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    <BotIcon className="h-3 w-3 mr-1" />
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
              <CardDescription className="text-base text-gray-700 leading-relaxed mb-4">
                {caseStudy?.shortDescription || 'No description available.'}
              </CardDescription>

              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
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

        {selectedModule && (
          <ViewModuleModal
            open={showModuleModal}
            onClose={handleCloseModuleModal}
            selectedModule={selectedModule}
            hasModuleInstructionsRead={hasModuleInstructionsRead}
            handleMarkInstructionAsRead={handleMarkInstructionAsRead}
            updatingStatus={updatingStatus}
            caseStudy={caseStudy}
            onModuleUpdate={(updatedModule) => {
              // Students don't edit, so this should not be called
              console.log('Student tried to update module - this should not happen');
            }}
          />
        )}

        {caseStudy && (
          <ViewCaseStudyInstructionsModal
            open={showCaseStudyModal}
            onClose={handleCloseCaseStudyModal}
            caseStudy={caseStudy}
            hasCaseStudyInstructionsRead={hasCaseStudyInstructionsRead}
            handleMarkInstructionAsRead={handleMarkInstructionAsRead}
            updatingStatus={updatingStatus}
            onCaseStudyUpdate={(updatedCaseStudy) => {
              // Students don't edit, so this should not be called
              console.log('Student tried to update case study - this should not happen');
            }}
          />
        )}

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
