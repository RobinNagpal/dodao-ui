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
}

export interface ProgramListProps {
  programs?: Program[];
}

export interface RubricsPageProps {
  programs?: Program[];
}

export interface ProgramDropDownProps {
  onSelectProgram: (id: string) => void;
  serverResponse: ServerResponse;
  setServerResponse: React.Dispatch<React.SetStateAction<ServerResponse>>;
}
