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

export type ExerciseWithModuleAndCaseStudy = ModuleExercise & {
  module?: CaseStudyModule & {
    caseStudy?: CaseStudy;
  };
};

export type ModuleWithExercises = CaseStudyModule & {
  exercises?: ModuleExercise[];
};

export type CaseStudyWithRelationsForStudents = CaseStudy & {
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
  students?: EnrollmentStudent[];
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
}

// Consolidated interfaces for student exercise data
export interface StudentExerciseProgress {
  id: string;
  title: string;
  orderNumber: number;
  isCompleted: boolean;
  isAttempted: boolean;
  isCurrent: boolean;
  attemptCount: number;
}

export interface StudentModuleProgress {
  id: string;
  title: string;
  orderNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  exercises: StudentExerciseProgress[];
}

export interface StudentProgressData {
  caseStudyTitle: string;
  caseStudyId: string;
  currentModuleId: string;
  currentExerciseId: string;
  modules: StudentModuleProgress[];
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

export interface StudentCaseStudyInfo {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  subject: string;
  finalSummaryPromptInstructions?: string | null;
}

export interface StudentModuleInfo {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  caseStudy: StudentCaseStudyInfo;
}

export interface ConsolidatedStudentExerciseResponse {
  // Exercise details
  id: string;
  title: string;
  details: string;
  promptHint?: string | null;
  orderNumber: number;

  // Module and case study context
  module: StudentModuleInfo;

  // Navigation data
  navigation: StudentNavigationData;

  // Progress data
  progress: StudentProgressData;

  // Student's attempts for this exercise
  attempts: ExerciseAttempt[];
}
