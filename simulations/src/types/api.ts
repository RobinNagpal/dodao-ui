import {
  BusinessSubject,
  CaseStudy,
  CaseStudyModule,
  ModuleExercise,
  ClassCaseStudyEnrollment,
  EnrollmentStudent,
  FinalSubmission,
  User,
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
  shortDescription: string;
  details: string;
  promptHint?: string;
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
  shortDescription: string;
  details: string;
  promptHint?: string;
  orderNumber: number;
}

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

export type CaseStudyWithModulesAndExercises = CaseStudy & {
  modules?: Array<
    CaseStudyModule & {
      exercises?: ModuleExercise[];
    }
  >;
};

export type EnrollmentWithRelations = ClassCaseStudyEnrollment & {
  caseStudy?: {
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
