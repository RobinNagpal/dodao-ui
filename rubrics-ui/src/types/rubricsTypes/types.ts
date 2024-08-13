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
  criteriaId?: string;
}

export interface Rubric {
  name: string;
  summary?: string;
  description?: string;
  levels: RubricCell[];
  criteria: string;
  cells?: any[];
}

export interface NewRubric {
  name: string;
  summary?: string;
  description?: string;
  rows: {
    criteria: string;
    levels: {
      columnName: string;
      description: string;
      score: number;
    }[];
    cells?: any[]; // Optional, for additional data if needed
  }[];
}
export interface RubricLevel {
  columnName: string;
  description: string;
  score: number;
}

export interface RubricRow {
  criteria: string;
  levels: RubricLevel[];
  cells?: any[]; // Add this if you need additional cell-level data
}
// export interface RubricsPageProps {
//   selectedProgramId?: string | null;
//   isEditAccess?: boolean;
//   rateRubricsFormatted?: RubricServerData;
//   writeAccess?: boolean;
//   rubricName?: string;
//   handleDropdownSelect?: (key: string) => void;
// }
export interface RubricsPageProps extends EditRubricsProps {
  selectedProgramId?: string | null;
  isEditAccess?: boolean;
  rateRubricsFormatted?: any;
  writeAccess?: boolean;
  rubricName?: string;
  handleDropdownSelect?: (key: string) => void;
  rubricId?: string;
  editRubricsFormatted?: RubricServerData;
  isGlobalAccess?: boolean;
  editRubrics?: any;
  editCriteriaOrder?: any;
  editRatingHeaders?: any;
  editColumnScores?: number[];
  editCriteriaIds?: any;
  rubricCellIds?: any;
}

export interface ProgramListProps {
  programs?: Program[];
  summary?: string;
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
  isEditAccess: boolean | undefined;
  onEditClick: (type: 'rubric', criteria: string, index: number, newValue?: string) => void;
  handleCommentModal: (cellIndex: number) => void;
  rubricRatingHeaders?: rubricRatingHeader[];
  className: string;
  onClick: () => void;
  isClicked: boolean;
  cellIds?: cellIds[];
  isGlobalAccess?: boolean;
  onCellValueChange?: any;
}

export interface RubricLevelProps {
  header: string;
  index: number;
  score: number;
  isEditAccess: boolean | undefined;
  onScoreChange: (index: number, score: number) => void;
  onEditClick: (type: 'header', criteria: number, index: number) => void;
  isGlobalAccess?: boolean;
}
export interface RubricCriteriaProps {
  criteria: string;
  rubrics?: Record<string, string[]>;
  isEditAccess: boolean | undefined;
  onEditClick: (type: 'rubric' | 'header' | 'criteria', criteria: string | number, index: number) => void;
  onDeleteCriteria: (criteria: string) => void;
  rubricCell?: RubricCell[];
  rubricRatingHeaders?: rubricRatingHeader[];
  cellIds?: cellIds[];
  rubricId?: string;
  writeAccess?: boolean;
  isGlobalAccess?: boolean;
  editCriteriaIds?: any;
  rubricCellIds?: any;
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

export interface SessionProps {
  userId: string;
  user: {
    name: string;
  };
  expires: string;
  username: string;
  authProvider: string;
  spaceId: string;
  id: string;
  dodaoAccessToken: string;
  isAdminOfSpace: boolean | null;
}

export interface RateRubricProps {
  params: {
    id: string;
  };
}

export interface Level {
  id: string;
  columnName: string;
  description: string;
  score: number;
}

export interface Criterion {
  id: string;
  title: string;
}
export interface cellIds {
  criteriaId: string;
  levelId: string;
  cellId: string;
  description: string;
}
export interface RubricServerData {
  id: string;
  description: string;
  levelId: string;
  criteriaId: string;
  criteriaOrder: [];
  cellIds: cellIds[];
  rubricId: string;
}

export interface ProgramServerProps {
  id: string;
  name: string;
  summary: string;
}

export interface RubricServerData {
  id: string;
  name: string;
  summary: string;
  description: string;
  levels: Level[];
  rubric: Record<string, string[]>;
  rubricCell: RubricCell[];
  programs: ProgramDetails[];

