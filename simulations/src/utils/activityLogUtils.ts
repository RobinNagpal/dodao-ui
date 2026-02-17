import { ActivityLogWithUser } from '@/types/api';

interface ModuleInfo {
  id: string;
  orderNumber: number;
  title: string;
  exercises: {
    id: string;
    orderNumber: number;
    title: string;
  }[];
}

interface ExerciseLookup {
  moduleOrderNumber: number;
  moduleTitle: string;
  exerciseOrderNumber: number;
  exerciseTitle: string;
}

/**
 * Build a lookup map from exercise ID to module/exercise info
 */
export function buildExerciseLookup(modules: ModuleInfo[]): Map<string, ExerciseLookup> {
  const lookup = new Map<string, ExerciseLookup>();

  for (const moduleItem of modules) {
    for (const exercise of moduleItem.exercises) {
      lookup.set(exercise.id, {
        moduleOrderNumber: moduleItem.orderNumber,
        moduleTitle: moduleItem.title,
        exerciseOrderNumber: exercise.orderNumber,
        exerciseTitle: exercise.title,
      });
    }
  }

  return lookup;
}

export interface FriendlyActivityLog {
  id: string;
  userName: string;
  userEmail: string;
  activity: string;
  details: string | null;
  status: number;
  createdAt: string | Date;
  isError: boolean;
}

/**
 * Transform a raw activity log into a friendly description for instructors
 */
export function transformLogToFriendly(log: ActivityLogWithUser, exerciseLookup: Map<string, ExerciseLookup>): FriendlyActivityLog {
  const userName = log.user.name || 'Unknown';
  const userEmail = log.user.email || '';
  const isError = log.status >= 400;

  // Determine activity type based on route pattern
  const route = log.requestRoute;

  let activity = 'Unknown activity';
  let details: string | null = null;

  // Parse JSON fields safely
  const pathParams = log.requestPathParams as Record<string, string> | null;
  const requestBody = log.requestBody as Record<string, any> | null;
  const responseBody = log.responseBody as Record<string, any> | null;

  // Case 1: Student attempted exercise - /api/student/exercises/:id/attempts (POST)
  if (route.includes('/student/exercises/') && route.endsWith('/attempts') && log.requestMethod === 'POST') {
    const exerciseId = pathParams?.exerciseId;
    const exerciseInfo = exerciseId ? exerciseLookup.get(exerciseId) : null;
    const attemptNumber = responseBody?.attempt?.attemptNumber;

    if (exerciseInfo && attemptNumber) {
      activity = `Made attempt #${attemptNumber} on Exercise ${exerciseInfo.exerciseOrderNumber} (Module ${exerciseInfo.moduleOrderNumber})`;
      details = `Exercise: ${exerciseInfo.exerciseTitle}`;
    } else if (exerciseInfo) {
      activity = `Attempted Exercise ${exerciseInfo.exerciseOrderNumber} (Module ${exerciseInfo.moduleOrderNumber})`;
      details = `Exercise: ${exerciseInfo.exerciseTitle}`;
    } else {
      activity = 'Attempted an exercise';
    }

    if (isError) {
      activity = `Failed to attempt exercise`;
      details = log.errorMessage || null;
    }
  }
  // Case 2: Student selected attempt - /api/student/exercises/:id/attempts/select (PUT/POST)
  else if (route.includes('/student/exercises/') && route.endsWith('/attempts/select')) {
    const exerciseId = pathParams?.exerciseId;
    const exerciseInfo = exerciseId ? exerciseLookup.get(exerciseId) : null;

    // Find which attempt was selected
    const attempts = responseBody?.attempts as any[] | undefined;
    const selectedAttempt = attempts?.find((a) => a.selectedForSummary === true);
    const attemptNumber = selectedAttempt?.attemptNumber;

    if (exerciseInfo && attemptNumber) {
      activity = `Selected attempt #${attemptNumber} for final report (Exercise ${exerciseInfo.exerciseOrderNumber}, Module ${exerciseInfo.moduleOrderNumber})`;
      details = `Exercise: ${exerciseInfo.exerciseTitle}`;
    } else if (exerciseInfo) {
      activity = `Selected an attempt for final report (Exercise ${exerciseInfo.exerciseOrderNumber}, Module ${exerciseInfo.moduleOrderNumber})`;
      details = `Exercise: ${exerciseInfo.exerciseTitle}`;
    } else {
      activity = 'Selected an attempt for final report';
    }

    if (isError) {
      activity = `Failed to select attempt for final report`;
      details = log.errorMessage || null;
    }
  }
  // Case 3: Student saved final report - /api/student/final-summary/:id (POST)
  else if (route.includes('/student/final-summary/') && log.requestMethod === 'POST') {
    activity = 'Saved final report';

    if (isError) {
      activity = 'Failed to save final report';
      details = log.errorMessage || null;
    }
  }
  // Fallback for any other routes
  else {
    activity = `${log.requestMethod} ${route}`;
  }

  return {
    id: log.id,
    userName,
    userEmail,
    activity,
    details,
    status: log.status,
    createdAt: log.createdAt,
    isError,
  };
}

/**
 * Transform multiple logs into friendly format
 */
export function transformLogsToFriendly(logs: ActivityLogWithUser[], exerciseLookup: Map<string, ExerciseLookup>): FriendlyActivityLog[] {
  return logs.map((log) => transformLogToFriendly(log, exerciseLookup));
}
