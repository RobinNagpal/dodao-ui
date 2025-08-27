// Types based on Prisma schema
export type BusinessSubject = 'HR' | 'ECONOMICS' | 'MARKETING' | 'FINANCE' | 'OPERATIONS';

export interface CaseStudy {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  subject: BusinessSubject;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  modules?: CaseStudyModule[];
  enrollments?: CaseStudyEnrollment[];
}

export interface CaseStudyModule {
  id: string;
  caseStudyId: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  exercises?: ModuleExercise[];
}

export interface ModuleExercise {
  id: string;
  moduleId: string;
  title: string;
  shortDescription: string;
  details: string;
  promptHint?: string;
  orderNumber: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  attempts?: ExerciseAttempt[];
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  createdBy?: string;
  updatedBy?: string;
  attemptNumber: number;
  model?: string;
  prompt?: string;
  promptResponse?: string;
  status?: string;
  error?: string;
  createdAt: Date;
}

export interface CaseStudyEnrollment {
  id: string;
  caseStudyId: string;
  assignedInstructorId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  students?: EnrollmentStudent[];
}

export interface EnrollmentStudent {
  id: string;
  enrollmentId: string;
  assignedStudentId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  finalSubmission?: FinalSubmission;
}

export interface FinalSubmission {
  id: string;
  studentId: string;
  createdBy?: string;
  updatedBy?: string;
  finalContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy types for backward compatibility during transition
export interface Exercise {
  id: string;
  title: string;
  model: string;
  modelStep: number;
  totalSteps: number;
  instructions: string;
  guidelines: string[];
  examplePrompt: string;
  expectedOutput: string;
}

export interface StudentProgress {
  currentCaseStudyId?: string;
  currentModuleId?: string;
  currentExerciseId?: string;
  completedExercises: string[];
  answers: Record<
    string,
    {
      prompt: string;
      aiResponse: string;
      finalAnswer: string;
    }
  >;
}

export type Screen =
  | 'student-login'
  | 'professor-login'
  | 'dashboard'
  | 'professor-case-management'
  | 'professor-monitoring'
  | 'landing'
  | 'exercise'
  | 'transition'
  | 'final';

export type UserType = 'student' | 'professor';

// Instructor table interfaces
export interface AttemptDetail {
  id: string;
  attemptNumber: number;
  status: string | null;
  createdAt: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  moduleId: string;
  moduleOrderNumber: number;
  exerciseOrderNumber: number;
  hasAttempts: boolean;
  attempts: AttemptDetail[];
}

export interface StudentTableData {
  id: string;
  assignedStudentId: string; // student email
  enrollmentId: string;
  exercises: ExerciseProgress[];
  createdAt: string;
}

export interface ModuleTableExercise {
  id: string;
  orderNumber: number;
  title: string;
}

export interface ModuleTableData {
  id: string;
  orderNumber: number;
  title: string;
  exercises: ModuleTableExercise[];
}
