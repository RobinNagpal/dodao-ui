import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Any: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: any;
}

export interface AcademyTask {
  __typename?: 'AcademyTask';
  createdAt: Scalars['Int'];
  createdBy: Scalars['String'];
  details: Scalars['String'];
  excerpt: Scalars['String'];
  items: Array<GuideStepItem>;
  prerequisiteCourses: Array<SummarizedGitCourse>;
  prerequisiteGuides: Array<Guide>;
  spaceId: Scalars['String'];
  status: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['Int'];
  updatedBy: Scalars['String'];
  uuid: Scalars['String'];
}

export interface AddTopicExplanationInput {
  courseKey: Scalars['String'];
  details: Scalars['String'];
  shortTitle: Scalars['String'];
  title: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface AddTopicInput {
  courseKey: Scalars['String'];
  details: Scalars['String'];
  title: Scalars['String'];
}

export interface AddTopicQuestionInput {
  answerKeys: Array<Scalars['String']>;
  choices: Array<TopicQuestionChoiceInput>;
  content: Scalars['String'];
  courseKey: Scalars['String'];
  explanation: Scalars['String'];
  hint: Scalars['String'];
  questionType: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface AddTopicSummaryInput {
  courseKey: Scalars['String'];
  details: Scalars['String'];
  shortTitle: Scalars['String'];
  title: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface AddTopicVideoInput {
  courseKey: Scalars['String'];
  details: Scalars['String'];
  shortTitle: Scalars['String'];
  title: Scalars['String'];
  topicKey: Scalars['String'];
  url: Scalars['String'];
}

export interface Byte {
  __typename?: 'Byte';
  admins: Array<Scalars['String']>;
  content: Scalars['String'];
  created: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  postSubmissionStepContent?: Maybe<Scalars['String']>;
  priority: Scalars['Int'];
  publishStatus: Scalars['String'];
  showIncorrectOnCompletion: Scalars['Boolean'];
  steps: Array<ByteStep>;
  tags: Array<Scalars['String']>;
  visibility?: Maybe<Scalars['String']>;
}

export interface ByteQuestion {
  __typename?: 'ByteQuestion';
  answerKeys: Array<Scalars['String']>;
  choices: Array<QuestionChoice>;
  content: Scalars['String'];
  explanation: Scalars['String'];
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface ByteStep {
  __typename?: 'ByteStep';
  content: Scalars['String'];
  name: Scalars['String'];
  stepItems: Array<ByteStepItem>;
  uuid: Scalars['String'];
}

export interface ByteStepInput {
  content: Scalars['String'];
  name: Scalars['String'];
  stepItems: Array<StepItemInputGenericInput>;
  uuid: Scalars['String'];
}

export type ByteStepItem = ByteQuestion | ByteUserInput | UserDiscordConnect;

export interface ByteStepItemSubmission {
  __typename?: 'ByteStepItemSubmission';
  selectedAnswerKeys?: Maybe<Array<Scalars['String']>>;
  type: Scalars['String'];
  userDiscordInfo?: Maybe<UserDiscordInfo>;
  userInput?: Maybe<Scalars['String']>;
  uuid: Scalars['String'];
}

export interface ByteStepItemSubmissionInput {
  type: Scalars['String'];
  userDiscordInfo?: InputMaybe<UserDiscordInfoInput>;
  userInput?: InputMaybe<Scalars['String']>;
  uuid: Scalars['String'];
}

export interface ByteStepSubmission {
  __typename?: 'ByteStepSubmission';
  itemResponses: Array<ByteStepItemSubmission>;
  uuid: Scalars['String'];
}

export interface ByteStepSubmissionInput {
  itemResponses: Array<ByteStepItemSubmissionInput>;
  uuid: Scalars['String'];
}

export interface ByteSubmission {
  __typename?: 'ByteSubmission';
  byteId: Scalars['String'];
  created: Scalars['String'];
  createdBy: Scalars['String'];
  id: Scalars['String'];
  spaceId: Scalars['String'];
}

export interface ByteSubmissionInput {
  byteId: Scalars['String'];
  from: Scalars['String'];
  space: Scalars['String'];
  steps: Array<ByteStepSubmissionInput>;
  timestamp?: InputMaybe<Scalars['String']>;
  uuid: Scalars['String'];
}

export interface ByteUserInput {
  __typename?: 'ByteUserInput';
  label: Scalars['String'];
  required: Scalars['Boolean'];
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface ChatCompletionAiInput {
  messages: Array<OpenAiChatMessageInput>;
  model?: InputMaybe<Scalars['String']>;
}

export enum ChatCompletionRequestMessageRoleEnum {
  Assistant = 'assistant',
  System = 'system',
  User = 'user'
}

export interface CompletionAiInput {
  model?: InputMaybe<Scalars['String']>;
  prompt: Scalars['String'];
}

export interface CourseBasicInfoInput {
  courseAdmins: Array<Scalars['String']>;
  courseFailContent?: InputMaybe<Scalars['String']>;
  coursePassContent?: InputMaybe<Scalars['String']>;
  coursePassCount?: InputMaybe<Scalars['Int']>;
  details: Scalars['String'];
  duration: Scalars['String'];
  highlights: Array<Scalars['String']>;
  key: Scalars['String'];
  priority?: InputMaybe<Scalars['Int']>;
  publishStatus: Scalars['String'];
  summary: Scalars['String'];
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  topicConfig?: InputMaybe<TopicConfigInput>;
}

export interface CourseIntegrations {
  __typename?: 'CourseIntegrations';
  discordRoleIds?: Maybe<Array<Scalars['String']>>;
  discordRolePassingCount?: Maybe<Scalars['Int']>;
  discordWebhook?: Maybe<Scalars['String']>;
  projectGalaxyCredentialId?: Maybe<Scalars['String']>;
  projectGalaxyOatMintUrl?: Maybe<Scalars['String']>;
  projectGalaxyOatMintedContent?: Maybe<Scalars['String']>;
  projectGalaxyOatPassingCount?: Maybe<Scalars['Int']>;
}

export interface CourseReadingQuestion {
  __typename?: 'CourseReadingQuestion';
  answerKeys: Array<Scalars['String']>;
  choices: Array<GitCourseQuestionChoice>;
  content: Scalars['String'];
  explanation: Scalars['String'];
  hint: Scalars['String'];
  timeInSec: Scalars['Int'];
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface CourseSubmissionInput {
  courseKey: Scalars['String'];
  uuid: Scalars['String'];
}

export interface CreateCompletionResponseChoice {
  __typename?: 'CreateCompletionResponseChoice';
  finish_reason?: Maybe<Scalars['String']>;
  index?: Maybe<Scalars['Int']>;
  logprobs?: Maybe<OpenAiChoiceLogprobs>;
  text?: Maybe<Scalars['String']>;
}

export interface CreateSignedUrlInput {
  contentType: Scalars['String'];
  imageType: Scalars['String'];
  name: Scalars['String'];
  objectId: Scalars['String'];
}

export interface DeleteTopicExplanationInput {
  courseKey: Scalars['String'];
  explanationKey: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface DeleteTopicInput {
  courseKey: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface DeleteTopicQuestionInput {
  courseKey: Scalars['String'];
  questionUuid: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface DeleteTopicSummaryInput {
  courseKey: Scalars['String'];
  summaryKey: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface DeleteTopicVideoInput {
  courseKey: Scalars['String'];
  topicKey: Scalars['String'];
  videoUuid: Scalars['String'];
}

export interface ExtractRelevantTextForTopicInput {
  content: Scalars['String'];
  topic: Scalars['String'];
}

export interface GenericCourse {
  __typename?: 'GenericCourse';
  categories: Array<Scalars['String']>;
  content: Scalars['String'];
  courseAdmins?: Maybe<Array<Scalars['String']>>;
  courseType: Scalars['String'];
  duration: Scalars['String'];
  excerpt: Scalars['String'];
  highlights: Array<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  priority?: Maybe<Scalars['Int']>;
  publishStatus: Scalars['String'];
  thumbnail: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GitCourse {
  __typename?: 'GitCourse';
  courseAdmins?: Maybe<Array<Scalars['String']>>;
  courseFailContent?: Maybe<Scalars['String']>;
  coursePassContent?: Maybe<Scalars['String']>;
  coursePassCount?: Maybe<Scalars['Int']>;
  details: Scalars['String'];
  duration: Scalars['String'];
  highlights: Array<Scalars['String']>;
  key: Scalars['String'];
  priority?: Maybe<Scalars['Int']>;
  publishStatus: Scalars['String'];
  summary: Scalars['String'];
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  topicConfig?: Maybe<TopicConfig>;
  topics: Array<GitCourseTopic>;
}

export interface GitCourseExplanation {
  __typename?: 'GitCourseExplanation';
  details: Scalars['String'];
  key: Scalars['String'];
  shortTitle: Scalars['String'];
  title: Scalars['String'];
}

export interface GitCourseExplanationsSubmission {
  __typename?: 'GitCourseExplanationsSubmission';
  key: Scalars['String'];
  status: Scalars['String'];
}

export interface GitCourseExplanationsSubmissionInput {
  key: Scalars['String'];
  status: Scalars['String'];
}

export interface GitCourseInput {
  courseJsonUrl?: InputMaybe<Scalars['String']>;
  courseRepoUrl?: InputMaybe<Scalars['String']>;
  publishStatus: Scalars['String'];
  weight: Scalars['Int'];
}

export interface GitCourseQuestion {
  __typename?: 'GitCourseQuestion';
  answerKeys: Array<Scalars['String']>;
  choices: Array<GitCourseQuestionChoice>;
  content: Scalars['String'];
  explanation: Scalars['String'];
  hint: Scalars['String'];
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GitCourseQuestionChoice {
  __typename?: 'GitCourseQuestionChoice';
  content: Scalars['String'];
  key: Scalars['String'];
}

export interface GitCourseQuestionsSubmission {
  __typename?: 'GitCourseQuestionsSubmission';
  answers: Array<Scalars['String']>;
  status: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GitCourseQuestionsSubmissionInput {
  answers: Array<Scalars['String']>;
  status: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GitCourseReading {
  __typename?: 'GitCourseReading';
  details: Scalars['String'];
  questions?: Maybe<Array<CourseReadingQuestion>>;
  shortTitle: Scalars['String'];
  title: Scalars['String'];
  type: Scalars['String'];
  url: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GitCourseReadingsSubmission {
  __typename?: 'GitCourseReadingsSubmission';
  questions: Array<GitCourseQuestionsSubmission>;
  status: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GitCourseReadingsSubmissionInput {
  questions: Array<GitCourseQuestionsSubmissionInput>;
  status: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GitCourseSubmission {
  __typename?: 'GitCourseSubmission';
  courseKey: Scalars['String'];
  createdAt: Scalars['Int'];
  createdBy: Scalars['String'];
  galaxyCredentialsUpdated?: Maybe<Scalars['Boolean']>;
  isLatestSubmission?: Maybe<Scalars['Boolean']>;
  questionsAttempted?: Maybe<Scalars['Int']>;
  questionsCorrect?: Maybe<Scalars['Int']>;
  questionsIncorrect?: Maybe<Scalars['Int']>;
  questionsSkipped?: Maybe<Scalars['Int']>;
  spaceId: Scalars['String'];
  status: Scalars['String'];
  topicSubmissions: Array<GitCourseTopicSubmission>;
  updatedAt: Scalars['Int'];
  uuid: Scalars['String'];
}

export interface GitCourseSummariesSubmission {
  __typename?: 'GitCourseSummariesSubmission';
  key: Scalars['String'];
  status: Scalars['String'];
}

export interface GitCourseSummariesSubmissionInput {
  key: Scalars['String'];
  status: Scalars['String'];
}

export interface GitCourseSummary {
  __typename?: 'GitCourseSummary';
  details: Scalars['String'];
  key: Scalars['String'];
  shortTitle: Scalars['String'];
  title: Scalars['String'];
}

export interface GitCourseTopic {
  __typename?: 'GitCourseTopic';
  details: Scalars['String'];
  explanations: Array<GitCourseExplanation>;
  key: Scalars['String'];
  questions: Array<GitCourseQuestion>;
  readings: Array<GitCourseReading>;
  summaries: Array<GitCourseSummary>;
  title: Scalars['String'];
}

export interface GitCourseTopicCorrectAnswer {
  __typename?: 'GitCourseTopicCorrectAnswer';
  answerKeys: Array<Scalars['String']>;
  uuid: Scalars['String'];
}

export interface GitCourseTopicSubmission {
  __typename?: 'GitCourseTopicSubmission';
  correctAnswers?: Maybe<Array<GitCourseTopicCorrectAnswer>>;
  courseKey: Scalars['String'];
  courseSubmissionUuid: Scalars['String'];
  createdAt: Scalars['Int'];
  createdBy: Scalars['String'];
  isLatestSubmission: Scalars['Boolean'];
  questionsAttempted?: Maybe<Scalars['Int']>;
  questionsCorrect?: Maybe<Scalars['Int']>;
  questionsIncorrect?: Maybe<Scalars['Int']>;
  questionsSkipped?: Maybe<Scalars['Int']>;
  spaceId: Scalars['String'];
  status: Scalars['String'];
  submission?: Maybe<GitCourseTopicSubmissionJson>;
  topicKey: Scalars['String'];
  updatedAt: Scalars['Int'];
  uuid: Scalars['String'];
}

export interface GitCourseTopicSubmissionInput {
  courseKey: Scalars['String'];
  explanations: Array<GitCourseExplanationsSubmissionInput>;
  questions: Array<GitCourseQuestionsSubmissionInput>;
  readings: Array<GitCourseReadingsSubmissionInput>;
  status: Scalars['String'];
  summaries: Array<GitCourseSummariesSubmissionInput>;
  topicKey: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GitCourseTopicSubmissionJson {
  __typename?: 'GitCourseTopicSubmissionJson';
  courseKey: Scalars['String'];
  explanations?: Maybe<Array<GitCourseExplanationsSubmission>>;
  questions?: Maybe<Array<GitCourseQuestionsSubmission>>;
  readings?: Maybe<Array<GitCourseReadingsSubmission>>;
  status: Scalars['String'];
  summaries?: Maybe<Array<GitCourseSummariesSubmission>>;
  topicKey: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GnosisSafeWallet {
  __typename?: 'GnosisSafeWallet';
  chainId: Scalars['Int'];
  id: Scalars['String'];
  order: Scalars['Int'];
  tokenContractAddress: Scalars['String'];
  walletAddress: Scalars['String'];
  walletName: Scalars['String'];
}

export interface GnosisSafeWalletInput {
  chainId: Scalars['Int'];
  id: Scalars['String'];
  order: Scalars['Int'];
  tokenContractAddress: Scalars['String'];
  walletAddress: Scalars['String'];
  walletName: Scalars['String'];
}

export interface Guide {
  __typename?: 'Guide';
  authors: Array<Scalars['String']>;
  categories: Array<Scalars['String']>;
  content: Scalars['String'];
  created: Scalars['Int'];
  guideIntegrations: GuideIntegrations;
  guideSource: Scalars['String'];
  guideType: Scalars['String'];
  id: Scalars['String'];
  link: Scalars['String'];
  name: Scalars['String'];
  postSubmissionStepContent?: Maybe<Scalars['String']>;
  previousId?: Maybe<Scalars['String']>;
  publishStatus: Scalars['String'];
  showIncorrectOnCompletion: Scalars['Boolean'];
  socialShareImage?: Maybe<Scalars['String']>;
  steps: Array<GuideStep>;
  thumbnail?: Maybe<Scalars['String']>;
  uuid: Scalars['String'];
  version: Scalars['Int'];
}

export interface GuideInput {
  categories: Array<Scalars['String']>;
  content: Scalars['String'];
  from: Scalars['String'];
  guideIntegrations: GuideIntegrationsInput;
  guideSource: Scalars['String'];
  guideType: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  postSubmissionStepContent?: InputMaybe<Scalars['String']>;
  publishStatus: Scalars['String'];
  showIncorrectOnCompletion: Scalars['Boolean'];
  socialShareImage?: InputMaybe<Scalars['String']>;
  space: Scalars['String'];
  steps: Array<GuideStepInput>;
  thumbnail?: InputMaybe<Scalars['String']>;
  uuid: Scalars['String'];
}

export interface GuideIntegrations {
  __typename?: 'GuideIntegrations';
  discordRoleIds?: Maybe<Array<Scalars['String']>>;
  discordRolePassingCount?: Maybe<Scalars['Int']>;
  discordWebhook?: Maybe<Scalars['String']>;
  projectGalaxyCredentialId?: Maybe<Scalars['String']>;
  projectGalaxyOatMintUrl?: Maybe<Scalars['String']>;
  projectGalaxyOatPassingCount?: Maybe<Scalars['Int']>;
}

export interface GuideIntegrationsInput {
  discordRoleIds: Array<Scalars['String']>;
  discordRolePassingCount?: InputMaybe<Scalars['Int']>;
  discordWebhook?: InputMaybe<Scalars['String']>;
  projectGalaxyCredentialId?: InputMaybe<Scalars['String']>;
  projectGalaxyOatMintUrl?: InputMaybe<Scalars['String']>;
  projectGalaxyOatPassingCount?: InputMaybe<Scalars['Int']>;
}

export interface GuideQuestion {
  __typename?: 'GuideQuestion';
  answerKeys: Array<Scalars['String']>;
  choices: Array<QuestionChoice>;
  content: Scalars['String'];
  order: Scalars['Int'];
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GuideQuestionInput {
  answerKeys?: InputMaybe<Array<Scalars['String']>>;
  choices?: InputMaybe<Array<QuestionChoiceInput>>;
  content: Scalars['String'];
  explanation?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['Int']>;
  questionType: Scalars['String'];
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface GuideStep {
  __typename?: 'GuideStep';
  content: Scalars['String'];
  created: Scalars['Int'];
  id: Scalars['String'];
  name: Scalars['String'];
  order: Scalars['Int'];
  stepItems: Array<GuideStepItem>;
  uuid: Scalars['String'];
}

export interface GuideStepInput {
  content: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  order: Scalars['Int'];
  stepItems: Array<StepItemInputGenericInput>;
  uuid: Scalars['String'];
}

export type GuideStepItem = GuideQuestion | GuideUserInput | UserDiscordConnect;

export interface GuideStepItemSubmission {
  __typename?: 'GuideStepItemSubmission';
  selectedAnswerKeys?: Maybe<Array<Scalars['String']>>;
  type: Scalars['String'];
  userDiscordInfo?: Maybe<UserDiscordInfo>;
  userInput?: Maybe<Scalars['String']>;
  uuid: Scalars['String'];
}

export interface GuideStepItemSubmissionInput {
  selectedAnswerKeys?: InputMaybe<Array<Scalars['String']>>;
  type: Scalars['String'];
  userDiscordInfo?: InputMaybe<UserDiscordInfoInput>;
  userInput?: InputMaybe<Scalars['String']>;
  uuid: Scalars['String'];
}

export interface GuideStepSubmission {
  __typename?: 'GuideStepSubmission';
  itemResponses: Array<GuideStepItemSubmission>;
  uuid: Scalars['String'];
}

export interface GuideStepSubmissionInput {
  itemResponses: Array<GuideStepItemSubmissionInput>;
  uuid: Scalars['String'];
}

export interface GuideSubmission {
  __typename?: 'GuideSubmission';
  created: Scalars['String'];
  createdBy: Scalars['String'];
  galaxyCredentialsUpdated?: Maybe<Scalars['Boolean']>;
  guideId: Scalars['String'];
  guideUuid: Scalars['String'];
  id: Scalars['String'];
  result: GuideSubmissionResult;
  spaceId: Scalars['String'];
  steps?: Maybe<Array<GuideStepSubmission>>;
  uuid: Scalars['String'];
}

export interface GuideSubmissionInput {
  from: Scalars['String'];
  guideUuid: Scalars['String'];
  space: Scalars['String'];
  steps: Array<GuideStepSubmissionInput>;
  timestamp?: InputMaybe<Scalars['String']>;
  uuid: Scalars['String'];
}

export interface GuideSubmissionResult {
  __typename?: 'GuideSubmissionResult';
  allQuestions: Array<Scalars['String']>;
  correctQuestions: Array<Scalars['String']>;
  wrongQuestions: Array<Scalars['String']>;
}

export interface GuideUserInput {
  __typename?: 'GuideUserInput';
  label: Scalars['String'];
  order: Scalars['Int'];
  required: Scalars['Boolean'];
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface JwtResponse {
  __typename?: 'JwtResponse';
  jwt: Scalars['String'];
}

export interface MoveTopicExplanationInput {
  courseKey: Scalars['String'];
  direction: Scalars['String'];
  explanationKey: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface MoveTopicInput {
  courseKey: Scalars['String'];
  direction: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface MoveTopicQuestionInput {
  courseKey: Scalars['String'];
  direction: Scalars['String'];
  questionUuid: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface MoveTopicSummaryInput {
  courseKey: Scalars['String'];
  direction: Scalars['String'];
  summaryKey: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface MoveTopicVideoInput {
  courseKey: Scalars['String'];
  direction: Scalars['String'];
  topicKey: Scalars['String'];
  videoUuid: Scalars['String'];
}

export interface Mutation {
  __typename?: 'Mutation';
  addDiscordCredentials: Space;
  addTopic: GitCourseTopic;
  addTopicExplanation: GitCourseExplanation;
  addTopicQuestion: GitCourseQuestion;
  addTopicSummary: GitCourseSummary;
  addTopicVideo: GitCourseReading;
  askChatCompletionAI: OpenAiChatCompletionResponse;
  askCompletionAI: OpenAiCompletionResponse;
  authenticateWithUnstoppable: JwtResponse;
  createSignedUrl: Scalars['String'];
  createSpace: Space;
  createSummaryOfContent: OpenAiTextResponse;
  deleteTopic: GitCourse;
  deleteTopicExplanation: GitCourse;
  deleteTopicQuestion: GitCourse;
  deleteTopicSummary: GitCourse;
  deleteTopicVideo: GitCourse;
  downloadAndCleanContent: OpenAiTextResponse;
  extractRelevantTextForTopic: OpenAiTextResponse;
  initializeGitCourseSubmission: GitCourseSubmission;
  moveTopic: GitCourse;
  moveTopicExplanation: GitCourse;
  moveTopicQuestion: GitCourse;
  moveTopicSummary: GitCourse;
  moveTopicVideo: GitCourse;
  publishByte: Byte;
  refreshGitCourse: Scalars['Boolean'];
  refreshGitCourses: Scalars['Boolean'];
  refreshGitGuides: Scalars['Boolean'];
  saveByte: Byte;
  submitByte: ByteSubmission;
  submitGitCourse: GitCourseSubmission;
  submitGitCourseTopic: GitCourseTopicSubmission;
  submitGuide: GuideSubmission;
  updateCourseBasicInfo: GitCourse;
  updateSpace: Space;
  updateTopicBasicInfo: GitCourse;
  updateTopicExplanation: GitCourse;
  updateTopicQuestion: GitCourse;
  updateTopicSummary: GitCourse;
  updateTopicVideo: GitCourse;
  upsertAcademyTask: AcademyTask;
  upsertByte: Byte;
  upsertCourseIntegrations: CourseIntegrations;
  upsertGitCourse?: Maybe<SummarizedGitCourse>;
  upsertGitCourseTopicSubmission: GitCourseTopicSubmission;
  upsertGnosisSafeWallets: Space;
  upsertGuide: Guide;
  upsertProjectGalaxyAccessToken: Space;
  upsertSimulation: Simulation;
  upsertSpaceAcademyRepository: Space;
  upsertSpaceFeatures: Space;
  upsertSpaceGitGuideRepositories: Space;
  upsertSpaceInviteLinks: Space;
  upsertTimeline: Timeline;
}


export interface MutationAddDiscordCredentialsArgs {
  code: Scalars['String'];
  redirectUri: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationAddTopicArgs {
  spaceId: Scalars['String'];
  topicInfo: AddTopicInput;
}


export interface MutationAddTopicExplanationArgs {
  explanationInfo: AddTopicExplanationInput;
  spaceId: Scalars['String'];
}


export interface MutationAddTopicQuestionArgs {
  questionInfo: AddTopicQuestionInput;
  spaceId: Scalars['String'];
}


export interface MutationAddTopicSummaryArgs {
  spaceId: Scalars['String'];
  summaryInfo: AddTopicSummaryInput;
}


export interface MutationAddTopicVideoArgs {
  spaceId: Scalars['String'];
  videoInfo: AddTopicVideoInput;
}


export interface MutationAskChatCompletionAiArgs {
  input: ChatCompletionAiInput;
}


export interface MutationAskCompletionAiArgs {
  input: CompletionAiInput;
}


export interface MutationAuthenticateWithUnstoppableArgs {
  idToken: Scalars['String'];
}


export interface MutationCreateSignedUrlArgs {
  input: CreateSignedUrlInput;
  spaceId: Scalars['String'];
}


export interface MutationCreateSpaceArgs {
  spaceInput: UpsertSpaceInput;
}


export interface MutationCreateSummaryOfContentArgs {
  input: Scalars['String'];
}


export interface MutationDeleteTopicArgs {
  spaceId: Scalars['String'];
  topicInfo: DeleteTopicInput;
}


export interface MutationDeleteTopicExplanationArgs {
  explanationInfo: DeleteTopicExplanationInput;
  spaceId: Scalars['String'];
}


export interface MutationDeleteTopicQuestionArgs {
  questionInfo: DeleteTopicQuestionInput;
  spaceId: Scalars['String'];
}


export interface MutationDeleteTopicSummaryArgs {
  spaceId: Scalars['String'];
  summaryInfo: DeleteTopicSummaryInput;
}


export interface MutationDeleteTopicVideoArgs {
  spaceId: Scalars['String'];
  videoInfo: DeleteTopicVideoInput;
}


export interface MutationDownloadAndCleanContentArgs {
  input: Scalars['String'];
}


export interface MutationExtractRelevantTextForTopicArgs {
  input: ExtractRelevantTextForTopicInput;
}


export interface MutationInitializeGitCourseSubmissionArgs {
  courseKey: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationMoveTopicArgs {
  spaceId: Scalars['String'];
  topicInfo: MoveTopicInput;
}


export interface MutationMoveTopicExplanationArgs {
  explanationInfo: MoveTopicExplanationInput;
  spaceId: Scalars['String'];
}


export interface MutationMoveTopicQuestionArgs {
  questionInfo: MoveTopicQuestionInput;
  spaceId: Scalars['String'];
}


export interface MutationMoveTopicSummaryArgs {
  spaceId: Scalars['String'];
  summaryInfo: MoveTopicSummaryInput;
}


export interface MutationMoveTopicVideoArgs {
  spaceId: Scalars['String'];
  videoInfo: MoveTopicVideoInput;
}


export interface MutationPublishByteArgs {
  input: UpsertByteInput;
  spaceId: Scalars['String'];
}


export interface MutationRefreshGitCourseArgs {
  courseKey: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationRefreshGitCoursesArgs {
  spaceId: Scalars['String'];
}


export interface MutationRefreshGitGuidesArgs {
  spaceId: Scalars['String'];
}


export interface MutationSaveByteArgs {
  input: UpsertByteInput;
  spaceId: Scalars['String'];
}


export interface MutationSubmitByteArgs {
  submissionInput: ByteSubmissionInput;
}


export interface MutationSubmitGitCourseArgs {
  input: CourseSubmissionInput;
  spaceId: Scalars['String'];
}


export interface MutationSubmitGitCourseTopicArgs {
  gitCourseTopicSubmission: GitCourseTopicSubmissionInput;
  spaceId: Scalars['String'];
}


export interface MutationSubmitGuideArgs {
  submissionInput: GuideSubmissionInput;
}


export interface MutationUpdateCourseBasicInfoArgs {
  courseBasicInfo: CourseBasicInfoInput;
  spaceId: Scalars['String'];
}


export interface MutationUpdateSpaceArgs {
  spaceInput: UpsertSpaceInput;
}


export interface MutationUpdateTopicBasicInfoArgs {
  spaceId: Scalars['String'];
  topicInfo: UpdateTopicBasicInfoInput;
}


export interface MutationUpdateTopicExplanationArgs {
  explanationInfo: UpdateTopicExplanationInput;
  spaceId: Scalars['String'];
}


export interface MutationUpdateTopicQuestionArgs {
  questionInfo: UpdateTopicQuestionInput;
  spaceId: Scalars['String'];
}


export interface MutationUpdateTopicSummaryArgs {
  spaceId: Scalars['String'];
  summaryInfo: UpdateTopicSummaryInput;
}


export interface MutationUpdateTopicVideoArgs {
  spaceId: Scalars['String'];
  videoInfo: UpdateTopicVideoInput;
}


export interface MutationUpsertAcademyTaskArgs {
  spaceId: Scalars['String'];
  task: UpsertAcademyTaskInput;
}


export interface MutationUpsertByteArgs {
  input: UpsertByteInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertCourseIntegrationsArgs {
  courseIntegrationInput: UpsertCourseIntegrationsInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertGitCourseArgs {
  gitCourseInput: GitCourseInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertGitCourseTopicSubmissionArgs {
  gitCourseTopicSubmission: GitCourseTopicSubmissionInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertGnosisSafeWalletsArgs {
  spaceId: Scalars['String'];
  wallets: Array<GnosisSafeWalletInput>;
}


export interface MutationUpsertGuideArgs {
  guideInput: GuideInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertProjectGalaxyAccessTokenArgs {
  accessToken: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationUpsertSimulationArgs {
  input: UpsertSimulationInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertSpaceAcademyRepositoryArgs {
  academyRepository: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationUpsertSpaceFeaturesArgs {
  features: Array<Scalars['String']>;
  spaceId: Scalars['String'];
}


export interface MutationUpsertSpaceGitGuideRepositoriesArgs {
  gitGuideRepositories: Array<SpaceGitRepositoryInput>;
  spaceId: Scalars['String'];
}


export interface MutationUpsertSpaceInviteLinksArgs {
  spaceId: Scalars['String'];
  spaceInviteArgs: SpaceInviteArgs;
}


export interface MutationUpsertTimelineArgs {
  input: UpsertTimelineInput;
  spaceId: Scalars['String'];
}

export interface OpenAiChatCompletionChoice {
  __typename?: 'OpenAIChatCompletionChoice';
  finish_reason?: Maybe<Scalars['String']>;
  index?: Maybe<Scalars['Int']>;
  message?: Maybe<OpenAiMessage>;
}

export interface OpenAiChatCompletionResponse {
  __typename?: 'OpenAIChatCompletionResponse';
  choices: Array<OpenAiChatCompletionChoice>;
  created: Scalars['Int'];
  id: Scalars['ID'];
  model: Scalars['String'];
  object: Scalars['String'];
  usage?: Maybe<OpenAiUsage>;
}

export interface OpenAiChatMessageInput {
  content: Scalars['String'];
  role: ChatCompletionRequestMessageRoleEnum;
}

export interface OpenAiChoiceLogprobs {
  __typename?: 'OpenAIChoiceLogprobs';
  text?: Maybe<Scalars['String']>;
  text_offset?: Maybe<Array<Scalars['Int']>>;
  token_logprobs?: Maybe<Array<Scalars['Float']>>;
  tokens?: Maybe<Array<Scalars['String']>>;
  top_logprobs?: Maybe<Array<Scalars['Any']>>;
}

export interface OpenAiCompletionResponse {
  __typename?: 'OpenAICompletionResponse';
  choices: Array<CreateCompletionResponseChoice>;
  created: Scalars['Int'];
  id: Scalars['ID'];
  model: Scalars['String'];
  object: Scalars['String'];
  usage?: Maybe<OpenAiUsage>;
}

export interface OpenAiMessage {
  __typename?: 'OpenAIMessage';
  content?: Maybe<Scalars['String']>;
  role: Scalars['String'];
}

export interface OpenAiTextResponse {
  __typename?: 'OpenAITextResponse';
  text: Scalars['String'];
  tokenCount: Scalars['Int'];
}

export interface OpenAiUsage {
  __typename?: 'OpenAIUsage';
  completion_tokens: Scalars['Int'];
  prompt_tokens: Scalars['Int'];
  total_tokens: Scalars['Int'];
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export interface Query {
  __typename?: 'Query';
  academyTask: AcademyTask;
  academyTasks?: Maybe<Array<AcademyTask>>;
  byte: Byte;
  bytes: Array<Byte>;
  courses: Array<GitCourse>;
  gitCourse: GitCourse;
  gitCourseIntegrations?: Maybe<CourseIntegrations>;
  gitCourseSubmission?: Maybe<GitCourseSubmission>;
  gitCourseSummarized: SummarizedGitCourse;
  gitTopicSubmissions: Array<GitCourseTopicSubmission>;
  guide: Guide;
  guideSubmissions: Array<GuideSubmission>;
  guides: Array<Guide>;
  rawGitCourse: RawGitCourse;
  simulation: Simulation;
  simulations: Array<Simulation>;
  space?: Maybe<Space>;
  spaceDiscordGuild?: Maybe<Scalars['Any']>;
  spaces?: Maybe<Array<Space>>;
  timeline: Timeline;
  timelines: Array<Timeline>;
}


export interface QueryAcademyTaskArgs {
  uuid: Scalars['String'];
}


export interface QueryAcademyTasksArgs {
  spaceId: Scalars['String'];
  status?: InputMaybe<Scalars['String']>;
}


export interface QueryByteArgs {
  byteId: Scalars['String'];
  includeDraft?: InputMaybe<Scalars['Boolean']>;
  spaceId: Scalars['String'];
}


export interface QueryBytesArgs {
  spaceId: Scalars['String'];
}


export interface QueryCoursesArgs {
  spaceId: Scalars['String'];
}


export interface QueryGitCourseArgs {
  courseKey: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryGitCourseIntegrationsArgs {
  key: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryGitCourseSubmissionArgs {
  courseKey: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryGitCourseSummarizedArgs {
  key: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryGitTopicSubmissionsArgs {
  courseKey: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryGuideArgs {
  spaceId: Scalars['String'];
  uuid: Scalars['String'];
}


export interface QueryGuideSubmissionsArgs {
  guideUuid: Scalars['String'];
}


export interface QueryGuidesArgs {
  spaceId: Scalars['String'];
}


export interface QueryRawGitCourseArgs {
  key: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QuerySimulationArgs {
  simulationId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QuerySimulationsArgs {
  spaceId: Scalars['String'];
}


export interface QuerySpaceArgs {
  domain?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
}


export interface QuerySpaceDiscordGuildArgs {
  spaceId: Scalars['String'];
}


export interface QueryTimelineArgs {
  spaceId: Scalars['String'];
  timelineId: Scalars['String'];
}


export interface QueryTimelinesArgs {
  spaceId: Scalars['String'];
}

export interface QuestionChoice {
  __typename?: 'QuestionChoice';
  content: Scalars['String'];
  key: Scalars['String'];
}

export interface QuestionChoiceInput {
  content: Scalars['String'];
  key: Scalars['String'];
}

export interface RawGitCourse {
  __typename?: 'RawGitCourse';
  courseJsonUrl?: Maybe<Scalars['String']>;
  courseRepoUrl?: Maybe<Scalars['String']>;
  key: Scalars['String'];
  publishStatus: Scalars['String'];
  weight: Scalars['Int'];
}

export interface Simulation {
  __typename?: 'Simulation';
  admins: Array<Scalars['String']>;
  content: Scalars['String'];
  created: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  postSubmissionStepContent?: Maybe<Scalars['String']>;
  priority: Scalars['Int'];
  publishStatus: Scalars['String'];
  showIncorrectOnCompletion: Scalars['Boolean'];
  steps: Array<SimulationStep>;
  tags: Array<Scalars['String']>;
}

export interface SimulationStep {
  __typename?: 'SimulationStep';
  content: Scalars['String'];
  iframeUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  order: Scalars['Int'];
  uuid: Scalars['String'];
}

export interface SimulationStepInput {
  content: Scalars['String'];
  iframeUrl?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  order: Scalars['Int'];
  uuid: Scalars['String'];
}

export interface Space {
  __typename?: 'Space';
  admins: Array<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  creator: Scalars['String'];
  features: Array<Scalars['String']>;
  id: Scalars['String'];
  inviteLinks?: Maybe<SpaceInviteLinks>;
  name: Scalars['String'];
  skin: Scalars['String'];
  spaceIntegrations?: Maybe<SpaceIntegrations>;
}

export interface SpaceFilters {
  __typename?: 'SpaceFilters';
  minScore?: Maybe<Scalars['Float']>;
  onlyMembers?: Maybe<Scalars['Boolean']>;
}

export interface SpaceGitRepository {
  __typename?: 'SpaceGitRepository';
  authenticationToken?: Maybe<Scalars['String']>;
  gitRepoType?: Maybe<Scalars['String']>;
  repoUrl: Scalars['String'];
}

export interface SpaceGitRepositoryInput {
  authenticationToken?: InputMaybe<Scalars['String']>;
  gitRepoType?: InputMaybe<Scalars['String']>;
  repoUrl: Scalars['String'];
}

export interface SpaceIntegrations {
  __typename?: 'SpaceIntegrations';
  academyRepository?: Maybe<Scalars['String']>;
  discordGuildId?: Maybe<Scalars['String']>;
  gitGuideRepositories?: Maybe<Array<SpaceGitRepository>>;
  gnosisSafeWallets?: Maybe<Array<GnosisSafeWallet>>;
  projectGalaxyTokenLastFour?: Maybe<Scalars['String']>;
}

export interface SpaceIntegrationsInput {
  academyRepository?: InputMaybe<Scalars['String']>;
  discordGuildId?: InputMaybe<Scalars['String']>;
  gitGuideRepositories: Array<SpaceGitRepositoryInput>;
  gnosisSafeWallets: Array<GnosisSafeWalletInput>;
  projectGalaxyTokenLastFour?: InputMaybe<Scalars['String']>;
}

export interface SpaceInviteArgs {
  discordInviteLink?: InputMaybe<Scalars['String']>;
  showAnimatedButtonForDiscord?: InputMaybe<Scalars['Boolean']>;
  showAnimatedButtonForTelegram?: InputMaybe<Scalars['Boolean']>;
  telegramInviteLink?: InputMaybe<Scalars['String']>;
}

export interface SpaceInviteLinks {
  __typename?: 'SpaceInviteLinks';
  discordInviteLink?: Maybe<Scalars['String']>;
  showAnimatedButtonForDiscord?: Maybe<Scalars['Boolean']>;
  showAnimatedButtonForTelegram?: Maybe<Scalars['Boolean']>;
  telegramInviteLink?: Maybe<Scalars['String']>;
}

export interface SpaceInviteLinksInput {
  discordInviteLink?: InputMaybe<Scalars['String']>;
  showAnimatedButtonForDiscord?: InputMaybe<Scalars['Boolean']>;
  showAnimatedButtonForTelegram?: InputMaybe<Scalars['Boolean']>;
  telegramInviteLink?: InputMaybe<Scalars['String']>;
}

export interface SpaceWhere {
  id?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
}

export interface StepItemInputGenericInput {
  answerKeys?: InputMaybe<Array<Scalars['String']>>;
  choices?: InputMaybe<Array<QuestionChoiceInput>>;
  content?: InputMaybe<Scalars['String']>;
  explanation?: InputMaybe<Scalars['String']>;
  label?: InputMaybe<Scalars['String']>;
  questionType?: InputMaybe<Scalars['String']>;
  required?: InputMaybe<Scalars['Boolean']>;
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface SummarizedGitCourse {
  __typename?: 'SummarizedGitCourse';
  courseAdmins?: Maybe<Array<Scalars['String']>>;
  details: Scalars['String'];
  duration: Scalars['String'];
  highlights: Array<Scalars['String']>;
  key: Scalars['String'];
  priority?: Maybe<Scalars['Int']>;
  publishStatus: Scalars['String'];
  summary: Scalars['String'];
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  topics: Array<SummarizedGitCourseTopic>;
  uuid: Scalars['String'];
}

export interface SummarizedGitCourseTopic {
  __typename?: 'SummarizedGitCourseTopic';
  details: Scalars['String'];
  key: Scalars['String'];
  title: Scalars['String'];
}

export interface Timeline {
  __typename?: 'Timeline';
  admins: Array<Scalars['String']>;
  content: Scalars['String'];
  created: Scalars['String'];
  events: Array<TimelineEvent>;
  excerpt: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  priority: Scalars['Int'];
  publishStatus: Scalars['String'];
  tags: Array<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
}

export interface TimelineEvent {
  __typename?: 'TimelineEvent';
  content: Scalars['String'];
  date: Scalars['String'];
  excerpt: Scalars['String'];
  moreLink?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  order: Scalars['Int'];
  uuid: Scalars['String'];
}

export interface TopicConfig {
  __typename?: 'TopicConfig';
  showExplanations: Scalars['Boolean'];
  showHints: Scalars['Boolean'];
}

export interface TopicConfigInput {
  showExplanations: Scalars['Boolean'];
  showHints: Scalars['Boolean'];
}

export interface TopicQuestionChoiceInput {
  content: Scalars['String'];
  key: Scalars['String'];
}

export interface UpdateTopicBasicInfoInput {
  courseKey: Scalars['String'];
  details: Scalars['String'];
  title: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface UpdateTopicExplanationInput {
  courseKey: Scalars['String'];
  details: Scalars['String'];
  explanationKey: Scalars['String'];
  shortTitle: Scalars['String'];
  title: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface UpdateTopicQuestionInput {
  answerKeys: Array<Scalars['String']>;
  choices: Array<TopicQuestionChoiceInput>;
  content: Scalars['String'];
  courseKey: Scalars['String'];
  explanation: Scalars['String'];
  hint: Scalars['String'];
  questionType: Scalars['String'];
  questionUuid: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface UpdateTopicSummaryInput {
  courseKey: Scalars['String'];
  details: Scalars['String'];
  shortTitle: Scalars['String'];
  summaryKey: Scalars['String'];
  title: Scalars['String'];
  topicKey: Scalars['String'];
}

export interface UpdateTopicVideoInput {
  courseKey: Scalars['String'];
  details: Scalars['String'];
  shortTitle: Scalars['String'];
  title: Scalars['String'];
  topicKey: Scalars['String'];
  url: Scalars['String'];
  videoUuid: Scalars['String'];
}

export interface UpsertAcademyTaskInput {
  details: Scalars['String'];
  excerpt: Scalars['String'];
  items: Array<StepItemInputGenericInput>;
  prerequisiteCourseUuids: Array<Scalars['String']>;
  prerequisiteGuideUuids: Array<Scalars['String']>;
  status: Scalars['String'];
  title: Scalars['String'];
  uuid: Scalars['String'];
}

export interface UpsertByteInput {
  admins: Array<Scalars['String']>;
  content: Scalars['String'];
  created: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  priority: Scalars['Int'];
  publishStatus: Scalars['String'];
  steps: Array<ByteStepInput>;
  tags: Array<Scalars['String']>;
  thumbnail?: InputMaybe<Scalars['String']>;
  visibility?: InputMaybe<Scalars['String']>;
}

export interface UpsertCourseIntegrationsInput {
  courseKey: Scalars['String'];
  discordRoleIds: Array<Scalars['String']>;
  discordRolePassingCount?: InputMaybe<Scalars['Int']>;
  discordWebhook?: InputMaybe<Scalars['String']>;
  projectGalaxyCredentialId?: InputMaybe<Scalars['String']>;
  projectGalaxyOatMintUrl?: InputMaybe<Scalars['String']>;
  projectGalaxyOatMintedContent?: InputMaybe<Scalars['String']>;
  projectGalaxyOatPassingCount?: InputMaybe<Scalars['Int']>;
}

export interface UpsertSimulationInput {
  admins: Array<Scalars['String']>;
  content: Scalars['String'];
  created: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  priority: Scalars['Int'];
  publishStatus: Scalars['String'];
  steps: Array<SimulationStepInput>;
  tags: Array<Scalars['String']>;
  thumbnail?: InputMaybe<Scalars['String']>;
}

export interface UpsertSpaceInput {
  admins: Array<Scalars['String']>;
  avatar: Scalars['String'];
  creator: Scalars['String'];
  features: Array<Scalars['String']>;
  id: Scalars['String'];
  inviteLinks: SpaceInviteLinksInput;
  name: Scalars['String'];
  skin: Scalars['String'];
  spaceIntegrations: SpaceIntegrationsInput;
}

export interface UpsertTimelineEventInput {
  content: Scalars['String'];
  date: Scalars['String'];
  excerpt: Scalars['String'];
  moreLink?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  uuid: Scalars['String'];
}

export interface UpsertTimelineInput {
  admins: Array<Scalars['String']>;
  content: Scalars['String'];
  created: Scalars['String'];
  events: Array<UpsertTimelineEventInput>;
  excerpt: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  priority: Scalars['Int'];
  publishStatus: Scalars['String'];
  tags: Array<Scalars['String']>;
  thumbnail?: InputMaybe<Scalars['String']>;
}

export interface UserDiscordConnect {
  __typename?: 'UserDiscordConnect';
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export interface UserDiscordInfo {
  __typename?: 'UserDiscordInfo';
  accessToken: Scalars['String'];
  avatar: Scalars['String'];
  discriminator: Scalars['String'];
  email: Scalars['String'];
  id: Scalars['String'];
  username: Scalars['String'];
}

export interface UserDiscordInfoInput {
  accessToken: Scalars['String'];
  avatar: Scalars['String'];
  discriminator: Scalars['String'];
  email: Scalars['String'];
  id: Scalars['String'];
  username: Scalars['String'];
}

export interface UserInputInput {
  label: Scalars['String'];
  order?: InputMaybe<Scalars['Int']>;
  required?: InputMaybe<Scalars['Boolean']>;
  type: Scalars['String'];
  uuid: Scalars['String'];
}

export type AcademyTaskFragmentFragment = { __typename?: 'AcademyTask', uuid: string, createdAt: number, createdBy: string, excerpt: string, spaceId: string, status: string, details: string, title: string, updatedAt: number, updatedBy: string, prerequisiteCourses: Array<{ __typename?: 'SummarizedGitCourse', uuid: string, key: string, title: string, thumbnail: string }>, prerequisiteGuides: Array<{ __typename?: 'Guide', uuid: string, name: string, content: string, thumbnail?: string | null, guideType: string }>, items: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> };

export type AcademyTasksQueryVariables = Exact<{
  spaceId: Scalars['String'];
  status?: InputMaybe<Scalars['String']>;
}>;


export type AcademyTasksQuery = { __typename?: 'Query', academyTasks?: Array<{ __typename?: 'AcademyTask', uuid: string, createdAt: number, createdBy: string, excerpt: string, spaceId: string, status: string, details: string, title: string, updatedAt: number, updatedBy: string, prerequisiteCourses: Array<{ __typename?: 'SummarizedGitCourse', uuid: string, key: string, title: string, thumbnail: string }>, prerequisiteGuides: Array<{ __typename?: 'Guide', uuid: string, name: string, content: string, thumbnail?: string | null, guideType: string }>, items: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> | null };

export type AcademyTaskQueryVariables = Exact<{
  uuid: Scalars['String'];
}>;


export type AcademyTaskQuery = { __typename?: 'Query', academyTask: { __typename?: 'AcademyTask', uuid: string, createdAt: number, createdBy: string, excerpt: string, spaceId: string, status: string, details: string, title: string, updatedAt: number, updatedBy: string, prerequisiteCourses: Array<{ __typename?: 'SummarizedGitCourse', uuid: string, key: string, title: string, thumbnail: string }>, prerequisiteGuides: Array<{ __typename?: 'Guide', uuid: string, name: string, content: string, thumbnail?: string | null, guideType: string }>, items: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> } };

export type UpsertAcademyTaskMutationVariables = Exact<{
  spaceId: Scalars['String'];
  task: UpsertAcademyTaskInput;
}>;


export type UpsertAcademyTaskMutation = { __typename?: 'Mutation', upsertAcademyTask: { __typename?: 'AcademyTask', uuid: string, createdAt: number, createdBy: string, excerpt: string, spaceId: string, status: string, details: string, title: string, updatedAt: number, updatedBy: string, prerequisiteCourses: Array<{ __typename?: 'SummarizedGitCourse', uuid: string, key: string, title: string, thumbnail: string }>, prerequisiteGuides: Array<{ __typename?: 'Guide', uuid: string, name: string, content: string, thumbnail?: string | null, guideType: string }>, items: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> } };

export type AuthenticateWithUnstoppableMutationVariables = Exact<{
  idToken: Scalars['String'];
}>;


export type AuthenticateWithUnstoppableMutation = { __typename?: 'Mutation', payload: { __typename?: 'JwtResponse', jwt: string } };

export type ByteQuestionFragmentFragment = { __typename?: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> };

export type ByteUserInputFragmentFragment = { __typename?: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string };

export type ByteUserDiscordConnectFragmentFragment = { __typename?: 'UserDiscordConnect', type: string, uuid: string };

type ByteStepItem_ByteQuestion_Fragment = { __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> };

type ByteStepItem_ByteUserInput_Fragment = { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string };

type ByteStepItem_UserDiscordConnect_Fragment = { __typename: 'UserDiscordConnect', type: string, uuid: string };

export type ByteStepItemFragment = ByteStepItem_ByteQuestion_Fragment | ByteStepItem_ByteUserInput_Fragment | ByteStepItem_UserDiscordConnect_Fragment;

export type ByteStepFragment = { __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> };

export type ByteDetailsFragment = { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> };

export type ByteDetailsFragmentFragment = { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, visibility?: string | null, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> };

export type QueryBytesQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type QueryBytesQuery = { __typename?: 'Query', bytes: Array<{ __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, visibility?: string | null, admins: Array<string>, tags: Array<string>, priority: number }> };

export type QueryByteDetailsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  byteId: Scalars['String'];
  includeDraft?: InputMaybe<Scalars['Boolean']>;
}>;


export type QueryByteDetailsQuery = { __typename?: 'Query', byte: { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, visibility?: string | null, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type UpsertByteMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertByteInput;
}>;


export type UpsertByteMutation = { __typename?: 'Mutation', payload: { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type SaveByteMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertByteInput;
}>;


export type SaveByteMutation = { __typename?: 'Mutation', payload: { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type PublishByteMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertByteInput;
}>;


export type PublishByteMutation = { __typename?: 'Mutation', payload: { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type SubmitByteMutationVariables = Exact<{
  input: ByteSubmissionInput;
}>;


export type SubmitByteMutation = { __typename?: 'Mutation', submitByte: { __typename?: 'ByteSubmission', id: string, created: string, createdBy: string, byteId: string, spaceId: string } };

export type TopicSubmissionJsonFragment = { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null };

export type TopicCorrectAnswersFragment = { __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> };

export type TopicSubmissionFragment = { __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: number, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: number, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null };

export type CourseSubmissionFragment = { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: number, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: number, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: number, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: number, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> };

export type GitCourseSubmissionQueryVariables = Exact<{
  spaceId: Scalars['String'];
  courseKey: Scalars['String'];
}>;


export type GitCourseSubmissionQuery = { __typename?: 'Query', payload?: { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: number, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: number, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: number, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: number, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> } | null };

export type UpsertGitCourseTopicSubmissionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  gitCourseTopicSubmission: GitCourseTopicSubmissionInput;
}>;


export type UpsertGitCourseTopicSubmissionMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: number, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: number, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null } };

export type SubmitGitCourseTopicMutationVariables = Exact<{
  spaceId: Scalars['String'];
  gitCourseTopicSubmission: GitCourseTopicSubmissionInput;
}>;


export type SubmitGitCourseTopicMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: number, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: number, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null } };

export type SubmitGitCourseMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: CourseSubmissionInput;
}>;


export type SubmitGitCourseMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: number, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: number, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: number, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: number, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> } };

export type InitializeGitCourseSubmissionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  courseKey: Scalars['String'];
}>;


export type InitializeGitCourseSubmissionMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: number, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: number, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: number, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: number, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> } };

export type GitCourseIntegrationsQueryQueryVariables = Exact<{
  spaceId: Scalars['String'];
  key: Scalars['String'];
}>;


export type GitCourseIntegrationsQueryQuery = { __typename?: 'Query', payload?: { __typename?: 'CourseIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null, projectGalaxyOatMintedContent?: string | null } | null };

export type UpsertCourseIntegrationsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertCourseIntegrationsInput;
}>;


export type UpsertCourseIntegrationsMutation = { __typename?: 'Mutation', payload: { __typename?: 'CourseIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null, projectGalaxyOatMintedContent?: string | null } };

export type CourseQuestionFragment = { __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> };

export type CourseSummaryFragment = { __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string };

export type CourseExplanationFragment = { __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string };

export type CourseReadingQuestionFragment = { __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> };

export type CourseReadingFragment = { __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null };

export type CourseTopicFragment = { __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> };

export type CourseDetailsFragment = { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> };

export type UpsertGitCourseMutationVariables = Exact<{
  spaceId: Scalars['String'];
  gitCourseInput: GitCourseInput;
}>;


export type UpsertGitCourseMutation = { __typename?: 'Mutation', payload?: { __typename?: 'SummarizedGitCourse', key: string, title: string, summary: string, details: string, duration: string, courseAdmins?: Array<string> | null, priority?: number | null, topics: Array<{ __typename?: 'SummarizedGitCourseTopic', key: string, title: string, details: string }> } | null };

export type RefreshGitCoursesMutationVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type RefreshGitCoursesMutation = { __typename?: 'Mutation', payload: boolean };

export type RefreshGitCourseMutationVariables = Exact<{
  spaceId: Scalars['String'];
  courseKey: Scalars['String'];
}>;


export type RefreshGitCourseMutation = { __typename?: 'Mutation', payload: boolean };

export type UpdateCourseBasicInfoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  courseBasicInfo: CourseBasicInfoInput;
}>;


export type UpdateCourseBasicInfoMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type UpdateTopicBasicInfoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  topicInfo: UpdateTopicBasicInfoInput;
}>;


export type UpdateTopicBasicInfoMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type AddTopicMutationVariables = Exact<{
  spaceId: Scalars['String'];
  topicInfo: AddTopicInput;
}>;


export type AddTopicMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> } };

export type MoveTopicMutationVariables = Exact<{
  spaceId: Scalars['String'];
  topicInfo: MoveTopicInput;
}>;


export type MoveTopicMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type DeleteTopicMutationVariables = Exact<{
  spaceId: Scalars['String'];
  topicInfo: DeleteTopicInput;
}>;


export type DeleteTopicMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type UpdateTopicExplanationMutationVariables = Exact<{
  spaceId: Scalars['String'];
  explanationInfo: UpdateTopicExplanationInput;
}>;


export type UpdateTopicExplanationMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type UpdateTopicSummaryMutationVariables = Exact<{
  spaceId: Scalars['String'];
  summaryInfo: UpdateTopicSummaryInput;
}>;


export type UpdateTopicSummaryMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type UpdateTopicVideoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  videoInfo: UpdateTopicVideoInput;
}>;


export type UpdateTopicVideoMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type UpdateTopicQuestionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  questionInfo: UpdateTopicQuestionInput;
}>;


export type UpdateTopicQuestionMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type AddTopicExplanationMutationVariables = Exact<{
  spaceId: Scalars['String'];
  explanationInfo: AddTopicExplanationInput;
}>;


export type AddTopicExplanationMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string } };

export type AddTopicSummaryMutationVariables = Exact<{
  spaceId: Scalars['String'];
  summaryInfo: AddTopicSummaryInput;
}>;


export type AddTopicSummaryMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string } };

export type AddTopicVideoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  videoInfo: AddTopicVideoInput;
}>;


export type AddTopicVideoMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string } };

export type AddTopicQuestionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  questionInfo: AddTopicQuestionInput;
}>;


export type AddTopicQuestionMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> } };

export type DeleteTopicExplanationMutationVariables = Exact<{
  spaceId: Scalars['String'];
  explanationInfo: DeleteTopicExplanationInput;
}>;


export type DeleteTopicExplanationMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type DeleteTopicSummaryMutationVariables = Exact<{
  spaceId: Scalars['String'];
  summaryInfo: DeleteTopicSummaryInput;
}>;


export type DeleteTopicSummaryMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type DeleteTopicVideoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  videoInfo: DeleteTopicVideoInput;
}>;


export type DeleteTopicVideoMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type DeleteTopicQuestionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  questionInfo: DeleteTopicQuestionInput;
}>;


export type DeleteTopicQuestionMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type MoveTopicExplanationMutationVariables = Exact<{
  spaceId: Scalars['String'];
  explanationInfo: MoveTopicExplanationInput;
}>;


export type MoveTopicExplanationMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type MoveTopicSummaryMutationVariables = Exact<{
  spaceId: Scalars['String'];
  summaryInfo: MoveTopicSummaryInput;
}>;


export type MoveTopicSummaryMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type MoveTopicVideoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  videoInfo: MoveTopicVideoInput;
}>;


export type MoveTopicVideoMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type MoveTopicQuestionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  questionInfo: MoveTopicQuestionInput;
}>;


export type MoveTopicQuestionMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type RawGitCourseQueryVariables = Exact<{
  spaceId: Scalars['String'];
  key: Scalars['String'];
}>;


export type RawGitCourseQuery = { __typename?: 'Query', payload: { __typename?: 'RawGitCourse', key: string, courseJsonUrl?: string | null, courseRepoUrl?: string | null, weight: number } };

export type GitCourseSummarizedQueryVariables = Exact<{
  spaceId: Scalars['String'];
  key: Scalars['String'];
}>;


export type GitCourseSummarizedQuery = { __typename?: 'Query', payload: { __typename?: 'SummarizedGitCourse', key: string, title: string, summary: string, details: string, duration: string, courseAdmins?: Array<string> | null, topics: Array<{ __typename?: 'SummarizedGitCourseTopic', title: string, key: string, details: string }> } };

export type GitCourseQueryQueryVariables = Exact<{
  spaceId: Scalars['String'];
  courseKey: Scalars['String'];
}>;


export type GitCourseQueryQuery = { __typename?: 'Query', course: { __typename?: 'GitCourse', key: string, title: string, summary: string, details: string, duration: string, priority?: number | null, publishStatus: string, highlights: Array<string>, thumbnail: string, courseAdmins?: Array<string> | null, coursePassCount?: number | null, coursePassContent?: string | null, courseFailContent?: string | null, topicConfig?: { __typename?: 'TopicConfig', showExplanations: boolean, showHints: boolean } | null, topics: Array<{ __typename?: 'GitCourseTopic', title: string, key: string, details: string, explanations: Array<{ __typename?: 'GitCourseExplanation', title: string, shortTitle: string, key: string, details: string }>, readings: Array<{ __typename?: 'GitCourseReading', uuid: string, title: string, shortTitle: string, details: string, type: string, url: string, questions?: Array<{ __typename?: 'CourseReadingQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, timeInSec: number, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> | null }>, summaries: Array<{ __typename?: 'GitCourseSummary', title: string, shortTitle: string, key: string, details: string }>, questions: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> }> } };

export type CourseFragment = { __typename?: 'GitCourse', courseAdmins?: Array<string> | null, courseFailContent?: string | null, coursePassContent?: string | null, coursePassCount?: number | null, details: string, duration: string, highlights: Array<string>, key: string, priority?: number | null, publishStatus: string, summary: string, thumbnail: string, title: string };

export type CoursesQueryQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type CoursesQueryQuery = { __typename?: 'Query', courses: Array<{ __typename?: 'GitCourse', courseAdmins?: Array<string> | null, courseFailContent?: string | null, coursePassContent?: string | null, coursePassCount?: number | null, details: string, duration: string, highlights: Array<string>, key: string, priority?: number | null, publishStatus: string, summary: string, thumbnail: string, title: string }> };

export type UpsertGnosisSafeWalletsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  wallets: Array<GnosisSafeWalletInput> | GnosisSafeWalletInput;
}>;


export type UpsertGnosisSafeWalletsMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string } };

export type GuideQuestionFragment = { __typename?: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> };

export type GuideUserInputFragment = { __typename?: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string };

export type GuideUserDiscordConnectFragment = { __typename?: 'UserDiscordConnect', type: string, uuid: string };

type GuideStepItem_GuideQuestion_Fragment = { __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> };

type GuideStepItem_GuideUserInput_Fragment = { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string };

type GuideStepItem_UserDiscordConnect_Fragment = { __typename: 'UserDiscordConnect', type: string, uuid: string };

export type GuideStepItemFragment = GuideStepItem_GuideQuestion_Fragment | GuideStepItem_GuideUserInput_Fragment | GuideStepItem_UserDiscordConnect_Fragment;

export type GuideStepFragment = { __typename?: 'GuideStep', content: string, id: string, name: string, order: number, uuid: string, stepItems: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> };

export type GuideIntegrationFragment = { __typename?: 'GuideIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null };

export type GuideFragment = { __typename?: 'Guide', authors: Array<string>, categories: Array<string>, postSubmissionStepContent?: string | null, content: string, created: number, id: string, guideSource: string, guideType: string, name: string, showIncorrectOnCompletion: boolean, publishStatus: string, socialShareImage?: string | null, thumbnail?: string | null, uuid: string, version: number, guideIntegrations: { __typename?: 'GuideIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null }, steps: Array<{ __typename?: 'GuideStep', content: string, id: string, name: string, order: number, uuid: string, stepItems: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> };

export type UpsertGuideMutationVariables = Exact<{
  spaceId: Scalars['String'];
  guideInput: GuideInput;
}>;


export type UpsertGuideMutation = { __typename?: 'Mutation', payload: { __typename?: 'Guide', authors: Array<string>, categories: Array<string>, postSubmissionStepContent?: string | null, content: string, created: number, id: string, guideSource: string, guideType: string, name: string, showIncorrectOnCompletion: boolean, publishStatus: string, socialShareImage?: string | null, thumbnail?: string | null, uuid: string, version: number, guideIntegrations: { __typename?: 'GuideIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null }, steps: Array<{ __typename?: 'GuideStep', content: string, id: string, name: string, order: number, uuid: string, stepItems: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type GuideQueryQueryVariables = Exact<{
  spaceId: Scalars['String'];
  uuid: Scalars['String'];
}>;


export type GuideQueryQuery = { __typename?: 'Query', guide: { __typename?: 'Guide', authors: Array<string>, categories: Array<string>, postSubmissionStepContent?: string | null, content: string, created: number, id: string, guideSource: string, guideType: string, name: string, showIncorrectOnCompletion: boolean, publishStatus: string, socialShareImage?: string | null, thumbnail?: string | null, uuid: string, version: number, guideIntegrations: { __typename?: 'GuideIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null }, steps: Array<{ __typename?: 'GuideStep', content: string, id: string, name: string, order: number, uuid: string, stepItems: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type RefreshGitGuidesMutationVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type RefreshGitGuidesMutation = { __typename?: 'Mutation', payload: boolean };

export type GuideSubmissionsQueryQueryVariables = Exact<{
  guideUuid: Scalars['String'];
}>;


export type GuideSubmissionsQueryQuery = { __typename?: 'Query', guideSubmissions: Array<{ __typename?: 'GuideSubmission', id: string, created: string, createdBy: string, guideId: string, guideUuid: string, spaceId: string, uuid: string, result: { __typename?: 'GuideSubmissionResult', correctQuestions: Array<string>, wrongQuestions: Array<string>, allQuestions: Array<string> } }> };

export type SubmitGuideMutationVariables = Exact<{
  input: GuideSubmissionInput;
}>;


export type SubmitGuideMutation = { __typename?: 'Mutation', payload: { __typename?: 'GuideSubmission', galaxyCredentialsUpdated?: boolean | null, result: { __typename?: 'GuideSubmissionResult', wrongQuestions: Array<string>, correctQuestions: Array<string>, allQuestions: Array<string> } } };

export type GuideSummaryFragment = { __typename?: 'Guide', id: string, authors: Array<string>, name: string, categories: Array<string>, content: string, created: number, guideSource: string, guideType: string, publishStatus: string, socialShareImage?: string | null, thumbnail?: string | null, uuid: string };

export type GuidesQueryQueryVariables = Exact<{
  space: Scalars['String'];
}>;


export type GuidesQueryQuery = { __typename?: 'Query', guides: Array<{ __typename?: 'Guide', id: string, authors: Array<string>, name: string, categories: Array<string>, content: string, created: number, guideSource: string, guideType: string, publishStatus: string, socialShareImage?: string | null, thumbnail?: string | null, uuid: string }> };

export type AskCompletionAiMutationVariables = Exact<{
  input: CompletionAiInput;
}>;


export type AskCompletionAiMutation = { __typename?: 'Mutation', askCompletionAI: { __typename?: 'OpenAICompletionResponse', created: number, id: string, model: string, object: string, choices: Array<{ __typename?: 'CreateCompletionResponseChoice', finish_reason?: string | null, index?: number | null, text?: string | null, logprobs?: { __typename?: 'OpenAIChoiceLogprobs', text?: string | null, text_offset?: Array<number> | null, token_logprobs?: Array<number> | null, tokens?: Array<string> | null } | null }>, usage?: { __typename?: 'OpenAIUsage', completion_tokens: number, prompt_tokens: number, total_tokens: number } | null } };

export type AskChatCompletionAiMutationVariables = Exact<{
  input: ChatCompletionAiInput;
}>;


export type AskChatCompletionAiMutation = { __typename?: 'Mutation', askChatCompletionAI: { __typename?: 'OpenAIChatCompletionResponse', created: number, id: string, model: string, object: string, choices: Array<{ __typename?: 'OpenAIChatCompletionChoice', finish_reason?: string | null, index?: number | null, message?: { __typename?: 'OpenAIMessage', content?: string | null, role: string } | null }>, usage?: { __typename?: 'OpenAIUsage', completion_tokens: number, prompt_tokens: number, total_tokens: number } | null } };

export type CreateSummaryOfContentMutationVariables = Exact<{
  input: Scalars['String'];
}>;


export type CreateSummaryOfContentMutation = { __typename?: 'Mutation', createSummaryOfContent: { __typename?: 'OpenAITextResponse', text: string, tokenCount: number } };

export type ExtractRelevantTextForTopicMutationVariables = Exact<{
  input: ExtractRelevantTextForTopicInput;
}>;


export type ExtractRelevantTextForTopicMutation = { __typename?: 'Mutation', extractRelevantTextForTopic: { __typename?: 'OpenAITextResponse', text: string, tokenCount: number } };

export type DownloadAndCleanContentMutationVariables = Exact<{
  input: Scalars['String'];
}>;


export type DownloadAndCleanContentMutation = { __typename?: 'Mutation', downloadAndCleanContent: { __typename?: 'OpenAITextResponse', text: string, tokenCount: number } };

export type SimulationStepFragment = { __typename?: 'SimulationStep', content: string, iframeUrl?: string | null, name: string, uuid: string, order: number };

export type SimulationDetailsFragment = { __typename?: 'Simulation', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'SimulationStep', content: string, iframeUrl?: string | null, name: string, uuid: string, order: number }> };

export type SimulationsQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type SimulationsQuery = { __typename?: 'Query', simulations: Array<{ __typename?: 'Simulation', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number }> };

export type SimulationDetailsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  simulationId: Scalars['String'];
}>;


export type SimulationDetailsQuery = { __typename?: 'Query', simulation: { __typename?: 'Simulation', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'SimulationStep', content: string, iframeUrl?: string | null, name: string, uuid: string, order: number }> } };

export type UpsertSimulationMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertSimulationInput;
}>;


export type UpsertSimulationMutation = { __typename?: 'Mutation', payload: { __typename?: 'Simulation', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'SimulationStep', content: string, iframeUrl?: string | null, name: string, uuid: string, order: number }> } };

export type SpaceWithIntegrationsFragment = { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, admins: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null } | null };

export type ExtendedSpaceQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ExtendedSpaceQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, admins: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null } | null } | null };

export type ExtendedSpaceByDomainQueryVariables = Exact<{
  domain: Scalars['String'];
}>;


export type ExtendedSpaceByDomainQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, admins: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null } | null } | null };

export type SpaceDiscordGuildQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type SpaceDiscordGuildQuery = { __typename?: 'Query', payload?: any | null };

export type UpsertSpaceFeaturesMutationVariables = Exact<{
  spaceId: Scalars['String'];
  features: Array<Scalars['String']> | Scalars['String'];
}>;


export type UpsertSpaceFeaturesMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, admins: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null } | null } };

export type UpsertSpaceInviteLinksMutationVariables = Exact<{
  spaceId: Scalars['String'];
  spaceInviteArgs: SpaceInviteArgs;
}>;


export type UpsertSpaceInviteLinksMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string } };

export type UpsertProjectGalaxyAccessTokenMutationVariables = Exact<{
  spaceId: Scalars['String'];
  accessToken: Scalars['String'];
}>;


export type UpsertProjectGalaxyAccessTokenMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string } };

export type CreateSignedUrlMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: CreateSignedUrlInput;
}>;


export type CreateSignedUrlMutation = { __typename?: 'Mutation', payload: string };

export type AddDiscordCredentialsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  code: Scalars['String'];
  redirectUri: Scalars['String'];
}>;


export type AddDiscordCredentialsMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string } };

export type UpsertSpaceGitGuideRepositoriesMutationVariables = Exact<{
  spaceId: Scalars['String'];
  gitGuideRepositories: Array<SpaceGitRepositoryInput> | SpaceGitRepositoryInput;
}>;


export type UpsertSpaceGitGuideRepositoriesMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string } };

export type UpsertSpaceAcademyRepositoryMutationVariables = Exact<{
  spaceId: Scalars['String'];
  academyRepository: Scalars['String'];
}>;


export type UpsertSpaceAcademyRepositoryMutation = { __typename?: 'Mutation', upsertSpaceAcademyRepository: { __typename?: 'Space', id: string } };

export type UpdateSpaceMutationVariables = Exact<{
  spaceInput: UpsertSpaceInput;
}>;


export type UpdateSpaceMutation = { __typename?: 'Mutation', updateSpace: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, admins: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null } | null } };

export type CreateSpaceMutationVariables = Exact<{
  spaceInput: UpsertSpaceInput;
}>;


export type CreateSpaceMutation = { __typename?: 'Mutation', createSpace: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, admins: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null } | null } };

export type SpaceSummaryFragment = { __typename?: 'Space', id: string, admins: Array<string>, avatar?: string | null, creator: string, name: string, skin: string };

export type SpacesQueryVariables = Exact<{ [key: string]: never; }>;


export type SpacesQuery = { __typename?: 'Query', spaces?: Array<{ __typename?: 'Space', id: string, admins: Array<string>, avatar?: string | null, creator: string, name: string, skin: string }> | null };

export type TimelineDetailsFragment = { __typename?: 'Timeline', id: string, name: string, excerpt: string, content: string, thumbnail?: string | null, created: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, events: Array<{ __typename?: 'TimelineEvent', name: string, uuid: string, date: string, excerpt: string, content: string, moreLink?: string | null }> };

export type TimelinesQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type TimelinesQuery = { __typename?: 'Query', timelines: Array<{ __typename?: 'Timeline', id: string, name: string, excerpt: string, content: string, thumbnail?: string | null, created: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number }> };

export type TimelineDetailsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  timelineId: Scalars['String'];
}>;


export type TimelineDetailsQuery = { __typename?: 'Query', timeline: { __typename?: 'Timeline', id: string, name: string, excerpt: string, content: string, thumbnail?: string | null, created: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, events: Array<{ __typename?: 'TimelineEvent', name: string, uuid: string, date: string, excerpt: string, content: string, moreLink?: string | null }> } };

export type UpsertTimelineMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertTimelineInput;
}>;


export type UpsertTimelineMutation = { __typename?: 'Mutation', upsertTimeline: { __typename?: 'Timeline', id: string, name: string, excerpt: string, content: string, thumbnail?: string | null, created: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, events: Array<{ __typename?: 'TimelineEvent', name: string, uuid: string, date: string, excerpt: string, content: string, moreLink?: string | null }> } };

export const AcademyTaskFragmentFragmentDoc = gql`
    fragment AcademyTaskFragment on AcademyTask {
  uuid
  createdAt
  createdBy
  excerpt
  prerequisiteCourses {
    uuid
    key
    title
    thumbnail
  }
  prerequisiteGuides {
    uuid
    name
    content
    thumbnail
    guideType
  }
  spaceId
  status
  details
  title
  items {
    __typename
    ... on GuideQuestion {
      answerKeys
      choices {
        content
        key
      }
      content
      order
      type
      uuid
    }
    ... on GuideUserInput {
      label
      order
      required
      type
      uuid
    }
    ... on UserDiscordConnect {
      type
      uuid
    }
  }
  updatedAt
  updatedBy
}
    `;
export const ByteQuestionFragmentFragmentDoc = gql`
    fragment ByteQuestionFragment on ByteQuestion {
  answerKeys
  choices {
    content
    key
  }
  content
  type
  uuid
  explanation
}
    `;
export const ByteUserInputFragmentFragmentDoc = gql`
    fragment ByteUserInputFragment on ByteUserInput {
  label
  required
  type
  uuid
}
    `;
export const ByteUserDiscordConnectFragmentFragmentDoc = gql`
    fragment ByteUserDiscordConnectFragment on UserDiscordConnect {
  type
  uuid
}
    `;
export const ByteStepItemFragmentDoc = gql`
    fragment ByteStepItem on ByteStepItem {
  __typename
  ... on ByteQuestion {
    ...ByteQuestionFragment
  }
  ... on ByteUserInput {
    ...ByteUserInputFragment
  }
  ... on UserDiscordConnect {
    ...ByteUserDiscordConnectFragment
  }
}
    ${ByteQuestionFragmentFragmentDoc}
${ByteUserInputFragmentFragmentDoc}
${ByteUserDiscordConnectFragmentFragmentDoc}`;
export const ByteStepFragmentDoc = gql`
    fragment ByteStep on ByteStep {
  content
  stepItems {
    ...ByteStepItem
  }
  name
  uuid
}
    ${ByteStepItemFragmentDoc}`;
export const ByteDetailsFragmentDoc = gql`
    fragment ByteDetails on Byte {
  postSubmissionStepContent
  content
  created
  id
  name
  publishStatus
  admins
  tags
  priority
  steps {
    ...ByteStep
  }
}
    ${ByteStepFragmentDoc}`;
export const ByteDetailsFragmentFragmentDoc = gql`
    fragment ByteDetailsFragment on Byte {
  postSubmissionStepContent
  content
  created
  id
  name
  publishStatus
  visibility
  admins
  tags
  priority
  steps {
    content
    stepItems {
      __typename
      ... on ByteQuestion {
        answerKeys
        choices {
          content
          key
        }
        content
        type
        uuid
        explanation
      }
      ... on ByteUserInput {
        label
        required
        type
        uuid
      }
      ... on UserDiscordConnect {
        type
        uuid
      }
    }
    name
    uuid
  }
}
    `;
export const TopicCorrectAnswersFragmentDoc = gql`
    fragment TopicCorrectAnswers on GitCourseTopicCorrectAnswer {
  uuid
  answerKeys
}
    `;
export const TopicSubmissionJsonFragmentDoc = gql`
    fragment TopicSubmissionJson on GitCourseTopicSubmissionJson {
  uuid
  topicKey
  explanations {
    key
    status
  }
  questions {
    uuid
    status
    answers
  }
  readings {
    uuid
    questions {
      uuid
      answers
      status
    }
    status
  }
  summaries {
    key
    status
  }
  status
}
    `;
export const TopicSubmissionFragmentDoc = gql`
    fragment TopicSubmission on GitCourseTopicSubmission {
  uuid
  courseKey
  courseSubmissionUuid
  createdAt
  createdBy
  correctAnswers {
    ...TopicCorrectAnswers
  }
  isLatestSubmission
  questionsAttempted
  questionsCorrect
  questionsIncorrect
  questionsSkipped
  submission {
    ...TopicSubmissionJson
  }
  spaceId
  status
  topicKey
  updatedAt
}
    ${TopicCorrectAnswersFragmentDoc}
${TopicSubmissionJsonFragmentDoc}`;
export const CourseSubmissionFragmentDoc = gql`
    fragment CourseSubmission on GitCourseSubmission {
  uuid
  courseKey
  createdAt
  createdBy
  galaxyCredentialsUpdated
  isLatestSubmission
  questionsAttempted
  questionsCorrect
  questionsIncorrect
  questionsSkipped
  spaceId
  status
  updatedAt
  topicSubmissions {
    ...TopicSubmission
  }
}
    ${TopicSubmissionFragmentDoc}`;
export const CourseExplanationFragmentDoc = gql`
    fragment CourseExplanation on GitCourseExplanation {
  title
  shortTitle
  key
  details
}
    `;
export const CourseReadingQuestionFragmentDoc = gql`
    fragment CourseReadingQuestion on CourseReadingQuestion {
  uuid
  type
  content
  answerKeys
  hint
  explanation
  choices {
    content
    key
  }
  timeInSec
}
    `;
export const CourseReadingFragmentDoc = gql`
    fragment CourseReading on GitCourseReading {
  uuid
  title
  shortTitle
  details
  type
  url
  questions {
    ...CourseReadingQuestion
  }
}
    ${CourseReadingQuestionFragmentDoc}`;
export const CourseSummaryFragmentDoc = gql`
    fragment CourseSummary on GitCourseSummary {
  title
  shortTitle
  key
  details
}
    `;
export const CourseQuestionFragmentDoc = gql`
    fragment CourseQuestion on GitCourseQuestion {
  uuid
  type
  content
  answerKeys
  hint
  explanation
  choices {
    content
    key
  }
}
    `;
export const CourseTopicFragmentDoc = gql`
    fragment CourseTopic on GitCourseTopic {
  title
  key
  details
  explanations {
    ...CourseExplanation
  }
  readings {
    ...CourseReading
  }
  summaries {
    ...CourseSummary
  }
  questions {
    ...CourseQuestion
  }
}
    ${CourseExplanationFragmentDoc}
${CourseReadingFragmentDoc}
${CourseSummaryFragmentDoc}
${CourseQuestionFragmentDoc}`;
export const CourseDetailsFragmentDoc = gql`
    fragment CourseDetails on GitCourse {
  key
  title
  summary
  details
  duration
  priority
  publishStatus
  highlights
  thumbnail
  courseAdmins
  coursePassCount
  coursePassContent
  courseFailContent
  topicConfig {
    showExplanations
    showHints
  }
  topics {
    ...CourseTopic
  }
}
    ${CourseTopicFragmentDoc}`;
export const CourseFragmentDoc = gql`
    fragment Course on GitCourse {
  courseAdmins
  courseFailContent
  coursePassContent
  coursePassCount
  details
  duration
  highlights
  key
  priority
  publishStatus
  summary
  thumbnail
  title
}
    `;
export const GuideQuestionFragmentDoc = gql`
    fragment GuideQuestion on GuideQuestion {
  answerKeys
  choices {
    content
    key
  }
  content
  order
  type
  uuid
}
    `;
export const GuideUserInputFragmentDoc = gql`
    fragment GuideUserInput on GuideUserInput {
  label
  order
  required
  type
  uuid
}
    `;
export const GuideUserDiscordConnectFragmentDoc = gql`
    fragment GuideUserDiscordConnect on UserDiscordConnect {
  type
  uuid
}
    `;
export const GuideStepItemFragmentDoc = gql`
    fragment GuideStepItem on GuideStepItem {
  __typename
  ... on GuideQuestion {
    answerKeys
    choices {
      content
      key
    }
    content
    order
    type
    uuid
  }
  ... on GuideUserInput {
    label
    order
    required
    type
    uuid
  }
  ... on UserDiscordConnect {
    type
    uuid
  }
}
    `;
export const GuideIntegrationFragmentDoc = gql`
    fragment GuideIntegration on GuideIntegrations {
  discordRoleIds
  discordRolePassingCount
  discordWebhook
  projectGalaxyCredentialId
  projectGalaxyOatMintUrl
  projectGalaxyOatPassingCount
}
    `;
export const GuideStepFragmentDoc = gql`
    fragment GuideStep on GuideStep {
  content
  stepItems {
    __typename
    ... on GuideQuestion {
      answerKeys
      choices {
        content
        key
      }
      content
      order
      type
      uuid
    }
    ... on GuideUserInput {
      label
      order
      required
      type
      uuid
    }
    ... on UserDiscordConnect {
      type
      uuid
    }
  }
  id
  name
  order
  uuid
}
    `;
export const GuideFragmentDoc = gql`
    fragment Guide on Guide {
  authors
  categories
  postSubmissionStepContent
  content
  created
  id
  guideIntegrations {
    ...GuideIntegration
  }
  guideSource
  guideType
  name
  showIncorrectOnCompletion
  steps {
    ...GuideStep
  }
  publishStatus
  socialShareImage
  thumbnail
  uuid
  version
}
    ${GuideIntegrationFragmentDoc}
${GuideStepFragmentDoc}`;
export const GuideSummaryFragmentDoc = gql`
    fragment GuideSummary on Guide {
  id
  authors
  name
  categories
  content
  created
  guideSource
  guideType
  publishStatus
  socialShareImage
  thumbnail
  uuid
}
    `;
export const SimulationStepFragmentDoc = gql`
    fragment SimulationStep on SimulationStep {
  content
  iframeUrl
  name
  uuid
  order
}
    `;
export const SimulationDetailsFragmentDoc = gql`
    fragment SimulationDetails on Simulation {
  postSubmissionStepContent
  content
  created
  id
  name
  publishStatus
  admins
  tags
  priority
  steps {
    ...SimulationStep
  }
}
    ${SimulationStepFragmentDoc}`;
export const SpaceWithIntegrationsFragmentDoc = gql`
    fragment SpaceWithIntegrations on Space {
  id
  creator
  features
  name
  skin
  avatar
  inviteLinks {
    discordInviteLink
    showAnimatedButtonForDiscord
    telegramInviteLink
    showAnimatedButtonForTelegram
  }
  admins
  spaceIntegrations {
    academyRepository
    discordGuildId
    gitGuideRepositories {
      authenticationToken
      gitRepoType
      repoUrl
    }
    gnosisSafeWallets {
      id
      chainId
      order
      tokenContractAddress
      walletAddress
      walletName
    }
    projectGalaxyTokenLastFour
  }
}
    `;
export const SpaceSummaryFragmentDoc = gql`
    fragment SpaceSummary on Space {
  id
  admins
  avatar
  creator
  name
  skin
}
    `;
export const TimelineDetailsFragmentDoc = gql`
    fragment TimelineDetails on Timeline {
  id
  name
  excerpt
  content
  thumbnail
  created
  publishStatus
  admins
  tags
  priority
  events {
    name
    uuid
    date
    excerpt
    content
    moreLink
  }
}
    `;
export const AcademyTasksDocument = gql`
    query AcademyTasks($spaceId: String!, $status: String) {
  academyTasks(spaceId: $spaceId, status: $status) {
    ...AcademyTaskFragment
  }
}
    ${AcademyTaskFragmentFragmentDoc}`;

/**
 * __useAcademyTasksQuery__
 *
 * To run a query within a React component, call `useAcademyTasksQuery` and pass it any options that fit your needs.
 * When your component renders, `useAcademyTasksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAcademyTasksQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useAcademyTasksQuery(baseOptions: Apollo.QueryHookOptions<AcademyTasksQuery, AcademyTasksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AcademyTasksQuery, AcademyTasksQueryVariables>(AcademyTasksDocument, options);
      }
export function useAcademyTasksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AcademyTasksQuery, AcademyTasksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AcademyTasksQuery, AcademyTasksQueryVariables>(AcademyTasksDocument, options);
        }
export type AcademyTasksQueryHookResult = ReturnType<typeof useAcademyTasksQuery>;
export type AcademyTasksLazyQueryHookResult = ReturnType<typeof useAcademyTasksLazyQuery>;
export type AcademyTasksQueryResult = Apollo.QueryResult<AcademyTasksQuery, AcademyTasksQueryVariables>;
export function refetchAcademyTasksQuery(variables: AcademyTasksQueryVariables) {
      return { query: AcademyTasksDocument, variables: variables }
    }
export const AcademyTaskDocument = gql`
    query AcademyTask($uuid: String!) {
  academyTask(uuid: $uuid) {
    ...AcademyTaskFragment
  }
}
    ${AcademyTaskFragmentFragmentDoc}`;

/**
 * __useAcademyTaskQuery__
 *
 * To run a query within a React component, call `useAcademyTaskQuery` and pass it any options that fit your needs.
 * When your component renders, `useAcademyTaskQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAcademyTaskQuery({
 *   variables: {
 *      uuid: // value for 'uuid'
 *   },
 * });
 */
export function useAcademyTaskQuery(baseOptions: Apollo.QueryHookOptions<AcademyTaskQuery, AcademyTaskQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AcademyTaskQuery, AcademyTaskQueryVariables>(AcademyTaskDocument, options);
      }
export function useAcademyTaskLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AcademyTaskQuery, AcademyTaskQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AcademyTaskQuery, AcademyTaskQueryVariables>(AcademyTaskDocument, options);
        }
export type AcademyTaskQueryHookResult = ReturnType<typeof useAcademyTaskQuery>;
export type AcademyTaskLazyQueryHookResult = ReturnType<typeof useAcademyTaskLazyQuery>;
export type AcademyTaskQueryResult = Apollo.QueryResult<AcademyTaskQuery, AcademyTaskQueryVariables>;
export function refetchAcademyTaskQuery(variables: AcademyTaskQueryVariables) {
      return { query: AcademyTaskDocument, variables: variables }
    }
export const UpsertAcademyTaskDocument = gql`
    mutation UpsertAcademyTask($spaceId: String!, $task: UpsertAcademyTaskInput!) {
  upsertAcademyTask(spaceId: $spaceId, task: $task) {
    ...AcademyTaskFragment
  }
}
    ${AcademyTaskFragmentFragmentDoc}`;
export type UpsertAcademyTaskMutationFn = Apollo.MutationFunction<UpsertAcademyTaskMutation, UpsertAcademyTaskMutationVariables>;

/**
 * __useUpsertAcademyTaskMutation__
 *
 * To run a mutation, you first call `useUpsertAcademyTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertAcademyTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertAcademyTaskMutation, { data, loading, error }] = useUpsertAcademyTaskMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      task: // value for 'task'
 *   },
 * });
 */
export function useUpsertAcademyTaskMutation(baseOptions?: Apollo.MutationHookOptions<UpsertAcademyTaskMutation, UpsertAcademyTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertAcademyTaskMutation, UpsertAcademyTaskMutationVariables>(UpsertAcademyTaskDocument, options);
      }
export type UpsertAcademyTaskMutationHookResult = ReturnType<typeof useUpsertAcademyTaskMutation>;
export type UpsertAcademyTaskMutationResult = Apollo.MutationResult<UpsertAcademyTaskMutation>;
export type UpsertAcademyTaskMutationOptions = Apollo.BaseMutationOptions<UpsertAcademyTaskMutation, UpsertAcademyTaskMutationVariables>;
export const AuthenticateWithUnstoppableDocument = gql`
    mutation AuthenticateWithUnstoppable($idToken: String!) {
  payload: authenticateWithUnstoppable(idToken: $idToken) {
    jwt
  }
}
    `;
export type AuthenticateWithUnstoppableMutationFn = Apollo.MutationFunction<AuthenticateWithUnstoppableMutation, AuthenticateWithUnstoppableMutationVariables>;

/**
 * __useAuthenticateWithUnstoppableMutation__
 *
 * To run a mutation, you first call `useAuthenticateWithUnstoppableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAuthenticateWithUnstoppableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [authenticateWithUnstoppableMutation, { data, loading, error }] = useAuthenticateWithUnstoppableMutation({
 *   variables: {
 *      idToken: // value for 'idToken'
 *   },
 * });
 */
export function useAuthenticateWithUnstoppableMutation(baseOptions?: Apollo.MutationHookOptions<AuthenticateWithUnstoppableMutation, AuthenticateWithUnstoppableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AuthenticateWithUnstoppableMutation, AuthenticateWithUnstoppableMutationVariables>(AuthenticateWithUnstoppableDocument, options);
      }
export type AuthenticateWithUnstoppableMutationHookResult = ReturnType<typeof useAuthenticateWithUnstoppableMutation>;
export type AuthenticateWithUnstoppableMutationResult = Apollo.MutationResult<AuthenticateWithUnstoppableMutation>;
export type AuthenticateWithUnstoppableMutationOptions = Apollo.BaseMutationOptions<AuthenticateWithUnstoppableMutation, AuthenticateWithUnstoppableMutationVariables>;
export const QueryBytesDocument = gql`
    query QueryBytes($spaceId: String!) {
  bytes(spaceId: $spaceId) {
    postSubmissionStepContent
    content
    created
    id
    name
    publishStatus
    visibility
    admins
    tags
    priority
  }
}
    `;

/**
 * __useQueryBytesQuery__
 *
 * To run a query within a React component, call `useQueryBytesQuery` and pass it any options that fit your needs.
 * When your component renders, `useQueryBytesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQueryBytesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useQueryBytesQuery(baseOptions: Apollo.QueryHookOptions<QueryBytesQuery, QueryBytesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<QueryBytesQuery, QueryBytesQueryVariables>(QueryBytesDocument, options);
      }
export function useQueryBytesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<QueryBytesQuery, QueryBytesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<QueryBytesQuery, QueryBytesQueryVariables>(QueryBytesDocument, options);
        }
export type QueryBytesQueryHookResult = ReturnType<typeof useQueryBytesQuery>;
export type QueryBytesLazyQueryHookResult = ReturnType<typeof useQueryBytesLazyQuery>;
export type QueryBytesQueryResult = Apollo.QueryResult<QueryBytesQuery, QueryBytesQueryVariables>;
export function refetchQueryBytesQuery(variables: QueryBytesQueryVariables) {
      return { query: QueryBytesDocument, variables: variables }
    }
export const QueryByteDetailsDocument = gql`
    query QueryByteDetails($spaceId: String!, $byteId: String!, $includeDraft: Boolean) {
  byte(spaceId: $spaceId, byteId: $byteId, includeDraft: $includeDraft) {
    ...ByteDetailsFragment
  }
}
    ${ByteDetailsFragmentFragmentDoc}`;

/**
 * __useQueryByteDetailsQuery__
 *
 * To run a query within a React component, call `useQueryByteDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useQueryByteDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQueryByteDetailsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      byteId: // value for 'byteId'
 *      includeDraft: // value for 'includeDraft'
 *   },
 * });
 */
export function useQueryByteDetailsQuery(baseOptions: Apollo.QueryHookOptions<QueryByteDetailsQuery, QueryByteDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<QueryByteDetailsQuery, QueryByteDetailsQueryVariables>(QueryByteDetailsDocument, options);
      }
export function useQueryByteDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<QueryByteDetailsQuery, QueryByteDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<QueryByteDetailsQuery, QueryByteDetailsQueryVariables>(QueryByteDetailsDocument, options);
        }
export type QueryByteDetailsQueryHookResult = ReturnType<typeof useQueryByteDetailsQuery>;
export type QueryByteDetailsLazyQueryHookResult = ReturnType<typeof useQueryByteDetailsLazyQuery>;
export type QueryByteDetailsQueryResult = Apollo.QueryResult<QueryByteDetailsQuery, QueryByteDetailsQueryVariables>;
export function refetchQueryByteDetailsQuery(variables: QueryByteDetailsQueryVariables) {
      return { query: QueryByteDetailsDocument, variables: variables }
    }
export const UpsertByteDocument = gql`
    mutation UpsertByte($spaceId: String!, $input: UpsertByteInput!) {
  payload: upsertByte(spaceId: $spaceId, input: $input) {
    ...ByteDetails
  }
}
    ${ByteDetailsFragmentDoc}`;
export type UpsertByteMutationFn = Apollo.MutationFunction<UpsertByteMutation, UpsertByteMutationVariables>;

/**
 * __useUpsertByteMutation__
 *
 * To run a mutation, you first call `useUpsertByteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertByteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertByteMutation, { data, loading, error }] = useUpsertByteMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertByteMutation(baseOptions?: Apollo.MutationHookOptions<UpsertByteMutation, UpsertByteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertByteMutation, UpsertByteMutationVariables>(UpsertByteDocument, options);
      }
export type UpsertByteMutationHookResult = ReturnType<typeof useUpsertByteMutation>;
export type UpsertByteMutationResult = Apollo.MutationResult<UpsertByteMutation>;
export type UpsertByteMutationOptions = Apollo.BaseMutationOptions<UpsertByteMutation, UpsertByteMutationVariables>;
export const SaveByteDocument = gql`
    mutation SaveByte($spaceId: String!, $input: UpsertByteInput!) {
  payload: saveByte(spaceId: $spaceId, input: $input) {
    ...ByteDetails
  }
}
    ${ByteDetailsFragmentDoc}`;
export type SaveByteMutationFn = Apollo.MutationFunction<SaveByteMutation, SaveByteMutationVariables>;

/**
 * __useSaveByteMutation__
 *
 * To run a mutation, you first call `useSaveByteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveByteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveByteMutation, { data, loading, error }] = useSaveByteMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSaveByteMutation(baseOptions?: Apollo.MutationHookOptions<SaveByteMutation, SaveByteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveByteMutation, SaveByteMutationVariables>(SaveByteDocument, options);
      }
export type SaveByteMutationHookResult = ReturnType<typeof useSaveByteMutation>;
export type SaveByteMutationResult = Apollo.MutationResult<SaveByteMutation>;
export type SaveByteMutationOptions = Apollo.BaseMutationOptions<SaveByteMutation, SaveByteMutationVariables>;
export const PublishByteDocument = gql`
    mutation PublishByte($spaceId: String!, $input: UpsertByteInput!) {
  payload: publishByte(spaceId: $spaceId, input: $input) {
    ...ByteDetails
  }
}
    ${ByteDetailsFragmentDoc}`;
export type PublishByteMutationFn = Apollo.MutationFunction<PublishByteMutation, PublishByteMutationVariables>;

/**
 * __usePublishByteMutation__
 *
 * To run a mutation, you first call `usePublishByteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishByteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishByteMutation, { data, loading, error }] = usePublishByteMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePublishByteMutation(baseOptions?: Apollo.MutationHookOptions<PublishByteMutation, PublishByteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishByteMutation, PublishByteMutationVariables>(PublishByteDocument, options);
      }
export type PublishByteMutationHookResult = ReturnType<typeof usePublishByteMutation>;
export type PublishByteMutationResult = Apollo.MutationResult<PublishByteMutation>;
export type PublishByteMutationOptions = Apollo.BaseMutationOptions<PublishByteMutation, PublishByteMutationVariables>;
export const SubmitByteDocument = gql`
    mutation SubmitByte($input: ByteSubmissionInput!) {
  submitByte(submissionInput: $input) {
    id
    created
    createdBy
    byteId
    spaceId
  }
}
    `;
export type SubmitByteMutationFn = Apollo.MutationFunction<SubmitByteMutation, SubmitByteMutationVariables>;

/**
 * __useSubmitByteMutation__
 *
 * To run a mutation, you first call `useSubmitByteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitByteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitByteMutation, { data, loading, error }] = useSubmitByteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitByteMutation(baseOptions?: Apollo.MutationHookOptions<SubmitByteMutation, SubmitByteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitByteMutation, SubmitByteMutationVariables>(SubmitByteDocument, options);
      }
export type SubmitByteMutationHookResult = ReturnType<typeof useSubmitByteMutation>;
export type SubmitByteMutationResult = Apollo.MutationResult<SubmitByteMutation>;
export type SubmitByteMutationOptions = Apollo.BaseMutationOptions<SubmitByteMutation, SubmitByteMutationVariables>;
export const GitCourseSubmissionDocument = gql`
    query GitCourseSubmission($spaceId: String!, $courseKey: String!) {
  payload: gitCourseSubmission(spaceId: $spaceId, courseKey: $courseKey) {
    ...CourseSubmission
  }
}
    ${CourseSubmissionFragmentDoc}`;

/**
 * __useGitCourseSubmissionQuery__
 *
 * To run a query within a React component, call `useGitCourseSubmissionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGitCourseSubmissionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGitCourseSubmissionQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      courseKey: // value for 'courseKey'
 *   },
 * });
 */
export function useGitCourseSubmissionQuery(baseOptions: Apollo.QueryHookOptions<GitCourseSubmissionQuery, GitCourseSubmissionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GitCourseSubmissionQuery, GitCourseSubmissionQueryVariables>(GitCourseSubmissionDocument, options);
      }
export function useGitCourseSubmissionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GitCourseSubmissionQuery, GitCourseSubmissionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GitCourseSubmissionQuery, GitCourseSubmissionQueryVariables>(GitCourseSubmissionDocument, options);
        }
export type GitCourseSubmissionQueryHookResult = ReturnType<typeof useGitCourseSubmissionQuery>;
export type GitCourseSubmissionLazyQueryHookResult = ReturnType<typeof useGitCourseSubmissionLazyQuery>;
export type GitCourseSubmissionQueryResult = Apollo.QueryResult<GitCourseSubmissionQuery, GitCourseSubmissionQueryVariables>;
export function refetchGitCourseSubmissionQuery(variables: GitCourseSubmissionQueryVariables) {
      return { query: GitCourseSubmissionDocument, variables: variables }
    }
export const UpsertGitCourseTopicSubmissionDocument = gql`
    mutation UpsertGitCourseTopicSubmission($spaceId: String!, $gitCourseTopicSubmission: GitCourseTopicSubmissionInput!) {
  payload: upsertGitCourseTopicSubmission(
    spaceId: $spaceId
    gitCourseTopicSubmission: $gitCourseTopicSubmission
  ) {
    ...TopicSubmission
  }
}
    ${TopicSubmissionFragmentDoc}`;
export type UpsertGitCourseTopicSubmissionMutationFn = Apollo.MutationFunction<UpsertGitCourseTopicSubmissionMutation, UpsertGitCourseTopicSubmissionMutationVariables>;

/**
 * __useUpsertGitCourseTopicSubmissionMutation__
 *
 * To run a mutation, you first call `useUpsertGitCourseTopicSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGitCourseTopicSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGitCourseTopicSubmissionMutation, { data, loading, error }] = useUpsertGitCourseTopicSubmissionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      gitCourseTopicSubmission: // value for 'gitCourseTopicSubmission'
 *   },
 * });
 */
export function useUpsertGitCourseTopicSubmissionMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGitCourseTopicSubmissionMutation, UpsertGitCourseTopicSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGitCourseTopicSubmissionMutation, UpsertGitCourseTopicSubmissionMutationVariables>(UpsertGitCourseTopicSubmissionDocument, options);
      }
export type UpsertGitCourseTopicSubmissionMutationHookResult = ReturnType<typeof useUpsertGitCourseTopicSubmissionMutation>;
export type UpsertGitCourseTopicSubmissionMutationResult = Apollo.MutationResult<UpsertGitCourseTopicSubmissionMutation>;
export type UpsertGitCourseTopicSubmissionMutationOptions = Apollo.BaseMutationOptions<UpsertGitCourseTopicSubmissionMutation, UpsertGitCourseTopicSubmissionMutationVariables>;
export const SubmitGitCourseTopicDocument = gql`
    mutation SubmitGitCourseTopic($spaceId: String!, $gitCourseTopicSubmission: GitCourseTopicSubmissionInput!) {
  payload: submitGitCourseTopic(
    spaceId: $spaceId
    gitCourseTopicSubmission: $gitCourseTopicSubmission
  ) {
    ...TopicSubmission
  }
}
    ${TopicSubmissionFragmentDoc}`;
export type SubmitGitCourseTopicMutationFn = Apollo.MutationFunction<SubmitGitCourseTopicMutation, SubmitGitCourseTopicMutationVariables>;

/**
 * __useSubmitGitCourseTopicMutation__
 *
 * To run a mutation, you first call `useSubmitGitCourseTopicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitGitCourseTopicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitGitCourseTopicMutation, { data, loading, error }] = useSubmitGitCourseTopicMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      gitCourseTopicSubmission: // value for 'gitCourseTopicSubmission'
 *   },
 * });
 */
export function useSubmitGitCourseTopicMutation(baseOptions?: Apollo.MutationHookOptions<SubmitGitCourseTopicMutation, SubmitGitCourseTopicMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitGitCourseTopicMutation, SubmitGitCourseTopicMutationVariables>(SubmitGitCourseTopicDocument, options);
      }
export type SubmitGitCourseTopicMutationHookResult = ReturnType<typeof useSubmitGitCourseTopicMutation>;
export type SubmitGitCourseTopicMutationResult = Apollo.MutationResult<SubmitGitCourseTopicMutation>;
export type SubmitGitCourseTopicMutationOptions = Apollo.BaseMutationOptions<SubmitGitCourseTopicMutation, SubmitGitCourseTopicMutationVariables>;
export const SubmitGitCourseDocument = gql`
    mutation SubmitGitCourse($spaceId: String!, $input: CourseSubmissionInput!) {
  payload: submitGitCourse(spaceId: $spaceId, input: $input) {
    ...CourseSubmission
  }
}
    ${CourseSubmissionFragmentDoc}`;
export type SubmitGitCourseMutationFn = Apollo.MutationFunction<SubmitGitCourseMutation, SubmitGitCourseMutationVariables>;

/**
 * __useSubmitGitCourseMutation__
 *
 * To run a mutation, you first call `useSubmitGitCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitGitCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitGitCourseMutation, { data, loading, error }] = useSubmitGitCourseMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitGitCourseMutation(baseOptions?: Apollo.MutationHookOptions<SubmitGitCourseMutation, SubmitGitCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitGitCourseMutation, SubmitGitCourseMutationVariables>(SubmitGitCourseDocument, options);
      }
export type SubmitGitCourseMutationHookResult = ReturnType<typeof useSubmitGitCourseMutation>;
export type SubmitGitCourseMutationResult = Apollo.MutationResult<SubmitGitCourseMutation>;
export type SubmitGitCourseMutationOptions = Apollo.BaseMutationOptions<SubmitGitCourseMutation, SubmitGitCourseMutationVariables>;
export const InitializeGitCourseSubmissionDocument = gql`
    mutation InitializeGitCourseSubmission($spaceId: String!, $courseKey: String!) {
  payload: initializeGitCourseSubmission(spaceId: $spaceId, courseKey: $courseKey) {
    ...CourseSubmission
  }
}
    ${CourseSubmissionFragmentDoc}`;
export type InitializeGitCourseSubmissionMutationFn = Apollo.MutationFunction<InitializeGitCourseSubmissionMutation, InitializeGitCourseSubmissionMutationVariables>;

/**
 * __useInitializeGitCourseSubmissionMutation__
 *
 * To run a mutation, you first call `useInitializeGitCourseSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInitializeGitCourseSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [initializeGitCourseSubmissionMutation, { data, loading, error }] = useInitializeGitCourseSubmissionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      courseKey: // value for 'courseKey'
 *   },
 * });
 */
export function useInitializeGitCourseSubmissionMutation(baseOptions?: Apollo.MutationHookOptions<InitializeGitCourseSubmissionMutation, InitializeGitCourseSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InitializeGitCourseSubmissionMutation, InitializeGitCourseSubmissionMutationVariables>(InitializeGitCourseSubmissionDocument, options);
      }
export type InitializeGitCourseSubmissionMutationHookResult = ReturnType<typeof useInitializeGitCourseSubmissionMutation>;
export type InitializeGitCourseSubmissionMutationResult = Apollo.MutationResult<InitializeGitCourseSubmissionMutation>;
export type InitializeGitCourseSubmissionMutationOptions = Apollo.BaseMutationOptions<InitializeGitCourseSubmissionMutation, InitializeGitCourseSubmissionMutationVariables>;
export const GitCourseIntegrationsQueryDocument = gql`
    query GitCourseIntegrationsQuery($spaceId: String!, $key: String!) {
  payload: gitCourseIntegrations(spaceId: $spaceId, key: $key) {
    discordRoleIds
    discordRolePassingCount
    discordWebhook
    projectGalaxyCredentialId
    projectGalaxyOatMintUrl
    projectGalaxyOatPassingCount
    projectGalaxyOatMintedContent
  }
}
    `;

/**
 * __useGitCourseIntegrationsQueryQuery__
 *
 * To run a query within a React component, call `useGitCourseIntegrationsQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGitCourseIntegrationsQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGitCourseIntegrationsQueryQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      key: // value for 'key'
 *   },
 * });
 */
export function useGitCourseIntegrationsQueryQuery(baseOptions: Apollo.QueryHookOptions<GitCourseIntegrationsQueryQuery, GitCourseIntegrationsQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GitCourseIntegrationsQueryQuery, GitCourseIntegrationsQueryQueryVariables>(GitCourseIntegrationsQueryDocument, options);
      }
export function useGitCourseIntegrationsQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GitCourseIntegrationsQueryQuery, GitCourseIntegrationsQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GitCourseIntegrationsQueryQuery, GitCourseIntegrationsQueryQueryVariables>(GitCourseIntegrationsQueryDocument, options);
        }
export type GitCourseIntegrationsQueryQueryHookResult = ReturnType<typeof useGitCourseIntegrationsQueryQuery>;
export type GitCourseIntegrationsQueryLazyQueryHookResult = ReturnType<typeof useGitCourseIntegrationsQueryLazyQuery>;
export type GitCourseIntegrationsQueryQueryResult = Apollo.QueryResult<GitCourseIntegrationsQueryQuery, GitCourseIntegrationsQueryQueryVariables>;
export function refetchGitCourseIntegrationsQueryQuery(variables: GitCourseIntegrationsQueryQueryVariables) {
      return { query: GitCourseIntegrationsQueryDocument, variables: variables }
    }
export const UpsertCourseIntegrationsDocument = gql`
    mutation UpsertCourseIntegrations($spaceId: String!, $input: UpsertCourseIntegrationsInput!) {
  payload: upsertCourseIntegrations(
    spaceId: $spaceId
    courseIntegrationInput: $input
  ) {
    discordRoleIds
    discordRolePassingCount
    discordWebhook
    projectGalaxyCredentialId
    projectGalaxyOatMintUrl
    projectGalaxyOatPassingCount
    projectGalaxyOatMintedContent
  }
}
    `;
export type UpsertCourseIntegrationsMutationFn = Apollo.MutationFunction<UpsertCourseIntegrationsMutation, UpsertCourseIntegrationsMutationVariables>;

/**
 * __useUpsertCourseIntegrationsMutation__
 *
 * To run a mutation, you first call `useUpsertCourseIntegrationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertCourseIntegrationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertCourseIntegrationsMutation, { data, loading, error }] = useUpsertCourseIntegrationsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertCourseIntegrationsMutation(baseOptions?: Apollo.MutationHookOptions<UpsertCourseIntegrationsMutation, UpsertCourseIntegrationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertCourseIntegrationsMutation, UpsertCourseIntegrationsMutationVariables>(UpsertCourseIntegrationsDocument, options);
      }
export type UpsertCourseIntegrationsMutationHookResult = ReturnType<typeof useUpsertCourseIntegrationsMutation>;
export type UpsertCourseIntegrationsMutationResult = Apollo.MutationResult<UpsertCourseIntegrationsMutation>;
export type UpsertCourseIntegrationsMutationOptions = Apollo.BaseMutationOptions<UpsertCourseIntegrationsMutation, UpsertCourseIntegrationsMutationVariables>;
export const UpsertGitCourseDocument = gql`
    mutation UpsertGitCourse($spaceId: String!, $gitCourseInput: GitCourseInput!) {
  payload: upsertGitCourse(spaceId: $spaceId, gitCourseInput: $gitCourseInput) {
    key
    title
    summary
    details
    duration
    courseAdmins
    priority
    topics {
      key
      title
      details
    }
  }
}
    `;
export type UpsertGitCourseMutationFn = Apollo.MutationFunction<UpsertGitCourseMutation, UpsertGitCourseMutationVariables>;

/**
 * __useUpsertGitCourseMutation__
 *
 * To run a mutation, you first call `useUpsertGitCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGitCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGitCourseMutation, { data, loading, error }] = useUpsertGitCourseMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      gitCourseInput: // value for 'gitCourseInput'
 *   },
 * });
 */
export function useUpsertGitCourseMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGitCourseMutation, UpsertGitCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGitCourseMutation, UpsertGitCourseMutationVariables>(UpsertGitCourseDocument, options);
      }
