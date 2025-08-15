// Navigation utilities for the simulation app

export const routes = {
  student: {
    dashboard: '/student',
    caseStudy: (caseStudyId: string) => `/student/case-study/${caseStudyId}`,
    module: (caseStudyId: string, moduleId: string) => `/student/case-study/${caseStudyId}/module/${moduleId}`,
    exercise: (caseStudyId: string, moduleId: string, exerciseId: string) => `/student/case-study/${caseStudyId}/module/${moduleId}/exercise/${exerciseId}`,
  },
  professor: {
    dashboard: '/professor',
    caseStudy: (caseStudyId: string) => `/professor/case-study/${caseStudyId}`,
  },
  auth: {
    login: '/login',
  },
} as const;

// Helper function to get the next exercise in a module
export const getNextExerciseRoute = (
  caseStudyId: string,
  moduleId: string,
  currentExerciseId: string,
  allExercises: { id: string; orderNumber: number }[]
): string | null => {
  const sortedExercises = allExercises.sort((a, b) => a.orderNumber - b.orderNumber);
  const currentIndex = sortedExercises.findIndex((ex) => ex.id === currentExerciseId);

  if (currentIndex < sortedExercises.length - 1) {
    const nextExercise = sortedExercises[currentIndex + 1];
    return routes.student.exercise(caseStudyId, moduleId, nextExercise.id);
  }

  return null; // No more exercises in this module
};

// Helper function to get the previous exercise in a module
export const getPreviousExerciseRoute = (
  caseStudyId: string,
  moduleId: string,
  currentExerciseId: string,
  allExercises: { id: string; orderNumber: number }[]
): string | null => {
  const sortedExercises = allExercises.sort((a, b) => a.orderNumber - b.orderNumber);
  const currentIndex = sortedExercises.findIndex((ex) => ex.id === currentExerciseId);

  if (currentIndex > 0) {
    const previousExercise = sortedExercises[currentIndex - 1];
    return routes.student.exercise(caseStudyId, moduleId, previousExercise.id);
  }

  return null; // No previous exercises in this module
};
