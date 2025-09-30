'use client';

import BackButton from '@/components/navigation/BackButton';
import StudentNavbar from '@/components/navigation/StudentNavbar';
import { AttemptsList } from '@/components/student/case-study/AttemptsList';
import { ExerciseDetailsCard } from '@/components/student/case-study/ExerciseDetailsCard';
import PromptComposer from '@/components/student/case-study/PromptComposer';
import { NavigationData } from '@/components/student/case-study/types';
import StudentLoading from '@/components/student/StudentLoading';
import StudentProgressStepper from '@/components/student/StudentProgressStepper';
import { calculateNavigationData } from '@/lib/navigation-utils';
import { CaseStudyWithRelationsForStudents, ExerciseWithAttemptsResponse } from '@/types/api';
import { SimulationSession } from '@/types/user';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { CaseStudyModule, ExerciseAttempt } from '@prisma/client';
import { Bot } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * -----------------------------
 * Types
 * -----------------------------
 */
interface StudentExerciseClientProps {
  exerciseId: string;
  moduleId?: string;
  caseStudyId?: string;
}

/**
 * -----------------------------
 * Parent: StudentExerciseClient (orchestrates data fetching + navigation + state distribution)
 * -----------------------------
 */
export default function StudentExerciseClient({ exerciseId, moduleId, caseStudyId }: StudentExerciseClientProps) {
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;
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

  // Local attempts (source of truth for freshest state)
  const [localAttempts, setLocalAttempts] = useState<ExerciseAttempt[] | null>(null);

  // Seed local attempts on first load or when server data changes
  useEffect(() => {
    if (exerciseData?.attempts && !localAttempts) setLocalAttempts(exerciseData.attempts);
  }, [exerciseData?.attempts, localAttempts]);

  const currentAttempts: ExerciseAttempt[] | null | undefined = localAttempts ?? exerciseData?.attempts;

  const navigationData: NavigationData | null = calculateNavigationData(caseStudyData, moduleId, exerciseId) ?? null;

  const currentModule: CaseStudyModule | null | undefined = caseStudyData?.modules?.find((m) => m.id === moduleId) ?? null;

  const handleMoveToNext = (): void => {
    if (!navigationData) {
      if (caseStudyId) router.push(`/student/case-study/${caseStudyId}`);
      else router.push('/student');
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
      if (caseStudyId) router.push(`/student/case-study/${caseStudyId}`);
      else router.push('/student');
    }
  };

  const handleMoveToPrevious = (): void => {
    if (!navigationData?.previousExerciseId) return;
    router.push(
      `/student/exercise/${navigationData.previousExerciseId}?moduleId=${navigationData.previousModuleId || moduleId}&caseStudyId=${
        navigationData.caseStudyId || caseStudyId
      }`
    );
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
            {exerciseData ? <ExerciseDetailsCard exerciseData={exerciseData} caseStudyData={caseStudyData} currentModule={currentModule ?? null} /> : null}

            {exerciseData && (
              <PromptComposer
                exerciseId={exerciseId}
                attempts={currentAttempts}
                navigationData={navigationData}
                onNewAttempt={(attempt: ExerciseAttempt) => {
                  setLocalAttempts((prev) => (prev ? [...prev, attempt] : [attempt]));
                }}
                promptCharacterLimit={exerciseData.promptCharacterLimit}
                onMoveToPrevious={handleMoveToPrevious}
                onMoveToNext={handleMoveToNext}
              />
            )}

            {currentAttempts && currentAttempts.length > 0 ? (
              <AttemptsList
                attempts={currentAttempts}
                exerciseId={exerciseId}
                onAttemptsUpdate={(attemptsUpdated: ExerciseAttempt[]) => setLocalAttempts(attemptsUpdated)}
              />
            ) : null}
          </div>

          <div className="lg:col-span-1">
            {caseStudyData ? (
              <StudentProgressStepper
                progressData={{
                  caseStudyId: caseStudyData.id,
                  currentModuleId: moduleId || '',
                  currentExerciseId: exerciseId,
                  modules: caseStudyData.modules || [],
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
