// Minimal shape inferred from usage of calculateNavigationData
export interface NavigationData {
  isComplete: boolean;
  caseStudyId?: string | null;
  isFirstExercise?: boolean;
  isNextExerciseInDifferentModule?: boolean;
  nextExerciseId?: string | null;
  nextModuleId?: string | null;
  previousExerciseId?: string | null;
  previousModuleId?: string | null;
}
