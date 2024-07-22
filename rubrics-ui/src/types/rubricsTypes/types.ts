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

export interface RubricCellProps {
  cell: string;
  criteria: string;
  cellIndex: number;
  isEditAccess: boolean;
  onEditClick: (type: 'rubric', criteria: string, index: number) => void;
}
export interface RubricLevelProps {
  header: string;
  index: number;
  score: number;
  isEditAccess: boolean;
  onScoreChange: (index: number, score: number) => void;
  onEditClick: (type: 'header', criteria: number, index: number) => void;
}
export interface RubricCriteriaProps {
  criteria: string;
  rubrics: Record<string, string[]>;
  isEditAccess: boolean;
  onEditClick: (type: 'rubric' | 'header' | 'criteria', criteria: string | number, index: number) => void;
  onDeleteCriteria: (criteria: string) => void;
}

export interface ProgramListProps {
  id: string;
  name: string;
  details: string;
}

export interface RubricListProps {
  id: string;
  name: string;
  summary: string;
}
