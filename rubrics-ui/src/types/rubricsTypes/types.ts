export interface Program {
  id: number;
  name: string;
  details?: string | null;
  rating: number;
  summary: string;
  rubrics: Rubric[];
}
export interface ProgramServerResponse {
  status: number;
  body: Program[];
}
export interface RubricCell {
  columnName: string;
  description: string;
  score: number;
}

export interface Rubric {
  name: string;
  summary?: string;
  description?: string;
  levels: RubricCell[];
  criteria: string;
  cells?: any[];
}

export interface RubricsPageProps {
  selectedProgramId: string | null;
  isEditAccess?: boolean;
}

export interface ProgramListProps {
  programs?: Program[];
}

export interface ProgramDropDownProps {
  onSelectProgram: (id: string) => void;
  serverResponse: ProgramServerResponse;
  setServerResponse: React.Dispatch<React.SetStateAction<ProgramServerResponse>>;
}

export interface EditProgramRubricProps {
  id: string;
  name: string;
  summary: string;
}
export interface ProgramForm {
  name: string;
  details: string;
  summary: string;
}