export type UpsertGitCourseMutationHookResult = ReturnType<typeof useUpsertGitCourseMutation>;
export type UpsertGitCourseMutationResult = Apollo.MutationResult<UpsertGitCourseMutation>;
export type UpsertGitCourseMutationOptions = Apollo.BaseMutationOptions<UpsertGitCourseMutation, UpsertGitCourseMutationVariables>;
export const RefreshGitCoursesDocument = gql`
    mutation RefreshGitCourses($spaceId: String!) {
  payload: refreshGitCourses(spaceId: $spaceId)
}
    `;
export type RefreshGitCoursesMutationFn = Apollo.MutationFunction<RefreshGitCoursesMutation, RefreshGitCoursesMutationVariables>;

/**
 * __useRefreshGitCoursesMutation__
 *
 * To run a mutation, you first call `useRefreshGitCoursesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshGitCoursesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshGitCoursesMutation, { data, loading, error }] = useRefreshGitCoursesMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useRefreshGitCoursesMutation(baseOptions?: Apollo.MutationHookOptions<RefreshGitCoursesMutation, RefreshGitCoursesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshGitCoursesMutation, RefreshGitCoursesMutationVariables>(RefreshGitCoursesDocument, options);
      }
export type RefreshGitCoursesMutationHookResult = ReturnType<typeof useRefreshGitCoursesMutation>;
export type RefreshGitCoursesMutationResult = Apollo.MutationResult<RefreshGitCoursesMutation>;
export type RefreshGitCoursesMutationOptions = Apollo.BaseMutationOptions<RefreshGitCoursesMutation, RefreshGitCoursesMutationVariables>;
export const RefreshGitCourseDocument = gql`
    mutation RefreshGitCourse($spaceId: String!, $courseKey: String!) {
  payload: refreshGitCourse(spaceId: $spaceId, courseKey: $courseKey)
}
    `;
export type RefreshGitCourseMutationFn = Apollo.MutationFunction<RefreshGitCourseMutation, RefreshGitCourseMutationVariables>;

/**
 * __useRefreshGitCourseMutation__
 *
 * To run a mutation, you first call `useRefreshGitCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshGitCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshGitCourseMutation, { data, loading, error }] = useRefreshGitCourseMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      courseKey: // value for 'courseKey'
 *   },
 * });
 */
