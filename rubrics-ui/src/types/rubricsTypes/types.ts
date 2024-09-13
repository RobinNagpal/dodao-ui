import { Program, RatingCellSelection, RubricCell, RubricCriteria, RubricLevel } from '@prisma/client';

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

export interface RubricRatingWithEntities {
  id: string;
  rubricId: string;
  userId: string;
  selections: RatingCellSelection[];
  status: 'inProgress ' | 'finalized';
}

//------------ Request Types -------------//

export interface RubricCellRatingRequest {
  rubricId: string;
  cellId: string;
  comment: string;
}

//------------ Other Types -------------//

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

export interface ProgramFormType {
  name: string;
  details: string;
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
export type UserRatingSubmission = {
  criteriaId: string;
  criteriaName: string;
  score: number;
  description: string;
  comment: string;
};
export interface AverageScoresData {
  name: string;
  summary: string;
  averageScores: {
    criteriaId: string;
    criteriaName: string;
    averageScore: number;
    description: string;
  }[];
  ratingSubmissions: {
    userId: string;
    submissions: {
      criteriaId: string;
      criteriaName: string;
      score: number;
      description: string;
      comment: string;
    }[];
  }[];
}
