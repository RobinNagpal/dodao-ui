// Types based on Prisma schema

import {
  CaseStudy as CaseStudyPrisma,
  CaseStudyModule as PrismaCaseStudyModule,
  ModuleExercise as PrismaModuleExercise,
  ClassCaseStudyEnrollment as PrismaClassCaseStudyEnrollment,
  ExerciseAttempt as PrismaExerciseAttempt,
  EnrollmentStudent as PrismaEnrollmentStudent,
  FinalSubmission as PrismaFinalSubmission,
} from '@prisma/client';

export type BusinessSubject = 'HR' | 'ECONOMICS' | 'MARKETING' | 'FINANCE' | 'OPERATIONS';

export interface CaseStudy extends CaseStudyPrisma {
  modules?: CaseStudyModule[];
  enrollments?: CaseStudyEnrollment[];
}

export interface CaseStudyModule extends PrismaCaseStudyModule {
  exercises?: ModuleExercise[];
}

export interface ModuleExercise extends PrismaModuleExercise {
  attempts?: ExerciseAttempt[];
}

export interface ExerciseAttempt extends PrismaExerciseAttempt {}

export interface CaseStudyEnrollment extends PrismaClassCaseStudyEnrollment {
  students?: EnrollmentStudent[];
}

export interface EnrollmentStudent extends PrismaEnrollmentStudent {
  finalSubmission?: FinalSubmission;
}

export interface FinalSubmission extends PrismaFinalSubmission {}

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
  assignedStudentId: string;
  email: string;
  enrollmentId: string;
  exercises: ExerciseProgress[];
  finalSummary?: {
    id: string;
    status: string | null;
    hasContent: boolean;
    response: string | null;
    createdAt: string;
  };
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