export function useRefreshGitCourseMutation(baseOptions?: Apollo.MutationHookOptions<RefreshGitCourseMutation, RefreshGitCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshGitCourseMutation, RefreshGitCourseMutationVariables>(RefreshGitCourseDocument, options);
      }
export type RefreshGitCourseMutationHookResult = ReturnType<typeof useRefreshGitCourseMutation>;
export type RefreshGitCourseMutationResult = Apollo.MutationResult<RefreshGitCourseMutation>;
export type RefreshGitCourseMutationOptions = Apollo.BaseMutationOptions<RefreshGitCourseMutation, RefreshGitCourseMutationVariables>;
export const UpdateCourseBasicInfoDocument = gql`
    mutation UpdateCourseBasicInfo($spaceId: String!, $courseBasicInfo: CourseBasicInfoInput!) {
  payload: updateCourseBasicInfo(
    spaceId: $spaceId
    courseBasicInfo: $courseBasicInfo
  ) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type UpdateCourseBasicInfoMutationFn = Apollo.MutationFunction<UpdateCourseBasicInfoMutation, UpdateCourseBasicInfoMutationVariables>;

/**
 * __useUpdateCourseBasicInfoMutation__
 *
 * To run a mutation, you first call `useUpdateCourseBasicInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCourseBasicInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCourseBasicInfoMutation, { data, loading, error }] = useUpdateCourseBasicInfoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      courseBasicInfo: // value for 'courseBasicInfo'
 *   },
 * });
 */
export function useUpdateCourseBasicInfoMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCourseBasicInfoMutation, UpdateCourseBasicInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCourseBasicInfoMutation, UpdateCourseBasicInfoMutationVariables>(UpdateCourseBasicInfoDocument, options);
      }
export type UpdateCourseBasicInfoMutationHookResult = ReturnType<typeof useUpdateCourseBasicInfoMutation>;
export type UpdateCourseBasicInfoMutationResult = Apollo.MutationResult<UpdateCourseBasicInfoMutation>;
export type UpdateCourseBasicInfoMutationOptions = Apollo.BaseMutationOptions<UpdateCourseBasicInfoMutation, UpdateCourseBasicInfoMutationVariables>;
export const UpdateTopicBasicInfoDocument = gql`
    mutation UpdateTopicBasicInfo($spaceId: String!, $topicInfo: UpdateTopicBasicInfoInput!) {
  payload: updateTopicBasicInfo(spaceId: $spaceId, topicInfo: $topicInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type UpdateTopicBasicInfoMutationFn = Apollo.MutationFunction<UpdateTopicBasicInfoMutation, UpdateTopicBasicInfoMutationVariables>;

/**
 * __useUpdateTopicBasicInfoMutation__
 *
 * To run a mutation, you first call `useUpdateTopicBasicInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTopicBasicInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTopicBasicInfoMutation, { data, loading, error }] = useUpdateTopicBasicInfoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      topicInfo: // value for 'topicInfo'
 *   },
 * });
 */
export function useUpdateTopicBasicInfoMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTopicBasicInfoMutation, UpdateTopicBasicInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTopicBasicInfoMutation, UpdateTopicBasicInfoMutationVariables>(UpdateTopicBasicInfoDocument, options);
      }
export type UpdateTopicBasicInfoMutationHookResult = ReturnType<typeof useUpdateTopicBasicInfoMutation>;
export type UpdateTopicBasicInfoMutationResult = Apollo.MutationResult<UpdateTopicBasicInfoMutation>;
export type UpdateTopicBasicInfoMutationOptions = Apollo.BaseMutationOptions<UpdateTopicBasicInfoMutation, UpdateTopicBasicInfoMutationVariables>;
export const AddTopicDocument = gql`
    mutation AddTopic($spaceId: String!, $topicInfo: AddTopicInput!) {
  payload: addTopic(spaceId: $spaceId, topicInfo: $topicInfo) {
    ...CourseTopic
  }
}
    ${CourseTopicFragmentDoc}`;
export type AddTopicMutationFn = Apollo.MutationFunction<AddTopicMutation, AddTopicMutationVariables>;

/**
 * __useAddTopicMutation__
 *
 * To run a mutation, you first call `useAddTopicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTopicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTopicMutation, { data, loading, error }] = useAddTopicMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      topicInfo: // value for 'topicInfo'
 *   },
 * });
 */
export function useAddTopicMutation(baseOptions?: Apollo.MutationHookOptions<AddTopicMutation, AddTopicMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTopicMutation, AddTopicMutationVariables>(AddTopicDocument, options);
      }
export type AddTopicMutationHookResult = ReturnType<typeof useAddTopicMutation>;
export type AddTopicMutationResult = Apollo.MutationResult<AddTopicMutation>;
export type AddTopicMutationOptions = Apollo.BaseMutationOptions<AddTopicMutation, AddTopicMutationVariables>;
export const MoveTopicDocument = gql`
    mutation MoveTopic($spaceId: String!, $topicInfo: MoveTopicInput!) {
  payload: moveTopic(spaceId: $spaceId, topicInfo: $topicInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type MoveTopicMutationFn = Apollo.MutationFunction<MoveTopicMutation, MoveTopicMutationVariables>;

/**
 * __useMoveTopicMutation__
 *
 * To run a mutation, you first call `useMoveTopicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveTopicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveTopicMutation, { data, loading, error }] = useMoveTopicMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      topicInfo: // value for 'topicInfo'
 *   },
 * });
 */
export function useMoveTopicMutation(baseOptions?: Apollo.MutationHookOptions<MoveTopicMutation, MoveTopicMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveTopicMutation, MoveTopicMutationVariables>(MoveTopicDocument, options);
      }
export type MoveTopicMutationHookResult = ReturnType<typeof useMoveTopicMutation>;
export type MoveTopicMutationResult = Apollo.MutationResult<MoveTopicMutation>;
export type MoveTopicMutationOptions = Apollo.BaseMutationOptions<MoveTopicMutation, MoveTopicMutationVariables>;
export const DeleteTopicDocument = gql`
    mutation DeleteTopic($spaceId: String!, $topicInfo: DeleteTopicInput!) {
  payload: deleteTopic(spaceId: $spaceId, topicInfo: $topicInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type DeleteTopicMutationFn = Apollo.MutationFunction<DeleteTopicMutation, DeleteTopicMutationVariables>;

/**
 * __useDeleteTopicMutation__
 *
 * To run a mutation, you first call `useDeleteTopicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTopicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTopicMutation, { data, loading, error }] = useDeleteTopicMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      topicInfo: // value for 'topicInfo'
 *   },
 * });
 */
