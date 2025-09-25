import {
  BusinessSubject,
  CaseStudy,
  CaseStudyModule,
  ModuleExercise,
  ClassCaseStudyEnrollment,
  EnrollmentStudent,
  FinalSubmission,
  User,
  ExerciseAttempt,
} from '@prisma/client';

export type ModuleExerciseWithProgress = ModuleExercise & {
  isExerciseCompleted?: boolean;
  attemptCount?: number;
};

export interface CreateCaseStudyRequest {
  title: string;
  shortDescription: string;
  details: string;
  finalSummaryPromptInstructions?: string | null;
  subject: BusinessSubject;
  modules: CreateModuleRequest[];
}

export interface CreateModuleRequest {
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  exercises: CreateExerciseRequest[];
}

export interface CreateExerciseRequest {
  title: string;
  details: string;
  promptHint?: string;
  gradingLogic?: string;
  orderNumber: number;
}

export interface UpdateCaseStudyRequest {
  title: string;
  shortDescription: string;
  details: string;
  finalSummaryPromptInstructions?: string | null;
  subject: BusinessSubject;
  modules: UpdateModuleRequest[];
}

export interface UpdateModuleRequest {
  id?: string; // Optional for existing modules
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  exercises: UpdateExerciseRequest[];
}

export interface UpdateExerciseRequest {
  id?: string; // Optional for existing exercises
  title: string;
  details: string;
  promptHint?: string;
  gradingLogic?: string;
  orderNumber: number;
}

export type ModuleWithExercises = CaseStudyModule & {
  exercises?: ModuleExercise[];
};

export type CaseStudyWithRelationsForStudents = CaseStudy & {
  modules?: Array<
    CaseStudyModule & {
      exercises?: Array<ModuleExerciseWithProgress>;
      isModuleCompleted?: boolean;
    }
  >;
  instructorEmail?: string; // Added instructor email
  instructorName?: string | null; // Added instructor name
  instructionReadStatus?: {
    readCaseInstructions: boolean;
    moduleInstructions: Array<{
      id: string;
      readModuleInstructions: boolean;
    }>;
  };
};

export type CaseStudyWithRelationsForInstructor = CaseStudy & {
  modules?: Array<
    CaseStudyModule & {
      exercises?: ModuleExercise[];
    }
  >;

  instructorEmail?: string; // Added instructor email
  instructorName?: string | null; // Added instructor name
  instructionReadStatus?: {
    readCaseInstructions: boolean;
    moduleInstructions: Array<{
      id: string;
      readModuleInstructions: boolean;
    }>;
  };
};

export type CaseStudyWithRelationsForAdmin = CaseStudyWithRelationsForStudents & {
  enrollments?: Array<
    ClassCaseStudyEnrollment & {
      students?: Array<
        EnrollmentStudent & {
          finalSubmission?: FinalSubmission;
        }
      >;
    }
  >;
  createdBy: User;
  updatedBy: User;
};

export type ClassCaseStudyEnrollmentWithStudents = ClassCaseStudyEnrollment & {
  students: EnrollmentStudent[];
};

export type CaseStudyWithInstructorAndStudents = CaseStudy & {
  enrollments: ClassCaseStudyEnrollmentWithStudents[];
};

export type EnrollmentWithRelations = ClassCaseStudyEnrollment & {
  caseStudy: {
    id: string;
    title: string;
    shortDescription: string;
    subject: BusinessSubject;
  };
  students?: Array<EnrollmentStudent & { assignedStudent?: { email: string | null } }>;
  assignedInstructor?: {
    id: string;
    email?: string | null;
    username: string;
  } | null;
};

export interface DeleteResponse {
  message: string;
}

export interface CreateEnrollmentRequest {
  caseStudyId: string;
  assignedInstructorEmail: string;
  className: string;
}

export interface CreateEnrollmentRequestForCaseStudy {
  assignedInstructorEmail: string;
  className: string;
}

export interface ExerciseWithAttemptsResponse {
  // Exercise details
  id: string;
  title: string;
  details: string;
  promptHint?: string | null;
  orderNumber: number;

  // Student's attempts for this exercise
  attempts: ExerciseAttempt[];
}

export interface StudentNavigationData {
  nextExerciseId?: string;
  nextModuleId?: string;
  caseStudyId?: string;
  isComplete: boolean;
  message: string;
  previousExerciseId?: string;
  previousModuleId?: string;
  isFirstExercise: boolean;
  isNextExerciseInDifferentModule: boolean;
}
