export interface CaseStudy {
  id: string;
  title: string;
  company: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  // Student-related properties
  progress?: number;
  status?: 'not-started' | 'in-progress' | 'completed';
  studentsEnrolled?: number;
  isAssigned?: boolean;
  assignedBy?: string;
  assignedDate?: string;
  // Professor-related properties
  course?: string;
  isActive?: boolean;
  studentsAssigned?: string[];
  createdDate?: string;
}

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
  currentModel: string;
  currentExercise: string;
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