export function useDeleteTopicMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTopicMutation, DeleteTopicMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTopicMutation, DeleteTopicMutationVariables>(DeleteTopicDocument, options);
      }
export type DeleteTopicMutationHookResult = ReturnType<typeof useDeleteTopicMutation>;
export type DeleteTopicMutationResult = Apollo.MutationResult<DeleteTopicMutation>;
export type DeleteTopicMutationOptions = Apollo.BaseMutationOptions<DeleteTopicMutation, DeleteTopicMutationVariables>;
export const UpdateTopicExplanationDocument = gql`
    mutation UpdateTopicExplanation($spaceId: String!, $explanationInfo: UpdateTopicExplanationInput!) {
  payload: updateTopicExplanation(
    spaceId: $spaceId
    explanationInfo: $explanationInfo
  ) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type UpdateTopicExplanationMutationFn = Apollo.MutationFunction<UpdateTopicExplanationMutation, UpdateTopicExplanationMutationVariables>;

/**
 * __useUpdateTopicExplanationMutation__
 *
 * To run a mutation, you first call `useUpdateTopicExplanationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTopicExplanationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTopicExplanationMutation, { data, loading, error }] = useUpdateTopicExplanationMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      explanationInfo: // value for 'explanationInfo'
 *   },
 * });
 */
export function useUpdateTopicExplanationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTopicExplanationMutation, UpdateTopicExplanationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTopicExplanationMutation, UpdateTopicExplanationMutationVariables>(UpdateTopicExplanationDocument, options);
      }
export type UpdateTopicExplanationMutationHookResult = ReturnType<typeof useUpdateTopicExplanationMutation>;
export type UpdateTopicExplanationMutationResult = Apollo.MutationResult<UpdateTopicExplanationMutation>;
export type UpdateTopicExplanationMutationOptions = Apollo.BaseMutationOptions<UpdateTopicExplanationMutation, UpdateTopicExplanationMutationVariables>;
export const UpdateTopicSummaryDocument = gql`
    mutation UpdateTopicSummary($spaceId: String!, $summaryInfo: UpdateTopicSummaryInput!) {
  payload: updateTopicSummary(spaceId: $spaceId, summaryInfo: $summaryInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type UpdateTopicSummaryMutationFn = Apollo.MutationFunction<UpdateTopicSummaryMutation, UpdateTopicSummaryMutationVariables>;

/**
 * __useUpdateTopicSummaryMutation__
 *
 * To run a mutation, you first call `useUpdateTopicSummaryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTopicSummaryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTopicSummaryMutation, { data, loading, error }] = useUpdateTopicSummaryMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      summaryInfo: // value for 'summaryInfo'
 *   },
 * });
 */
export function useUpdateTopicSummaryMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTopicSummaryMutation, UpdateTopicSummaryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTopicSummaryMutation, UpdateTopicSummaryMutationVariables>(UpdateTopicSummaryDocument, options);
      }
export type UpdateTopicSummaryMutationHookResult = ReturnType<typeof useUpdateTopicSummaryMutation>;
export type UpdateTopicSummaryMutationResult = Apollo.MutationResult<UpdateTopicSummaryMutation>;
export type UpdateTopicSummaryMutationOptions = Apollo.BaseMutationOptions<UpdateTopicSummaryMutation, UpdateTopicSummaryMutationVariables>;
export const UpdateTopicVideoDocument = gql`
    mutation UpdateTopicVideo($spaceId: String!, $videoInfo: UpdateTopicVideoInput!) {
  payload: updateTopicVideo(spaceId: $spaceId, videoInfo: $videoInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type UpdateTopicVideoMutationFn = Apollo.MutationFunction<UpdateTopicVideoMutation, UpdateTopicVideoMutationVariables>;

/**
 * __useUpdateTopicVideoMutation__
 *
 * To run a mutation, you first call `useUpdateTopicVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTopicVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTopicVideoMutation, { data, loading, error }] = useUpdateTopicVideoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      videoInfo: // value for 'videoInfo'
 *   },
 * });
 */
export function useUpdateTopicVideoMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTopicVideoMutation, UpdateTopicVideoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTopicVideoMutation, UpdateTopicVideoMutationVariables>(UpdateTopicVideoDocument, options);
      }
export type UpdateTopicVideoMutationHookResult = ReturnType<typeof useUpdateTopicVideoMutation>;
export type UpdateTopicVideoMutationResult = Apollo.MutationResult<UpdateTopicVideoMutation>;
export type UpdateTopicVideoMutationOptions = Apollo.BaseMutationOptions<UpdateTopicVideoMutation, UpdateTopicVideoMutationVariables>;
export const UpdateTopicQuestionDocument = gql`
    mutation UpdateTopicQuestion($spaceId: String!, $questionInfo: UpdateTopicQuestionInput!) {
  payload: updateTopicQuestion(spaceId: $spaceId, questionInfo: $questionInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type UpdateTopicQuestionMutationFn = Apollo.MutationFunction<UpdateTopicQuestionMutation, UpdateTopicQuestionMutationVariables>;

/**
 * __useUpdateTopicQuestionMutation__
 *
 * To run a mutation, you first call `useUpdateTopicQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTopicQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTopicQuestionMutation, { data, loading, error }] = useUpdateTopicQuestionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      questionInfo: // value for 'questionInfo'
 *   },
 * });
 */
export function useUpdateTopicQuestionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTopicQuestionMutation, UpdateTopicQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTopicQuestionMutation, UpdateTopicQuestionMutationVariables>(UpdateTopicQuestionDocument, options);
      }
export type UpdateTopicQuestionMutationHookResult = ReturnType<typeof useUpdateTopicQuestionMutation>;
export type UpdateTopicQuestionMutationResult = Apollo.MutationResult<UpdateTopicQuestionMutation>;
export type UpdateTopicQuestionMutationOptions = Apollo.BaseMutationOptions<UpdateTopicQuestionMutation, UpdateTopicQuestionMutationVariables>;
export const AddTopicExplanationDocument = gql`
    mutation AddTopicExplanation($spaceId: String!, $explanationInfo: AddTopicExplanationInput!) {
  payload: addTopicExplanation(
    spaceId: $spaceId
    explanationInfo: $explanationInfo
  ) {
    title
    shortTitle
    key
    details
  }
}
    `;
export type AddTopicExplanationMutationFn = Apollo.MutationFunction<AddTopicExplanationMutation, AddTopicExplanationMutationVariables>;

/**
 * __useAddTopicExplanationMutation__
 *
 * To run a mutation, you first call `useAddTopicExplanationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTopicExplanationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTopicExplanationMutation, { data, loading, error }] = useAddTopicExplanationMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      explanationInfo: // value for 'explanationInfo'
 *   },
 * });
 */
export function useAddTopicExplanationMutation(baseOptions?: Apollo.MutationHookOptions<AddTopicExplanationMutation, AddTopicExplanationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTopicExplanationMutation, AddTopicExplanationMutationVariables>(AddTopicExplanationDocument, options);
      }
export type AddTopicExplanationMutationHookResult = ReturnType<typeof useAddTopicExplanationMutation>;
export type AddTopicExplanationMutationResult = Apollo.MutationResult<AddTopicExplanationMutation>;
export type AddTopicExplanationMutationOptions = Apollo.BaseMutationOptions<AddTopicExplanationMutation, AddTopicExplanationMutationVariables>;
export const AddTopicSummaryDocument = gql`
    mutation AddTopicSummary($spaceId: String!, $summaryInfo: AddTopicSummaryInput!) {
  payload: addTopicSummary(spaceId: $spaceId, summaryInfo: $summaryInfo) {
    title
    shortTitle
    key
    details
  }
}
    `;
export type AddTopicSummaryMutationFn = Apollo.MutationFunction<AddTopicSummaryMutation, AddTopicSummaryMutationVariables>;

/**
 * __useAddTopicSummaryMutation__
 *
 * To run a mutation, you first call `useAddTopicSummaryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTopicSummaryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTopicSummaryMutation, { data, loading, error }] = useAddTopicSummaryMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      summaryInfo: // value for 'summaryInfo'
 *   },
 * });
 */
export function useAddTopicSummaryMutation(baseOptions?: Apollo.MutationHookOptions<AddTopicSummaryMutation, AddTopicSummaryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTopicSummaryMutation, AddTopicSummaryMutationVariables>(AddTopicSummaryDocument, options);
      }
export type AddTopicSummaryMutationHookResult = ReturnType<typeof useAddTopicSummaryMutation>;
export type AddTopicSummaryMutationResult = Apollo.MutationResult<AddTopicSummaryMutation>;
export type AddTopicSummaryMutationOptions = Apollo.BaseMutationOptions<AddTopicSummaryMutation, AddTopicSummaryMutationVariables>;
export const AddTopicVideoDocument = gql`
    mutation AddTopicVideo($spaceId: String!, $videoInfo: AddTopicVideoInput!) {
  payload: addTopicVideo(spaceId: $spaceId, videoInfo: $videoInfo) {
    uuid
    title
    shortTitle
    details
    type
    url
  }
}
    `;
export type AddTopicVideoMutationFn = Apollo.MutationFunction<AddTopicVideoMutation, AddTopicVideoMutationVariables>;

/**
 * __useAddTopicVideoMutation__
 *
 * To run a mutation, you first call `useAddTopicVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTopicVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTopicVideoMutation, { data, loading, error }] = useAddTopicVideoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      videoInfo: // value for 'videoInfo'
 *   },
 * });
 */
export function useAddTopicVideoMutation(baseOptions?: Apollo.MutationHookOptions<AddTopicVideoMutation, AddTopicVideoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTopicVideoMutation, AddTopicVideoMutationVariables>(AddTopicVideoDocument, options);
      }
export type AddTopicVideoMutationHookResult = ReturnType<typeof useAddTopicVideoMutation>;
export type AddTopicVideoMutationResult = Apollo.MutationResult<AddTopicVideoMutation>;
export type AddTopicVideoMutationOptions = Apollo.BaseMutationOptions<AddTopicVideoMutation, AddTopicVideoMutationVariables>;
export const AddTopicQuestionDocument = gql`
    mutation AddTopicQuestion($spaceId: String!, $questionInfo: AddTopicQuestionInput!) {
  payload: addTopicQuestion(spaceId: $spaceId, questionInfo: $questionInfo) {
    uuid
    type
    content
    answerKeys
    hint
    explanation
    choices {
      content
      key
    }
  }
}
    `;
export type AddTopicQuestionMutationFn = Apollo.MutationFunction<AddTopicQuestionMutation, AddTopicQuestionMutationVariables>;

/**
 * __useAddTopicQuestionMutation__
 *
 * To run a mutation, you first call `useAddTopicQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTopicQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTopicQuestionMutation, { data, loading, error }] = useAddTopicQuestionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      questionInfo: // value for 'questionInfo'
 *   },
 * });
 */
export function useAddTopicQuestionMutation(baseOptions?: Apollo.MutationHookOptions<AddTopicQuestionMutation, AddTopicQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTopicQuestionMutation, AddTopicQuestionMutationVariables>(AddTopicQuestionDocument, options);
      }
export type AddTopicQuestionMutationHookResult = ReturnType<typeof useAddTopicQuestionMutation>;
export type AddTopicQuestionMutationResult = Apollo.MutationResult<AddTopicQuestionMutation>;
export type AddTopicQuestionMutationOptions = Apollo.BaseMutationOptions<AddTopicQuestionMutation, AddTopicQuestionMutationVariables>;
export const DeleteTopicExplanationDocument = gql`
    mutation DeleteTopicExplanation($spaceId: String!, $explanationInfo: DeleteTopicExplanationInput!) {
  payload: deleteTopicExplanation(
    spaceId: $spaceId
    explanationInfo: $explanationInfo
  ) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type DeleteTopicExplanationMutationFn = Apollo.MutationFunction<DeleteTopicExplanationMutation, DeleteTopicExplanationMutationVariables>;

/**
 * __useDeleteTopicExplanationMutation__
 *
 * To run a mutation, you first call `useDeleteTopicExplanationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTopicExplanationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTopicExplanationMutation, { data, loading, error }] = useDeleteTopicExplanationMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      explanationInfo: // value for 'explanationInfo'
 *   },
 * });
 */
export function useDeleteTopicExplanationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTopicExplanationMutation, DeleteTopicExplanationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTopicExplanationMutation, DeleteTopicExplanationMutationVariables>(DeleteTopicExplanationDocument, options);
      }
export type DeleteTopicExplanationMutationHookResult = ReturnType<typeof useDeleteTopicExplanationMutation>;
export type DeleteTopicExplanationMutationResult = Apollo.MutationResult<DeleteTopicExplanationMutation>;
export type DeleteTopicExplanationMutationOptions = Apollo.BaseMutationOptions<DeleteTopicExplanationMutation, DeleteTopicExplanationMutationVariables>;
export const DeleteTopicSummaryDocument = gql`
    mutation DeleteTopicSummary($spaceId: String!, $summaryInfo: DeleteTopicSummaryInput!) {
  payload: deleteTopicSummary(spaceId: $spaceId, summaryInfo: $summaryInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type DeleteTopicSummaryMutationFn = Apollo.MutationFunction<DeleteTopicSummaryMutation, DeleteTopicSummaryMutationVariables>;

/**
 * __useDeleteTopicSummaryMutation__
 *
 * To run a mutation, you first call `useDeleteTopicSummaryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTopicSummaryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTopicSummaryMutation, { data, loading, error }] = useDeleteTopicSummaryMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      summaryInfo: // value for 'summaryInfo'
 *   },
 * });
 */
export function useDeleteTopicSummaryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTopicSummaryMutation, DeleteTopicSummaryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTopicSummaryMutation, DeleteTopicSummaryMutationVariables>(DeleteTopicSummaryDocument, options);
      }
export type DeleteTopicSummaryMutationHookResult = ReturnType<typeof useDeleteTopicSummaryMutation>;
export type DeleteTopicSummaryMutationResult = Apollo.MutationResult<DeleteTopicSummaryMutation>;
export type DeleteTopicSummaryMutationOptions = Apollo.BaseMutationOptions<DeleteTopicSummaryMutation, DeleteTopicSummaryMutationVariables>;
export const DeleteTopicVideoDocument = gql`
    mutation DeleteTopicVideo($spaceId: String!, $videoInfo: DeleteTopicVideoInput!) {
  payload: deleteTopicVideo(spaceId: $spaceId, videoInfo: $videoInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type DeleteTopicVideoMutationFn = Apollo.MutationFunction<DeleteTopicVideoMutation, DeleteTopicVideoMutationVariables>;

/**
 * __useDeleteTopicVideoMutation__
 *
 * To run a mutation, you first call `useDeleteTopicVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTopicVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTopicVideoMutation, { data, loading, error }] = useDeleteTopicVideoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      videoInfo: // value for 'videoInfo'
 *   },
 * });
 */
export function useDeleteTopicVideoMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTopicVideoMutation, DeleteTopicVideoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTopicVideoMutation, DeleteTopicVideoMutationVariables>(DeleteTopicVideoDocument, options);
      }
export type DeleteTopicVideoMutationHookResult = ReturnType<typeof useDeleteTopicVideoMutation>;
export type DeleteTopicVideoMutationResult = Apollo.MutationResult<DeleteTopicVideoMutation>;
export type DeleteTopicVideoMutationOptions = Apollo.BaseMutationOptions<DeleteTopicVideoMutation, DeleteTopicVideoMutationVariables>;
export const DeleteTopicQuestionDocument = gql`
    mutation DeleteTopicQuestion($spaceId: String!, $questionInfo: DeleteTopicQuestionInput!) {
  payload: deleteTopicQuestion(spaceId: $spaceId, questionInfo: $questionInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type DeleteTopicQuestionMutationFn = Apollo.MutationFunction<DeleteTopicQuestionMutation, DeleteTopicQuestionMutationVariables>;

/**
 * __useDeleteTopicQuestionMutation__
 *
 * To run a mutation, you first call `useDeleteTopicQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTopicQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTopicQuestionMutation, { data, loading, error }] = useDeleteTopicQuestionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      questionInfo: // value for 'questionInfo'
 *   },
 * });
 */
export function useDeleteTopicQuestionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTopicQuestionMutation, DeleteTopicQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTopicQuestionMutation, DeleteTopicQuestionMutationVariables>(DeleteTopicQuestionDocument, options);
      }
export type DeleteTopicQuestionMutationHookResult = ReturnType<typeof useDeleteTopicQuestionMutation>;
export type DeleteTopicQuestionMutationResult = Apollo.MutationResult<DeleteTopicQuestionMutation>;
export type DeleteTopicQuestionMutationOptions = Apollo.BaseMutationOptions<DeleteTopicQuestionMutation, DeleteTopicQuestionMutationVariables>;
export const MoveTopicExplanationDocument = gql`
    mutation MoveTopicExplanation($spaceId: String!, $explanationInfo: MoveTopicExplanationInput!) {
  payload: moveTopicExplanation(
    spaceId: $spaceId
    explanationInfo: $explanationInfo
  ) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type MoveTopicExplanationMutationFn = Apollo.MutationFunction<MoveTopicExplanationMutation, MoveTopicExplanationMutationVariables>;

/**
 * __useMoveTopicExplanationMutation__
 *
 * To run a mutation, you first call `useMoveTopicExplanationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveTopicExplanationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveTopicExplanationMutation, { data, loading, error }] = useMoveTopicExplanationMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      explanationInfo: // value for 'explanationInfo'
 *   },
 * });
 */
export function useMoveTopicExplanationMutation(baseOptions?: Apollo.MutationHookOptions<MoveTopicExplanationMutation, MoveTopicExplanationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveTopicExplanationMutation, MoveTopicExplanationMutationVariables>(MoveTopicExplanationDocument, options);
      }
export type MoveTopicExplanationMutationHookResult = ReturnType<typeof useMoveTopicExplanationMutation>;
export type MoveTopicExplanationMutationResult = Apollo.MutationResult<MoveTopicExplanationMutation>;
export type MoveTopicExplanationMutationOptions = Apollo.BaseMutationOptions<MoveTopicExplanationMutation, MoveTopicExplanationMutationVariables>;
export const MoveTopicSummaryDocument = gql`
    mutation MoveTopicSummary($spaceId: String!, $summaryInfo: MoveTopicSummaryInput!) {
  payload: moveTopicSummary(spaceId: $spaceId, summaryInfo: $summaryInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type MoveTopicSummaryMutationFn = Apollo.MutationFunction<MoveTopicSummaryMutation, MoveTopicSummaryMutationVariables>;

/**
 * __useMoveTopicSummaryMutation__
 *
 * To run a mutation, you first call `useMoveTopicSummaryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveTopicSummaryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveTopicSummaryMutation, { data, loading, error }] = useMoveTopicSummaryMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      summaryInfo: // value for 'summaryInfo'
 *   },
 * });
 */
export function useMoveTopicSummaryMutation(baseOptions?: Apollo.MutationHookOptions<MoveTopicSummaryMutation, MoveTopicSummaryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveTopicSummaryMutation, MoveTopicSummaryMutationVariables>(MoveTopicSummaryDocument, options);
      }
export type MoveTopicSummaryMutationHookResult = ReturnType<typeof useMoveTopicSummaryMutation>;
export type MoveTopicSummaryMutationResult = Apollo.MutationResult<MoveTopicSummaryMutation>;
export type MoveTopicSummaryMutationOptions = Apollo.BaseMutationOptions<MoveTopicSummaryMutation, MoveTopicSummaryMutationVariables>;
export const MoveTopicVideoDocument = gql`
    mutation MoveTopicVideo($spaceId: String!, $videoInfo: MoveTopicVideoInput!) {
  payload: moveTopicVideo(spaceId: $spaceId, videoInfo: $videoInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type MoveTopicVideoMutationFn = Apollo.MutationFunction<MoveTopicVideoMutation, MoveTopicVideoMutationVariables>;

/**
 * __useMoveTopicVideoMutation__
 *
 * To run a mutation, you first call `useMoveTopicVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveTopicVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveTopicVideoMutation, { data, loading, error }] = useMoveTopicVideoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      videoInfo: // value for 'videoInfo'
 *   },
 * });
 */
export function useMoveTopicVideoMutation(baseOptions?: Apollo.MutationHookOptions<MoveTopicVideoMutation, MoveTopicVideoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveTopicVideoMutation, MoveTopicVideoMutationVariables>(MoveTopicVideoDocument, options);
      }
export type MoveTopicVideoMutationHookResult = ReturnType<typeof useMoveTopicVideoMutation>;
export type MoveTopicVideoMutationResult = Apollo.MutationResult<MoveTopicVideoMutation>;
export type MoveTopicVideoMutationOptions = Apollo.BaseMutationOptions<MoveTopicVideoMutation, MoveTopicVideoMutationVariables>;
export const MoveTopicQuestionDocument = gql`
    mutation MoveTopicQuestion($spaceId: String!, $questionInfo: MoveTopicQuestionInput!) {
  payload: moveTopicQuestion(spaceId: $spaceId, questionInfo: $questionInfo) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;
export type MoveTopicQuestionMutationFn = Apollo.MutationFunction<MoveTopicQuestionMutation, MoveTopicQuestionMutationVariables>;

/**
 * __useMoveTopicQuestionMutation__
 *
 * To run a mutation, you first call `useMoveTopicQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveTopicQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveTopicQuestionMutation, { data, loading, error }] = useMoveTopicQuestionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      questionInfo: // value for 'questionInfo'
 *   },
 * });
 */
export function useMoveTopicQuestionMutation(baseOptions?: Apollo.MutationHookOptions<MoveTopicQuestionMutation, MoveTopicQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveTopicQuestionMutation, MoveTopicQuestionMutationVariables>(MoveTopicQuestionDocument, options);
      }
export type MoveTopicQuestionMutationHookResult = ReturnType<typeof useMoveTopicQuestionMutation>;
export type MoveTopicQuestionMutationResult = Apollo.MutationResult<MoveTopicQuestionMutation>;
export type MoveTopicQuestionMutationOptions = Apollo.BaseMutationOptions<MoveTopicQuestionMutation, MoveTopicQuestionMutationVariables>;
export const RawGitCourseDocument = gql`
    query RawGitCourse($spaceId: String!, $key: String!) {
  payload: rawGitCourse(spaceId: $spaceId, key: $key) {
    key
    courseJsonUrl
    courseRepoUrl
    weight
  }
}
    `;

/**
 * __useRawGitCourseQuery__
 *
 * To run a query within a React component, call `useRawGitCourseQuery` and pass it any options that fit your needs.
 * When your component renders, `useRawGitCourseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRawGitCourseQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      key: // value for 'key'
 *   },
 * });
 */
export function useRawGitCourseQuery(baseOptions: Apollo.QueryHookOptions<RawGitCourseQuery, RawGitCourseQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RawGitCourseQuery, RawGitCourseQueryVariables>(RawGitCourseDocument, options);
      }
export function useRawGitCourseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RawGitCourseQuery, RawGitCourseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RawGitCourseQuery, RawGitCourseQueryVariables>(RawGitCourseDocument, options);
        }
export type RawGitCourseQueryHookResult = ReturnType<typeof useRawGitCourseQuery>;
export type RawGitCourseLazyQueryHookResult = ReturnType<typeof useRawGitCourseLazyQuery>;
export type RawGitCourseQueryResult = Apollo.QueryResult<RawGitCourseQuery, RawGitCourseQueryVariables>;
export function refetchRawGitCourseQuery(variables: RawGitCourseQueryVariables) {
      return { query: RawGitCourseDocument, variables: variables }
    }
