export interface Program {
  id: string;
  name: string;
  details?: string | null;
  rating: number;
  rubrics: Rubric[];
}
export interface ServerResponse {
  status: number;
  body: Program[];
}

export interface Rubric {
  id: string;
  name: string;
  summary: string;
  description?: string | null;
  criteria: string[];
  programId: string;
  program: Program;
  rubricEvaluationParameters: RubricEvaluationParameter[];
  rubricEvaluationParameterRatings: RubricEvaluationParameterRating[];
}

export interface RubricEvaluationParameter {
  id: string;
  rubricId: string;
  rubric: Rubric;
  title: string;
  description: string;
  rubricEvaluationParameterRatings: RubricEvaluationParameterRating[];
}

export interface RubricEvaluationParameterRating {
  id: string;
  rubricId: string;
  rubric: Rubric;
  rubricEvaluationParameterId: string;
  rubricEvaluationParameter: RubricEvaluationParameter;
  description: string;
  rating: number;
}

export interface ProgramListProps {
  programs?: Program[];
}

export interface Program {
  id: string;
  name: string;
  details?: string | null;
  rating: number;
  rubrics: Rubric[];
}

export interface Rubric {
  id: string;
  name: string;
  summary: string;
  description?: string | null;
  criteria: string[];
  programId: string;
  program: Program;
  rubricEvaluationParameters: RubricEvaluationParameter[];
  rubricEvaluationParameterRatings: RubricEvaluationParameterRating[];
}

export interface RubricEvaluationParameter {
  id: string;
  rubricId: string;
  rubric: Rubric;
  title: string;
  description: string;
  rubricEvaluationParameterRatings: RubricEvaluationParameterRating[];
}

export interface RubricEvaluationParameterRating {
  id: string;
  rubricId: string;
  rubric: Rubric;
  rubricEvaluationParameterId: string;
  rubricEvaluationParameter: RubricEvaluationParameter;
  description: string;
  rating: number;
}
export interface RubricsPageProps {
  programs?: Program[];
}

export interface ProgramDropDownProps {
  onSelectProgram: (id: string) => void;
  serverResponse: ServerResponse;
  setServerResponse: React.Dispatch<React.SetStateAction<ServerResponse>>;
}
