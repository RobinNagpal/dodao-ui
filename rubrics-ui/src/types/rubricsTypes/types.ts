import { Program, RubricCell, RubricCriteria, RubricLevel } from '@prisma/client';

export interface RubricWithEntities {
  id: string;
  name: string;
  summary: string;
  description: string | null;
  spaceId: string;
  levels: RubricLevel[];
  criterias: RubricCriteria[];
  cells: RubricCell[];
  programs: Program[];
}
export interface RubricCellSelection {
  id: string;
  rubricId: string;
  userId: string;
  selections: {
    id: string;
    rubricCellId: string;
    rubricRatingId: string;
    comment: string;
    userId: string;
  }[];
}
export interface ProgramServerResponse {
  status: number;
  body: Program[];
}

export interface Rubric {
  id: string;
  name: string;
  summary: string;
  description?: string;
  levels: RubricCell[];
  criteria: string;
  cells?: any[];
}

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
  space: SpaceWithIntegrationsFragment;
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
  rubricRatingHeaders?: RubricRatingHeader[];
  className: string;
  onClick: () => void;
  isClicked: boolean;
  cellIds?: CellIds[];
  isGlobalAccess?: boolean;
  onCellValueChange?: any;
}

export interface RubricCriteriaProps {
  criteria: string;
  rubrics?: Record<string, string[]>;
  isEditAccess: boolean | undefined;
  onEditClick: (type: 'rubric' | 'header' | 'criteria', criteria: string | number, index: number) => void;
  onDeleteCriteria: (criteria: string) => void;
  rubricCell?: RubricCell[];
  rubricRatingHeaders?: RubricRatingHeader[];
  cellIds?: CellIds[];
  rubricId?: string;
  writeAccess?: boolean;
  isGlobalAccess?: boolean;
  editCriteriaIds?: any;
  rubricCellIds?: any;
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

export interface CellIds {
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
  cellIds: CellIds[];
  rubricId: string;
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

  ratingHeaders: RubricRatingHeader[] | undefined;
}
export interface RubricRatingHeader {
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
  space: SpaceWithIntegrationsFragment;
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