export const GitCourseSummarizedDocument = gql`
    query GitCourseSummarized($spaceId: String!, $key: String!) {
  payload: gitCourseSummarized(spaceId: $spaceId, key: $key) {
    key
    title
    summary
    details
    duration
    courseAdmins
    topics {
      title
      key
      details
    }
  }
}
    `;

/**
 * __useGitCourseSummarizedQuery__
 *
 * To run a query within a React component, call `useGitCourseSummarizedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGitCourseSummarizedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGitCourseSummarizedQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      key: // value for 'key'
 *   },
 * });
 */
export function useGitCourseSummarizedQuery(baseOptions: Apollo.QueryHookOptions<GitCourseSummarizedQuery, GitCourseSummarizedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GitCourseSummarizedQuery, GitCourseSummarizedQueryVariables>(GitCourseSummarizedDocument, options);
      }
export function useGitCourseSummarizedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GitCourseSummarizedQuery, GitCourseSummarizedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GitCourseSummarizedQuery, GitCourseSummarizedQueryVariables>(GitCourseSummarizedDocument, options);
        }
export type GitCourseSummarizedQueryHookResult = ReturnType<typeof useGitCourseSummarizedQuery>;
export type GitCourseSummarizedLazyQueryHookResult = ReturnType<typeof useGitCourseSummarizedLazyQuery>;
export type GitCourseSummarizedQueryResult = Apollo.QueryResult<GitCourseSummarizedQuery, GitCourseSummarizedQueryVariables>;
export function refetchGitCourseSummarizedQuery(variables: GitCourseSummarizedQueryVariables) {
      return { query: GitCourseSummarizedDocument, variables: variables }
    }
export const GitCourseQueryDocument = gql`
    query GitCourseQuery($spaceId: String!, $courseKey: String!) {
  course: gitCourse(spaceId: $spaceId, courseKey: $courseKey) {
    ...CourseDetails
  }
}
    ${CourseDetailsFragmentDoc}`;

/**
 * __useGitCourseQueryQuery__
 *
 * To run a query within a React component, call `useGitCourseQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGitCourseQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGitCourseQueryQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      courseKey: // value for 'courseKey'
 *   },
 * });
 */
export function useGitCourseQueryQuery(baseOptions: Apollo.QueryHookOptions<GitCourseQueryQuery, GitCourseQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GitCourseQueryQuery, GitCourseQueryQueryVariables>(GitCourseQueryDocument, options);
      }
export function useGitCourseQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GitCourseQueryQuery, GitCourseQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GitCourseQueryQuery, GitCourseQueryQueryVariables>(GitCourseQueryDocument, options);
        }
export type GitCourseQueryQueryHookResult = ReturnType<typeof useGitCourseQueryQuery>;
export type GitCourseQueryLazyQueryHookResult = ReturnType<typeof useGitCourseQueryLazyQuery>;
export type GitCourseQueryQueryResult = Apollo.QueryResult<GitCourseQueryQuery, GitCourseQueryQueryVariables>;
export function refetchGitCourseQueryQuery(variables: GitCourseQueryQueryVariables) {
      return { query: GitCourseQueryDocument, variables: variables }
    }
export const CoursesQueryDocument = gql`
    query CoursesQuery($spaceId: String!) {
  courses(spaceId: $spaceId) {
    ...Course
  }
}
    ${CourseFragmentDoc}`;

/**
 * __useCoursesQueryQuery__
 *
 * To run a query within a React component, call `useCoursesQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoursesQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoursesQueryQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useCoursesQueryQuery(baseOptions: Apollo.QueryHookOptions<CoursesQueryQuery, CoursesQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CoursesQueryQuery, CoursesQueryQueryVariables>(CoursesQueryDocument, options);
      }
export function useCoursesQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CoursesQueryQuery, CoursesQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CoursesQueryQuery, CoursesQueryQueryVariables>(CoursesQueryDocument, options);
        }
export type CoursesQueryQueryHookResult = ReturnType<typeof useCoursesQueryQuery>;
export type CoursesQueryLazyQueryHookResult = ReturnType<typeof useCoursesQueryLazyQuery>;
export type CoursesQueryQueryResult = Apollo.QueryResult<CoursesQueryQuery, CoursesQueryQueryVariables>;
export function refetchCoursesQueryQuery(variables: CoursesQueryQueryVariables) {
      return { query: CoursesQueryDocument, variables: variables }
    }
export const UpsertGnosisSafeWalletsDocument = gql`
    mutation UpsertGnosisSafeWallets($spaceId: String!, $wallets: [GnosisSafeWalletInput!]!) {
  payload: upsertGnosisSafeWallets(spaceId: $spaceId, wallets: $wallets) {
    id
  }
}
    `;
export type UpsertGnosisSafeWalletsMutationFn = Apollo.MutationFunction<UpsertGnosisSafeWalletsMutation, UpsertGnosisSafeWalletsMutationVariables>;

/**
 * __useUpsertGnosisSafeWalletsMutation__
 *
 * To run a mutation, you first call `useUpsertGnosisSafeWalletsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGnosisSafeWalletsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGnosisSafeWalletsMutation, { data, loading, error }] = useUpsertGnosisSafeWalletsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      wallets: // value for 'wallets'
 *   },
 * });
 */
export function useUpsertGnosisSafeWalletsMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGnosisSafeWalletsMutation, UpsertGnosisSafeWalletsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGnosisSafeWalletsMutation, UpsertGnosisSafeWalletsMutationVariables>(UpsertGnosisSafeWalletsDocument, options);
      }
export type UpsertGnosisSafeWalletsMutationHookResult = ReturnType<typeof useUpsertGnosisSafeWalletsMutation>;
export type UpsertGnosisSafeWalletsMutationResult = Apollo.MutationResult<UpsertGnosisSafeWalletsMutation>;
export type UpsertGnosisSafeWalletsMutationOptions = Apollo.BaseMutationOptions<UpsertGnosisSafeWalletsMutation, UpsertGnosisSafeWalletsMutationVariables>;
export const UpsertGuideDocument = gql`
    mutation UpsertGuide($spaceId: String!, $guideInput: GuideInput!) {
  payload: upsertGuide(spaceId: $spaceId, guideInput: $guideInput) {
    ...Guide
  }
}
    ${GuideFragmentDoc}`;
export type UpsertGuideMutationFn = Apollo.MutationFunction<UpsertGuideMutation, UpsertGuideMutationVariables>;

/**
 * __useUpsertGuideMutation__
 *
 * To run a mutation, you first call `useUpsertGuideMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGuideMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGuideMutation, { data, loading, error }] = useUpsertGuideMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      guideInput: // value for 'guideInput'
 *   },
 * });
 */
export function useUpsertGuideMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGuideMutation, UpsertGuideMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGuideMutation, UpsertGuideMutationVariables>(UpsertGuideDocument, options);
      }
export type UpsertGuideMutationHookResult = ReturnType<typeof useUpsertGuideMutation>;
export type UpsertGuideMutationResult = Apollo.MutationResult<UpsertGuideMutation>;
export type UpsertGuideMutationOptions = Apollo.BaseMutationOptions<UpsertGuideMutation, UpsertGuideMutationVariables>;
export const GuideQueryDocument = gql`
    query GuideQuery($spaceId: String!, $uuid: String!) {
  guide(spaceId: $spaceId, uuid: $uuid) {
    ...Guide
  }
}
    ${GuideFragmentDoc}`;

/**
 * __useGuideQueryQuery__
 *
 * To run a query within a React component, call `useGuideQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGuideQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGuideQueryQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      uuid: // value for 'uuid'
 *   },
 * });
 */
export function useGuideQueryQuery(baseOptions: Apollo.QueryHookOptions<GuideQueryQuery, GuideQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GuideQueryQuery, GuideQueryQueryVariables>(GuideQueryDocument, options);
      }
export function useGuideQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GuideQueryQuery, GuideQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GuideQueryQuery, GuideQueryQueryVariables>(GuideQueryDocument, options);
        }
export type GuideQueryQueryHookResult = ReturnType<typeof useGuideQueryQuery>;
export type GuideQueryLazyQueryHookResult = ReturnType<typeof useGuideQueryLazyQuery>;
export type GuideQueryQueryResult = Apollo.QueryResult<GuideQueryQuery, GuideQueryQueryVariables>;
export function refetchGuideQueryQuery(variables: GuideQueryQueryVariables) {
      return { query: GuideQueryDocument, variables: variables }
    }
export const RefreshGitGuidesDocument = gql`
    mutation RefreshGitGuides($spaceId: String!) {
  payload: refreshGitGuides(spaceId: $spaceId)
}
    `;
export type RefreshGitGuidesMutationFn = Apollo.MutationFunction<RefreshGitGuidesMutation, RefreshGitGuidesMutationVariables>;

/**
 * __useRefreshGitGuidesMutation__
 *
 * To run a mutation, you first call `useRefreshGitGuidesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshGitGuidesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshGitGuidesMutation, { data, loading, error }] = useRefreshGitGuidesMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useRefreshGitGuidesMutation(baseOptions?: Apollo.MutationHookOptions<RefreshGitGuidesMutation, RefreshGitGuidesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshGitGuidesMutation, RefreshGitGuidesMutationVariables>(RefreshGitGuidesDocument, options);
      }
export type RefreshGitGuidesMutationHookResult = ReturnType<typeof useRefreshGitGuidesMutation>;
export type RefreshGitGuidesMutationResult = Apollo.MutationResult<RefreshGitGuidesMutation>;
export type RefreshGitGuidesMutationOptions = Apollo.BaseMutationOptions<RefreshGitGuidesMutation, RefreshGitGuidesMutationVariables>;
export const GuideSubmissionsQueryDocument = gql`
    query GuideSubmissionsQuery($guideUuid: String!) {
  guideSubmissions(guideUuid: $guideUuid) {
    id
    created
    createdBy
    guideId
    guideUuid
    result {
      correctQuestions
      wrongQuestions
      allQuestions
    }
    spaceId
    uuid
  }
}
    `;

/**
 * __useGuideSubmissionsQueryQuery__
 *
 * To run a query within a React component, call `useGuideSubmissionsQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGuideSubmissionsQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGuideSubmissionsQueryQuery({
 *   variables: {
 *      guideUuid: // value for 'guideUuid'
 *   },
 * });
 */
export function useGuideSubmissionsQueryQuery(baseOptions: Apollo.QueryHookOptions<GuideSubmissionsQueryQuery, GuideSubmissionsQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GuideSubmissionsQueryQuery, GuideSubmissionsQueryQueryVariables>(GuideSubmissionsQueryDocument, options);
      }
export function useGuideSubmissionsQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GuideSubmissionsQueryQuery, GuideSubmissionsQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GuideSubmissionsQueryQuery, GuideSubmissionsQueryQueryVariables>(GuideSubmissionsQueryDocument, options);
        }
export type GuideSubmissionsQueryQueryHookResult = ReturnType<typeof useGuideSubmissionsQueryQuery>;
export type GuideSubmissionsQueryLazyQueryHookResult = ReturnType<typeof useGuideSubmissionsQueryLazyQuery>;
export type GuideSubmissionsQueryQueryResult = Apollo.QueryResult<GuideSubmissionsQueryQuery, GuideSubmissionsQueryQueryVariables>;
export function refetchGuideSubmissionsQueryQuery(variables: GuideSubmissionsQueryQueryVariables) {
      return { query: GuideSubmissionsQueryDocument, variables: variables }
    }
export const SubmitGuideDocument = gql`
    mutation SubmitGuide($input: GuideSubmissionInput!) {
  payload: submitGuide(submissionInput: $input) {
    result {
      wrongQuestions
      correctQuestions
      allQuestions
    }
    galaxyCredentialsUpdated
  }
}
    `;
export type SubmitGuideMutationFn = Apollo.MutationFunction<SubmitGuideMutation, SubmitGuideMutationVariables>;

/**
 * __useSubmitGuideMutation__
 *
 * To run a mutation, you first call `useSubmitGuideMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitGuideMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitGuideMutation, { data, loading, error }] = useSubmitGuideMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitGuideMutation(baseOptions?: Apollo.MutationHookOptions<SubmitGuideMutation, SubmitGuideMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitGuideMutation, SubmitGuideMutationVariables>(SubmitGuideDocument, options);
      }
export type SubmitGuideMutationHookResult = ReturnType<typeof useSubmitGuideMutation>;
export type SubmitGuideMutationResult = Apollo.MutationResult<SubmitGuideMutation>;
export type SubmitGuideMutationOptions = Apollo.BaseMutationOptions<SubmitGuideMutation, SubmitGuideMutationVariables>;
export const GuidesQueryDocument = gql`
    query GuidesQuery($space: String!) {
  guides(spaceId: $space) {
    ...GuideSummary
  }
}
    ${GuideSummaryFragmentDoc}`;

/**
 * __useGuidesQueryQuery__
 *
 * To run a query within a React component, call `useGuidesQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGuidesQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGuidesQueryQuery({
 *   variables: {
 *      space: // value for 'space'
 *   },
 * });
 */
export function useGuidesQueryQuery(baseOptions: Apollo.QueryHookOptions<GuidesQueryQuery, GuidesQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GuidesQueryQuery, GuidesQueryQueryVariables>(GuidesQueryDocument, options);
      }
export function useGuidesQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GuidesQueryQuery, GuidesQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GuidesQueryQuery, GuidesQueryQueryVariables>(GuidesQueryDocument, options);
        }
export type GuidesQueryQueryHookResult = ReturnType<typeof useGuidesQueryQuery>;
export type GuidesQueryLazyQueryHookResult = ReturnType<typeof useGuidesQueryLazyQuery>;
export type GuidesQueryQueryResult = Apollo.QueryResult<GuidesQueryQuery, GuidesQueryQueryVariables>;
export function refetchGuidesQueryQuery(variables: GuidesQueryQueryVariables) {
      return { query: GuidesQueryDocument, variables: variables }
    }
export const AskCompletionAiDocument = gql`
    mutation AskCompletionAI($input: CompletionAIInput!) {
  askCompletionAI(input: $input) {
    choices {
      finish_reason
      index
      logprobs {
        text
        text_offset
        token_logprobs
        tokens
      }
      text
    }
    created
    id
    model
    object
    usage {
      completion_tokens
      prompt_tokens
      total_tokens
    }
  }
}
    `;
export type AskCompletionAiMutationFn = Apollo.MutationFunction<AskCompletionAiMutation, AskCompletionAiMutationVariables>;

/**
 * __useAskCompletionAiMutation__
 *
 * To run a mutation, you first call `useAskCompletionAiMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAskCompletionAiMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [askCompletionAiMutation, { data, loading, error }] = useAskCompletionAiMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAskCompletionAiMutation(baseOptions?: Apollo.MutationHookOptions<AskCompletionAiMutation, AskCompletionAiMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AskCompletionAiMutation, AskCompletionAiMutationVariables>(AskCompletionAiDocument, options);
      }
export type AskCompletionAiMutationHookResult = ReturnType<typeof useAskCompletionAiMutation>;
export type AskCompletionAiMutationResult = Apollo.MutationResult<AskCompletionAiMutation>;
export type AskCompletionAiMutationOptions = Apollo.BaseMutationOptions<AskCompletionAiMutation, AskCompletionAiMutationVariables>;
export const AskChatCompletionAiDocument = gql`
    mutation AskChatCompletionAI($input: ChatCompletionAIInput!) {
  askChatCompletionAI(input: $input) {
    choices {
      message {
        content
        role
      }
      finish_reason
      index
    }
    created
    id
    model
    object
    usage {
      completion_tokens
      prompt_tokens
      total_tokens
    }
  }
}
    `;
export type AskChatCompletionAiMutationFn = Apollo.MutationFunction<AskChatCompletionAiMutation, AskChatCompletionAiMutationVariables>;

/**
 * __useAskChatCompletionAiMutation__
 *
 * To run a mutation, you first call `useAskChatCompletionAiMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAskChatCompletionAiMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [askChatCompletionAiMutation, { data, loading, error }] = useAskChatCompletionAiMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAskChatCompletionAiMutation(baseOptions?: Apollo.MutationHookOptions<AskChatCompletionAiMutation, AskChatCompletionAiMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AskChatCompletionAiMutation, AskChatCompletionAiMutationVariables>(AskChatCompletionAiDocument, options);
      }
export type AskChatCompletionAiMutationHookResult = ReturnType<typeof useAskChatCompletionAiMutation>;
export type AskChatCompletionAiMutationResult = Apollo.MutationResult<AskChatCompletionAiMutation>;
export type AskChatCompletionAiMutationOptions = Apollo.BaseMutationOptions<AskChatCompletionAiMutation, AskChatCompletionAiMutationVariables>;
export const CreateSummaryOfContentDocument = gql`
    mutation CreateSummaryOfContent($input: String!) {
  createSummaryOfContent(input: $input) {
    text
    tokenCount
  }
}
    `;
export type CreateSummaryOfContentMutationFn = Apollo.MutationFunction<CreateSummaryOfContentMutation, CreateSummaryOfContentMutationVariables>;

/**
 * __useCreateSummaryOfContentMutation__
 *
 * To run a mutation, you first call `useCreateSummaryOfContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSummaryOfContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSummaryOfContentMutation, { data, loading, error }] = useCreateSummaryOfContentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSummaryOfContentMutation(baseOptions?: Apollo.MutationHookOptions<CreateSummaryOfContentMutation, CreateSummaryOfContentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSummaryOfContentMutation, CreateSummaryOfContentMutationVariables>(CreateSummaryOfContentDocument, options);
      }
export type CreateSummaryOfContentMutationHookResult = ReturnType<typeof useCreateSummaryOfContentMutation>;
export type CreateSummaryOfContentMutationResult = Apollo.MutationResult<CreateSummaryOfContentMutation>;
export type CreateSummaryOfContentMutationOptions = Apollo.BaseMutationOptions<CreateSummaryOfContentMutation, CreateSummaryOfContentMutationVariables>;
export const ExtractRelevantTextForTopicDocument = gql`
    mutation ExtractRelevantTextForTopic($input: ExtractRelevantTextForTopicInput!) {
  extractRelevantTextForTopic(input: $input) {
    text
    tokenCount
  }
}
    `;
export type ExtractRelevantTextForTopicMutationFn = Apollo.MutationFunction<ExtractRelevantTextForTopicMutation, ExtractRelevantTextForTopicMutationVariables>;

/**
 * __useExtractRelevantTextForTopicMutation__
 *
 * To run a mutation, you first call `useExtractRelevantTextForTopicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExtractRelevantTextForTopicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [extractRelevantTextForTopicMutation, { data, loading, error }] = useExtractRelevantTextForTopicMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useExtractRelevantTextForTopicMutation(baseOptions?: Apollo.MutationHookOptions<ExtractRelevantTextForTopicMutation, ExtractRelevantTextForTopicMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExtractRelevantTextForTopicMutation, ExtractRelevantTextForTopicMutationVariables>(ExtractRelevantTextForTopicDocument, options);
      }
export type ExtractRelevantTextForTopicMutationHookResult = ReturnType<typeof useExtractRelevantTextForTopicMutation>;
export type ExtractRelevantTextForTopicMutationResult = Apollo.MutationResult<ExtractRelevantTextForTopicMutation>;
export type ExtractRelevantTextForTopicMutationOptions = Apollo.BaseMutationOptions<ExtractRelevantTextForTopicMutation, ExtractRelevantTextForTopicMutationVariables>;
export const DownloadAndCleanContentDocument = gql`
    mutation DownloadAndCleanContent($input: String!) {
  downloadAndCleanContent(input: $input) {
    text
    tokenCount
  }
}
    `;
export type DownloadAndCleanContentMutationFn = Apollo.MutationFunction<DownloadAndCleanContentMutation, DownloadAndCleanContentMutationVariables>;

/**
 * __useDownloadAndCleanContentMutation__
 *
 * To run a mutation, you first call `useDownloadAndCleanContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDownloadAndCleanContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [downloadAndCleanContentMutation, { data, loading, error }] = useDownloadAndCleanContentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDownloadAndCleanContentMutation(baseOptions?: Apollo.MutationHookOptions<DownloadAndCleanContentMutation, DownloadAndCleanContentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DownloadAndCleanContentMutation, DownloadAndCleanContentMutationVariables>(DownloadAndCleanContentDocument, options);
      }
export type DownloadAndCleanContentMutationHookResult = ReturnType<typeof useDownloadAndCleanContentMutation>;
export type DownloadAndCleanContentMutationResult = Apollo.MutationResult<DownloadAndCleanContentMutation>;
export type DownloadAndCleanContentMutationOptions = Apollo.BaseMutationOptions<DownloadAndCleanContentMutation, DownloadAndCleanContentMutationVariables>;
export const SimulationsDocument = gql`
    query Simulations($spaceId: String!) {
  simulations(spaceId: $spaceId) {
    postSubmissionStepContent
    content
    created
    id
    name
    publishStatus
    admins
    tags
    priority
  }
}
    `;

/**
 * __useSimulationsQuery__
 *
 * To run a query within a React component, call `useSimulationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSimulationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSimulationsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSimulationsQuery(baseOptions: Apollo.QueryHookOptions<SimulationsQuery, SimulationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SimulationsQuery, SimulationsQueryVariables>(SimulationsDocument, options);
      }
export function useSimulationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SimulationsQuery, SimulationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SimulationsQuery, SimulationsQueryVariables>(SimulationsDocument, options);
        }
export type SimulationsQueryHookResult = ReturnType<typeof useSimulationsQuery>;
export type SimulationsLazyQueryHookResult = ReturnType<typeof useSimulationsLazyQuery>;
export type SimulationsQueryResult = Apollo.QueryResult<SimulationsQuery, SimulationsQueryVariables>;
export function refetchSimulationsQuery(variables: SimulationsQueryVariables) {
      return { query: SimulationsDocument, variables: variables }
    }
export const SimulationDetailsDocument = gql`
    query SimulationDetails($spaceId: String!, $simulationId: String!) {
  simulation(spaceId: $spaceId, simulationId: $simulationId) {
    ...SimulationDetails
  }
}
    ${SimulationDetailsFragmentDoc}`;

/**
 * __useSimulationDetailsQuery__
 *
 * To run a query within a React component, call `useSimulationDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSimulationDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSimulationDetailsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      simulationId: // value for 'simulationId'
 *   },
 * });
 */
export function useSimulationDetailsQuery(baseOptions: Apollo.QueryHookOptions<SimulationDetailsQuery, SimulationDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SimulationDetailsQuery, SimulationDetailsQueryVariables>(SimulationDetailsDocument, options);
      }
export function useSimulationDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SimulationDetailsQuery, SimulationDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SimulationDetailsQuery, SimulationDetailsQueryVariables>(SimulationDetailsDocument, options);
        }
export type SimulationDetailsQueryHookResult = ReturnType<typeof useSimulationDetailsQuery>;
export type SimulationDetailsLazyQueryHookResult = ReturnType<typeof useSimulationDetailsLazyQuery>;
export type SimulationDetailsQueryResult = Apollo.QueryResult<SimulationDetailsQuery, SimulationDetailsQueryVariables>;
export function refetchSimulationDetailsQuery(variables: SimulationDetailsQueryVariables) {
      return { query: SimulationDetailsDocument, variables: variables }
    }
export const UpsertSimulationDocument = gql`
    mutation UpsertSimulation($spaceId: String!, $input: UpsertSimulationInput!) {
  payload: upsertSimulation(spaceId: $spaceId, input: $input) {
    ...SimulationDetails
  }
}
    ${SimulationDetailsFragmentDoc}`;
