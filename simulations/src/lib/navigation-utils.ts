import type { CaseStudyWithRelationsForStudents, StudentNavigationData } from '@/types/api';

/**
 * Calculate navigation data for an exercise within a case study
 * @param caseStudyData The full case study data with modules and exercises
 * @param moduleId The current module ID
 * @param exerciseId The current exercise ID
 * @returns Navigation data including next/previous exercise information
 */
export function calculateNavigationData(
  caseStudyData: CaseStudyWithRelationsForStudents | undefined,
  moduleId: string | undefined,
  exerciseId: string | undefined
): StudentNavigationData | null {
  if (!caseStudyData?.modules || !moduleId || !exerciseId) {
    return null;
  }

  const currentModule = caseStudyData.modules.find((m) => m.id === moduleId);
  if (!currentModule || !currentModule.exercises) {
    return null;
  }

  const currentExercise = currentModule.exercises.find((e) => e.id === exerciseId);
  if (!currentExercise) {
    return null;
  }

  // Find previous exercise
  let previousExerciseId: string | undefined;
  let previousModuleId: string | undefined;
  let isFirstExercise = false;

  // Check for previous exercise in current module
  const previousExerciseInModule = currentModule.exercises
    .filter((exercise) => exercise.orderNumber < currentExercise.orderNumber)
    .sort((a, b) => b.orderNumber - a.orderNumber)[0];

  if (previousExerciseInModule) {
    previousExerciseId = previousExerciseInModule.id;
    previousModuleId = currentModule.id;
  } else {
    // Check previous modules for their last exercise
    const previousModules = caseStudyData.modules
      .filter((module) => module.orderNumber < currentModule.orderNumber)
      .sort((a, b) => b.orderNumber - a.orderNumber);

    if (previousModules.length > 0) {
      const lastPreviousModule = previousModules[0];
      if (lastPreviousModule.exercises && lastPreviousModule.exercises.length > 0) {
        const lastExerciseInPreviousModule = lastPreviousModule.exercises.sort((a, b) => b.orderNumber - a.orderNumber)[0];
        previousExerciseId = lastExerciseInPreviousModule.id;
        previousModuleId = lastPreviousModule.id;
      }
    }
  }

  if (!previousExerciseId) {
    isFirstExercise = true;
  }

  // Find next exercise in current module
  const nextExerciseInModule = currentModule.exercises.find((exercise) => exercise.orderNumber > currentExercise.orderNumber);

  if (nextExerciseInModule) {
    return {
      nextExerciseId: nextExerciseInModule.id,
      caseStudyId: caseStudyData.id,
      isComplete: false,
      message: 'Next exercise found in current module',
      previousExerciseId,
      previousModuleId,
      isFirstExercise,
      isNextExerciseInDifferentModule: false,
    };
  }

  // Find next module in case study
  const nextModule = caseStudyData.modules.find((module) => module.orderNumber > currentModule.orderNumber);

  if (nextModule && nextModule.exercises && nextModule.exercises.length > 0) {
    const firstExerciseInNextModule = nextModule.exercises[0];
    return {
      nextExerciseId: firstExerciseInNextModule.id,
      nextModuleId: nextModule.id,
      caseStudyId: caseStudyData.id,
      isComplete: false,
      message: 'Next exercise found in next module',
      previousExerciseId,
      previousModuleId,
      isFirstExercise,
      isNextExerciseInDifferentModule: true,
    };
  }

  // No more exercises or modules - case study is complete
  return {
    caseStudyId: caseStudyData.id,
    isComplete: true,
    message: 'Case study completed - ready for final submission',
    previousExerciseId,
    previousModuleId,
    isFirstExercise,
    isNextExerciseInDifferentModule: false,
  };
}