  ratingHeaders: rubricRatingHeader[] | undefined;
}
export interface rubricRatingHeader {
  header: string;
  score: number;
}
export interface ProgramDetails {
  name: string;
  summary: string;
}

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: string;
  setComment: (comment: string) => void;
  handleSave: () => void;
  criteria: string;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}
export interface EditRubricsProps {
  rubricDetails?: {
    name: string;
    summary: string;
    description: string;
  };

  writeAccess?: boolean;
  selectedProgramId?: any;
}
export interface EditRubricCell {
  cellId: string;
  description: string;
}

export interface RubricMap {
  [key: string]: EditRubricCell[];
}

export interface SampleData {
  name: string;
  rubricId: string;
  criteriaOrder: string[];
  rubric: RubricMap;
  ratingHeaders: { header: string; score: number; id: string }[];
  programs: { name: string; summary: string }[];
  details?: string;
  summary?: string;
  criteriaIds?: string[];
}
export interface NewCell {
  description: string;
  ratingHeaderId: string;
}

export interface NewCriteriaRequest {
  rubricId: string;
  title: string;
  cells: NewCell[];
}
export type RubricLevels = {
  columnName: string;
  description: string;
  score: number;
};
export interface RatingHeader {
  id: string;
  header: string;
  score: number;
}
export interface CriteriaMapping {
  [key: string]: string;
}

export interface CriteriaChange {
  id: string;
  oldValue: string;
  newValue: string;
}
export interface EditRubricProps {
  rubricId: string;
}
export type SpaceWithIntegrationsFragment = {
  __typename?: 'Space';
  id: string;
  creator: string;
  features: Array<string>;
  name: string;
  type?: string;
  skin?: string;
  avatar?: string | null;
  domains: Array<string>;
  botDomains?: Array<string> | null;
  admins?: Array<string>;
  adminUsernames?: Array<string>;
  inviteLinks?: {
    __typename?: 'SpaceInviteLinks';
    discordInviteLink?: string | null;
    showAnimatedButtonForDiscord?: boolean | null;
    telegramInviteLink?: string | null;
    showAnimatedButtonForTelegram?: boolean | null;
  } | null;
  adminUsernamesV1: Array<{ __typename?: 'UsernameAndName'; username: string; nameOfTheUser: string }>;
  spaceIntegrations?: {
    __typename?: 'SpaceIntegrations';
    academyRepository?: string | null;
    discordGuildId?: string | null;
    projectGalaxyTokenLastFour?: string | null;
    gitGuideRepositories?: Array<{
      __typename?: 'SpaceGitRepository';
      authenticationToken?: string | null;
      gitRepoType?: string | null;
      repoUrl: string;
    }> | null;
    gnosisSafeWallets?: Array<{
      __typename?: 'GnosisSafeWallet';
      id: string;
      chainId: number;
      order: number;
      tokenContractAddress: string;
      walletAddress: string;
      walletName: string;
    }> | null;
    loadersInfo?: { __typename?: 'SpaceLoadersInfo'; discourseUrl?: string | null; discordServerId?: string | null } | null;
  } | null;
  authSettings: { __typename?: 'AuthSettings'; loginOptions?: Array<string> | null; enableLogin?: boolean | null };
  socialSettings?: { __typename?: 'SocialSettings'; linkedSharePdfBackgroundImage?: string | null };
  guideSettings?: {
    __typename?: 'GuideSettings';
    askForLoginToSubmit?: boolean | null;
    captureRating?: boolean | null;
    showCategoriesInSidebar?: boolean | null;
    showIncorrectAfterEachStep?: boolean | null;
    showIncorrectOnCompletion?: boolean | null;
  };
  byteSettings?: {
    __typename?: 'ByteSettings';
    askForLoginToSubmit?: boolean | null;
    captureRating?: boolean | null;
    showCategoriesInSidebar?: boolean | null;
  };
  themeColors?: {
    __typename?: 'ThemeColors';
    primaryColor: string;
    bgColor: string;
    textColor: string;
    linkColor: string;
    headingColor: string;
    borderColor: string;
    blockBg: string;
  } | null;
  tidbitsHomepage?: { __typename?: 'TidbitsHomepage'; heading: string; shortDescription: string } | null;
};