export type UpsertSimulationMutationFn = Apollo.MutationFunction<UpsertSimulationMutation, UpsertSimulationMutationVariables>;

/**
 * __useUpsertSimulationMutation__
 *
 * To run a mutation, you first call `useUpsertSimulationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSimulationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSimulationMutation, { data, loading, error }] = useUpsertSimulationMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertSimulationMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSimulationMutation, UpsertSimulationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSimulationMutation, UpsertSimulationMutationVariables>(UpsertSimulationDocument, options);
      }
export type UpsertSimulationMutationHookResult = ReturnType<typeof useUpsertSimulationMutation>;
export type UpsertSimulationMutationResult = Apollo.MutationResult<UpsertSimulationMutation>;
export type UpsertSimulationMutationOptions = Apollo.BaseMutationOptions<UpsertSimulationMutation, UpsertSimulationMutationVariables>;
export const ExtendedSpaceDocument = gql`
    query ExtendedSpace($spaceId: String!) {
  space(id: $spaceId) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;

/**
 * __useExtendedSpaceQuery__
 *
 * To run a query within a React component, call `useExtendedSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useExtendedSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExtendedSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useExtendedSpaceQuery(baseOptions: Apollo.QueryHookOptions<ExtendedSpaceQuery, ExtendedSpaceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExtendedSpaceQuery, ExtendedSpaceQueryVariables>(ExtendedSpaceDocument, options);
      }
export function useExtendedSpaceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExtendedSpaceQuery, ExtendedSpaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExtendedSpaceQuery, ExtendedSpaceQueryVariables>(ExtendedSpaceDocument, options);
        }
export type ExtendedSpaceQueryHookResult = ReturnType<typeof useExtendedSpaceQuery>;
export type ExtendedSpaceLazyQueryHookResult = ReturnType<typeof useExtendedSpaceLazyQuery>;
export type ExtendedSpaceQueryResult = Apollo.QueryResult<ExtendedSpaceQuery, ExtendedSpaceQueryVariables>;
export function refetchExtendedSpaceQuery(variables: ExtendedSpaceQueryVariables) {
      return { query: ExtendedSpaceDocument, variables: variables }
    }
export const ExtendedSpaceByDomainDocument = gql`
    query ExtendedSpaceByDomain($domain: String!) {
  space(domain: $domain) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;

/**
 * __useExtendedSpaceByDomainQuery__
 *
 * To run a query within a React component, call `useExtendedSpaceByDomainQuery` and pass it any options that fit your needs.
 * When your component renders, `useExtendedSpaceByDomainQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExtendedSpaceByDomainQuery({
 *   variables: {
 *      domain: // value for 'domain'
 *   },
 * });
 */
export function useExtendedSpaceByDomainQuery(baseOptions: Apollo.QueryHookOptions<ExtendedSpaceByDomainQuery, ExtendedSpaceByDomainQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExtendedSpaceByDomainQuery, ExtendedSpaceByDomainQueryVariables>(ExtendedSpaceByDomainDocument, options);
      }
export function useExtendedSpaceByDomainLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExtendedSpaceByDomainQuery, ExtendedSpaceByDomainQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExtendedSpaceByDomainQuery, ExtendedSpaceByDomainQueryVariables>(ExtendedSpaceByDomainDocument, options);
        }
export type ExtendedSpaceByDomainQueryHookResult = ReturnType<typeof useExtendedSpaceByDomainQuery>;
export type ExtendedSpaceByDomainLazyQueryHookResult = ReturnType<typeof useExtendedSpaceByDomainLazyQuery>;
export type ExtendedSpaceByDomainQueryResult = Apollo.QueryResult<ExtendedSpaceByDomainQuery, ExtendedSpaceByDomainQueryVariables>;
export function refetchExtendedSpaceByDomainQuery(variables: ExtendedSpaceByDomainQueryVariables) {
      return { query: ExtendedSpaceByDomainDocument, variables: variables }
    }
export const SpaceDiscordGuildDocument = gql`
    query SpaceDiscordGuild($spaceId: String!) {
  payload: spaceDiscordGuild(spaceId: $spaceId)
}
    `;

/**
 * __useSpaceDiscordGuildQuery__
 *
 * To run a query within a React component, call `useSpaceDiscordGuildQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDiscordGuildQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDiscordGuildQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceDiscordGuildQuery(baseOptions: Apollo.QueryHookOptions<SpaceDiscordGuildQuery, SpaceDiscordGuildQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SpaceDiscordGuildQuery, SpaceDiscordGuildQueryVariables>(SpaceDiscordGuildDocument, options);
      }
export function useSpaceDiscordGuildLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SpaceDiscordGuildQuery, SpaceDiscordGuildQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SpaceDiscordGuildQuery, SpaceDiscordGuildQueryVariables>(SpaceDiscordGuildDocument, options);
        }
export type SpaceDiscordGuildQueryHookResult = ReturnType<typeof useSpaceDiscordGuildQuery>;
export type SpaceDiscordGuildLazyQueryHookResult = ReturnType<typeof useSpaceDiscordGuildLazyQuery>;
export type SpaceDiscordGuildQueryResult = Apollo.QueryResult<SpaceDiscordGuildQuery, SpaceDiscordGuildQueryVariables>;
export function refetchSpaceDiscordGuildQuery(variables: SpaceDiscordGuildQueryVariables) {
      return { query: SpaceDiscordGuildDocument, variables: variables }
    }
export const UpsertSpaceFeaturesDocument = gql`
    mutation UpsertSpaceFeatures($spaceId: String!, $features: [String!]!) {
  payload: upsertSpaceFeatures(spaceId: $spaceId, features: $features) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type UpsertSpaceFeaturesMutationFn = Apollo.MutationFunction<UpsertSpaceFeaturesMutation, UpsertSpaceFeaturesMutationVariables>;

/**
 * __useUpsertSpaceFeaturesMutation__
 *
 * To run a mutation, you first call `useUpsertSpaceFeaturesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSpaceFeaturesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSpaceFeaturesMutation, { data, loading, error }] = useUpsertSpaceFeaturesMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      features: // value for 'features'
 *   },
 * });
 */
export function useUpsertSpaceFeaturesMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSpaceFeaturesMutation, UpsertSpaceFeaturesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSpaceFeaturesMutation, UpsertSpaceFeaturesMutationVariables>(UpsertSpaceFeaturesDocument, options);
      }
export type UpsertSpaceFeaturesMutationHookResult = ReturnType<typeof useUpsertSpaceFeaturesMutation>;
export type UpsertSpaceFeaturesMutationResult = Apollo.MutationResult<UpsertSpaceFeaturesMutation>;
export type UpsertSpaceFeaturesMutationOptions = Apollo.BaseMutationOptions<UpsertSpaceFeaturesMutation, UpsertSpaceFeaturesMutationVariables>;
export const UpsertSpaceInviteLinksDocument = gql`
    mutation UpsertSpaceInviteLinks($spaceId: String!, $spaceInviteArgs: SpaceInviteArgs!) {
  payload: upsertSpaceInviteLinks(
    spaceId: $spaceId
    spaceInviteArgs: $spaceInviteArgs
  ) {
    id
  }
}
    `;
export type UpsertSpaceInviteLinksMutationFn = Apollo.MutationFunction<UpsertSpaceInviteLinksMutation, UpsertSpaceInviteLinksMutationVariables>;

/**
 * __useUpsertSpaceInviteLinksMutation__
 *
 * To run a mutation, you first call `useUpsertSpaceInviteLinksMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSpaceInviteLinksMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSpaceInviteLinksMutation, { data, loading, error }] = useUpsertSpaceInviteLinksMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      spaceInviteArgs: // value for 'spaceInviteArgs'
 *   },
 * });
 */
export function useUpsertSpaceInviteLinksMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSpaceInviteLinksMutation, UpsertSpaceInviteLinksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSpaceInviteLinksMutation, UpsertSpaceInviteLinksMutationVariables>(UpsertSpaceInviteLinksDocument, options);
      }
export type UpsertSpaceInviteLinksMutationHookResult = ReturnType<typeof useUpsertSpaceInviteLinksMutation>;
export type UpsertSpaceInviteLinksMutationResult = Apollo.MutationResult<UpsertSpaceInviteLinksMutation>;
export type UpsertSpaceInviteLinksMutationOptions = Apollo.BaseMutationOptions<UpsertSpaceInviteLinksMutation, UpsertSpaceInviteLinksMutationVariables>;
export const UpsertProjectGalaxyAccessTokenDocument = gql`
    mutation UpsertProjectGalaxyAccessToken($spaceId: String!, $accessToken: String!) {
  payload: upsertProjectGalaxyAccessToken(
    spaceId: $spaceId
    accessToken: $accessToken
  ) {
    id
  }
}
    `;
export type UpsertProjectGalaxyAccessTokenMutationFn = Apollo.MutationFunction<UpsertProjectGalaxyAccessTokenMutation, UpsertProjectGalaxyAccessTokenMutationVariables>;

/**
 * __useUpsertProjectGalaxyAccessTokenMutation__
 *
 * To run a mutation, you first call `useUpsertProjectGalaxyAccessTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertProjectGalaxyAccessTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertProjectGalaxyAccessTokenMutation, { data, loading, error }] = useUpsertProjectGalaxyAccessTokenMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      accessToken: // value for 'accessToken'
 *   },
 * });
 */
export function useUpsertProjectGalaxyAccessTokenMutation(baseOptions?: Apollo.MutationHookOptions<UpsertProjectGalaxyAccessTokenMutation, UpsertProjectGalaxyAccessTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertProjectGalaxyAccessTokenMutation, UpsertProjectGalaxyAccessTokenMutationVariables>(UpsertProjectGalaxyAccessTokenDocument, options);
      }
export type UpsertProjectGalaxyAccessTokenMutationHookResult = ReturnType<typeof useUpsertProjectGalaxyAccessTokenMutation>;
export type UpsertProjectGalaxyAccessTokenMutationResult = Apollo.MutationResult<UpsertProjectGalaxyAccessTokenMutation>;
export type UpsertProjectGalaxyAccessTokenMutationOptions = Apollo.BaseMutationOptions<UpsertProjectGalaxyAccessTokenMutation, UpsertProjectGalaxyAccessTokenMutationVariables>;
export const CreateSignedUrlDocument = gql`
    mutation CreateSignedUrl($spaceId: String!, $input: CreateSignedUrlInput!) {
  payload: createSignedUrl(spaceId: $spaceId, input: $input)
}
    `;
export type CreateSignedUrlMutationFn = Apollo.MutationFunction<CreateSignedUrlMutation, CreateSignedUrlMutationVariables>;

/**
 * __useCreateSignedUrlMutation__
 *
 * To run a mutation, you first call `useCreateSignedUrlMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSignedUrlMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSignedUrlMutation, { data, loading, error }] = useCreateSignedUrlMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSignedUrlMutation(baseOptions?: Apollo.MutationHookOptions<CreateSignedUrlMutation, CreateSignedUrlMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSignedUrlMutation, CreateSignedUrlMutationVariables>(CreateSignedUrlDocument, options);
      }
export type CreateSignedUrlMutationHookResult = ReturnType<typeof useCreateSignedUrlMutation>;
export type CreateSignedUrlMutationResult = Apollo.MutationResult<CreateSignedUrlMutation>;
export type CreateSignedUrlMutationOptions = Apollo.BaseMutationOptions<CreateSignedUrlMutation, CreateSignedUrlMutationVariables>;
export const AddDiscordCredentialsDocument = gql`
    mutation AddDiscordCredentials($spaceId: String!, $code: String!, $redirectUri: String!) {
  payload: addDiscordCredentials(
    spaceId: $spaceId
    code: $code
    redirectUri: $redirectUri
  ) {
    id
  }
}
    `;
export type AddDiscordCredentialsMutationFn = Apollo.MutationFunction<AddDiscordCredentialsMutation, AddDiscordCredentialsMutationVariables>;

/**
 * __useAddDiscordCredentialsMutation__
 *
 * To run a mutation, you first call `useAddDiscordCredentialsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddDiscordCredentialsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addDiscordCredentialsMutation, { data, loading, error }] = useAddDiscordCredentialsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      code: // value for 'code'
 *      redirectUri: // value for 'redirectUri'
 *   },
 * });
 */
export function useAddDiscordCredentialsMutation(baseOptions?: Apollo.MutationHookOptions<AddDiscordCredentialsMutation, AddDiscordCredentialsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddDiscordCredentialsMutation, AddDiscordCredentialsMutationVariables>(AddDiscordCredentialsDocument, options);
      }
export type AddDiscordCredentialsMutationHookResult = ReturnType<typeof useAddDiscordCredentialsMutation>;
export type AddDiscordCredentialsMutationResult = Apollo.MutationResult<AddDiscordCredentialsMutation>;
export type AddDiscordCredentialsMutationOptions = Apollo.BaseMutationOptions<AddDiscordCredentialsMutation, AddDiscordCredentialsMutationVariables>;
export const UpsertSpaceGitGuideRepositoriesDocument = gql`
    mutation UpsertSpaceGitGuideRepositories($spaceId: String!, $gitGuideRepositories: [SpaceGitRepositoryInput!]!) {
  payload: upsertSpaceGitGuideRepositories(
    spaceId: $spaceId
    gitGuideRepositories: $gitGuideRepositories
  ) {
    id
  }
}
    `;
export type UpsertSpaceGitGuideRepositoriesMutationFn = Apollo.MutationFunction<UpsertSpaceGitGuideRepositoriesMutation, UpsertSpaceGitGuideRepositoriesMutationVariables>;

/**
 * __useUpsertSpaceGitGuideRepositoriesMutation__
 *
 * To run a mutation, you first call `useUpsertSpaceGitGuideRepositoriesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSpaceGitGuideRepositoriesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSpaceGitGuideRepositoriesMutation, { data, loading, error }] = useUpsertSpaceGitGuideRepositoriesMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      gitGuideRepositories: // value for 'gitGuideRepositories'
 *   },
 * });
 */
export function useUpsertSpaceGitGuideRepositoriesMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSpaceGitGuideRepositoriesMutation, UpsertSpaceGitGuideRepositoriesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSpaceGitGuideRepositoriesMutation, UpsertSpaceGitGuideRepositoriesMutationVariables>(UpsertSpaceGitGuideRepositoriesDocument, options);
      }
export type UpsertSpaceGitGuideRepositoriesMutationHookResult = ReturnType<typeof useUpsertSpaceGitGuideRepositoriesMutation>;
export type UpsertSpaceGitGuideRepositoriesMutationResult = Apollo.MutationResult<UpsertSpaceGitGuideRepositoriesMutation>;
export type UpsertSpaceGitGuideRepositoriesMutationOptions = Apollo.BaseMutationOptions<UpsertSpaceGitGuideRepositoriesMutation, UpsertSpaceGitGuideRepositoriesMutationVariables>;
export const UpsertSpaceAcademyRepositoryDocument = gql`
    mutation UpsertSpaceAcademyRepository($spaceId: String!, $academyRepository: String!) {
  upsertSpaceAcademyRepository(
    spaceId: $spaceId
    academyRepository: $academyRepository
  ) {
    id
  }
}
    `;
export type UpsertSpaceAcademyRepositoryMutationFn = Apollo.MutationFunction<UpsertSpaceAcademyRepositoryMutation, UpsertSpaceAcademyRepositoryMutationVariables>;

/**
 * __useUpsertSpaceAcademyRepositoryMutation__
 *
 * To run a mutation, you first call `useUpsertSpaceAcademyRepositoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSpaceAcademyRepositoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSpaceAcademyRepositoryMutation, { data, loading, error }] = useUpsertSpaceAcademyRepositoryMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      academyRepository: // value for 'academyRepository'
 *   },
 * });
 */
export function useUpsertSpaceAcademyRepositoryMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSpaceAcademyRepositoryMutation, UpsertSpaceAcademyRepositoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSpaceAcademyRepositoryMutation, UpsertSpaceAcademyRepositoryMutationVariables>(UpsertSpaceAcademyRepositoryDocument, options);
      }
export type UpsertSpaceAcademyRepositoryMutationHookResult = ReturnType<typeof useUpsertSpaceAcademyRepositoryMutation>;
export type UpsertSpaceAcademyRepositoryMutationResult = Apollo.MutationResult<UpsertSpaceAcademyRepositoryMutation>;
export type UpsertSpaceAcademyRepositoryMutationOptions = Apollo.BaseMutationOptions<UpsertSpaceAcademyRepositoryMutation, UpsertSpaceAcademyRepositoryMutationVariables>;
export const UpdateSpaceDocument = gql`
    mutation UpdateSpace($spaceInput: UpsertSpaceInput!) {
  updateSpace(spaceInput: $spaceInput) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type UpdateSpaceMutationFn = Apollo.MutationFunction<UpdateSpaceMutation, UpdateSpaceMutationVariables>;

/**
 * __useUpdateSpaceMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceMutation, { data, loading, error }] = useUpdateSpaceMutation({
 *   variables: {
 *      spaceInput: // value for 'spaceInput'
 *   },
 * });
 */
export function useUpdateSpaceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSpaceMutation, UpdateSpaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSpaceMutation, UpdateSpaceMutationVariables>(UpdateSpaceDocument, options);
      }
export type UpdateSpaceMutationHookResult = ReturnType<typeof useUpdateSpaceMutation>;
export type UpdateSpaceMutationResult = Apollo.MutationResult<UpdateSpaceMutation>;
export type UpdateSpaceMutationOptions = Apollo.BaseMutationOptions<UpdateSpaceMutation, UpdateSpaceMutationVariables>;
export const CreateSpaceDocument = gql`
    mutation CreateSpace($spaceInput: UpsertSpaceInput!) {
  createSpace(spaceInput: $spaceInput) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type CreateSpaceMutationFn = Apollo.MutationFunction<CreateSpaceMutation, CreateSpaceMutationVariables>;

/**
 * __useCreateSpaceMutation__
 *
 * To run a mutation, you first call `useCreateSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSpaceMutation, { data, loading, error }] = useCreateSpaceMutation({
 *   variables: {
 *      spaceInput: // value for 'spaceInput'
 *   },
 * });
 */
export function useCreateSpaceMutation(baseOptions?: Apollo.MutationHookOptions<CreateSpaceMutation, CreateSpaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSpaceMutation, CreateSpaceMutationVariables>(CreateSpaceDocument, options);
      }
export type CreateSpaceMutationHookResult = ReturnType<typeof useCreateSpaceMutation>;
export type CreateSpaceMutationResult = Apollo.MutationResult<CreateSpaceMutation>;
export type CreateSpaceMutationOptions = Apollo.BaseMutationOptions<CreateSpaceMutation, CreateSpaceMutationVariables>;
export const SpacesDocument = gql`
    query Spaces {
  spaces {
    ...SpaceSummary
  }
}
    ${SpaceSummaryFragmentDoc}`;

/**
 * __useSpacesQuery__
 *
 * To run a query within a React component, call `useSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useSpacesQuery(baseOptions?: Apollo.QueryHookOptions<SpacesQuery, SpacesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SpacesQuery, SpacesQueryVariables>(SpacesDocument, options);
      }
export function useSpacesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SpacesQuery, SpacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SpacesQuery, SpacesQueryVariables>(SpacesDocument, options);
        }
export type SpacesQueryHookResult = ReturnType<typeof useSpacesQuery>;
export type SpacesLazyQueryHookResult = ReturnType<typeof useSpacesLazyQuery>;
export type SpacesQueryResult = Apollo.QueryResult<SpacesQuery, SpacesQueryVariables>;
export function refetchSpacesQuery(variables?: SpacesQueryVariables) {
      return { query: SpacesDocument, variables: variables }
    }
export const TimelinesDocument = gql`
    query Timelines($spaceId: String!) {
  timelines(spaceId: $spaceId) {
    id
    name
    excerpt
    content
    thumbnail
    created
    publishStatus
    admins
    tags
    priority
  }
}
    `;

/**
 * __useTimelinesQuery__
 *
 * To run a query within a React component, call `useTimelinesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTimelinesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTimelinesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useTimelinesQuery(baseOptions: Apollo.QueryHookOptions<TimelinesQuery, TimelinesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TimelinesQuery, TimelinesQueryVariables>(TimelinesDocument, options);
      }
export function useTimelinesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TimelinesQuery, TimelinesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TimelinesQuery, TimelinesQueryVariables>(TimelinesDocument, options);
        }
export type TimelinesQueryHookResult = ReturnType<typeof useTimelinesQuery>;
export type TimelinesLazyQueryHookResult = ReturnType<typeof useTimelinesLazyQuery>;
export type TimelinesQueryResult = Apollo.QueryResult<TimelinesQuery, TimelinesQueryVariables>;
export function refetchTimelinesQuery(variables: TimelinesQueryVariables) {
      return { query: TimelinesDocument, variables: variables }
    }
export const TimelineDetailsDocument = gql`
    query TimelineDetails($spaceId: String!, $timelineId: String!) {
  timeline(spaceId: $spaceId, timelineId: $timelineId) {
    ...TimelineDetails
  }
}
    ${TimelineDetailsFragmentDoc}`;

/**
 * __useTimelineDetailsQuery__
 *
 * To run a query within a React component, call `useTimelineDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTimelineDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTimelineDetailsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      timelineId: // value for 'timelineId'
 *   },
 * });
 */
export function useTimelineDetailsQuery(baseOptions: Apollo.QueryHookOptions<TimelineDetailsQuery, TimelineDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TimelineDetailsQuery, TimelineDetailsQueryVariables>(TimelineDetailsDocument, options);
      }
export function useTimelineDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TimelineDetailsQuery, TimelineDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TimelineDetailsQuery, TimelineDetailsQueryVariables>(TimelineDetailsDocument, options);
        }
export type TimelineDetailsQueryHookResult = ReturnType<typeof useTimelineDetailsQuery>;
export type TimelineDetailsLazyQueryHookResult = ReturnType<typeof useTimelineDetailsLazyQuery>;
export type TimelineDetailsQueryResult = Apollo.QueryResult<TimelineDetailsQuery, TimelineDetailsQueryVariables>;
export function refetchTimelineDetailsQuery(variables: TimelineDetailsQueryVariables) {
      return { query: TimelineDetailsDocument, variables: variables }
    }
export const UpsertTimelineDocument = gql`
    mutation UpsertTimeline($spaceId: String!, $input: UpsertTimelineInput!) {
  upsertTimeline(spaceId: $spaceId, input: $input) {
    ...TimelineDetails
  }
}
    ${TimelineDetailsFragmentDoc}`;
export type UpsertTimelineMutationFn = Apollo.MutationFunction<UpsertTimelineMutation, UpsertTimelineMutationVariables>;

/**
 * __useUpsertTimelineMutation__
 *
 * To run a mutation, you first call `useUpsertTimelineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertTimelineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertTimelineMutation, { data, loading, error }] = useUpsertTimelineMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertTimelineMutation(baseOptions?: Apollo.MutationHookOptions<UpsertTimelineMutation, UpsertTimelineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertTimelineMutation, UpsertTimelineMutationVariables>(UpsertTimelineDocument, options);
      }
export type UpsertTimelineMutationHookResult = ReturnType<typeof useUpsertTimelineMutation>;
export type UpsertTimelineMutationResult = Apollo.MutationResult<UpsertTimelineMutation>;
export type UpsertTimelineMutationOptions = Apollo.BaseMutationOptions<UpsertTimelineMutation, UpsertTimelineMutationVariables>;