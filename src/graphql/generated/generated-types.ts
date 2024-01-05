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
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: any;
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

export interface AddTopicQuestionsInput {
  courseKey: Scalars['String'];
  questions: Array<AddTopicQuestionInput>;
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

export interface AnnotateDiscoursePostInput {
  discussed?: InputMaybe<Scalars['Boolean']>;
  enacted?: InputMaybe<Scalars['Boolean']>;
  postId: Scalars['String'];
  spaceId: Scalars['String'];
}

export interface ArticleIndexingInfo {
  __typename?: 'ArticleIndexingInfo';
  articleUrl: Scalars['String'];
  createdAt: Scalars['DateTimeISO'];
  id: Scalars['String'];
  spaceId: Scalars['String'];
  status: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  textLength?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['DateTimeISO'];
}

export interface AuthSettings {
  __typename?: 'AuthSettings';
  enableLogin?: Maybe<Scalars['Boolean']>;
  loginOptions?: Maybe<Array<Scalars['String']>>;
}

export interface AuthSettingsInput {
  enableLogin: Scalars['Boolean'];
  loginOptions: Array<Scalars['String']>;
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
  showIncorrectOnCompletion: Scalars['Boolean'];
  steps: Array<ByteStep>;
  tags: Array<Scalars['String']>;
}

export interface ByteCollection {
  __typename?: 'ByteCollection';
  byteIds: Array<Scalars['String']>;
  bytes: Array<ByteCollectionByte>;
  description: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  order: Scalars['Int'];
  status: Scalars['String'];
}

export interface ByteCollectionByte {
  __typename?: 'ByteCollectionByte';
  byteId: Scalars['String'];
  content: Scalars['String'];
  name: Scalars['String'];
}

export interface ByteLinkedinPdfContent {
  __typename?: 'ByteLinkedinPdfContent';
  excerpt: Scalars['String'];
  steps: Array<ByteLinkedinPdfContentStep>;
  title: Scalars['String'];
}

export interface ByteLinkedinPdfContentInput {
  excerpt: Scalars['String'];
  steps: Array<ByteLinkedinPdfContentStepInput>;
  title: Scalars['String'];
}

export interface ByteLinkedinPdfContentStep {
  __typename?: 'ByteLinkedinPdfContentStep';
  content: Scalars['String'];
  name: Scalars['String'];
}

export interface ByteLinkedinPdfContentStepInput {
  content: Scalars['String'];
  name: Scalars['String'];
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

export interface ByteSettings {
  __typename?: 'ByteSettings';
  askForLoginToSubmit?: Maybe<Scalars['Boolean']>;
  /** @deprecated Use captureRating instead */
  captureBeforeAndAfterRating?: Maybe<Scalars['Boolean']>;
  captureRating?: Maybe<Scalars['Boolean']>;
  showCategoriesInSidebar?: Maybe<Scalars['Boolean']>;
}

export interface ByteSettingsInput {
  askForLoginToSubmit?: InputMaybe<Scalars['Boolean']>;
  captureRating?: InputMaybe<Scalars['Boolean']>;
  showCategoriesInSidebar?: InputMaybe<Scalars['Boolean']>;
}

export interface ByteSocialShare {
  __typename?: 'ByteSocialShare';
  byteId: Scalars['String'];
  linkedInImages?: Maybe<Array<Scalars['String']>>;
  linkedInPdf?: Maybe<Scalars['String']>;
  linkedinPdfContent?: Maybe<ByteLinkedinPdfContent>;
  spaceId: Scalars['String'];
  twitterImage?: Maybe<Scalars['String']>;
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
  n?: InputMaybe<Scalars['Int']>;
  temperature?: InputMaybe<Scalars['Float']>;
}

export enum ChatCompletionRequestMessageRoleEnum {
  Assistant = 'assistant',
  System = 'system',
  User = 'user'
}

export interface ChatbotCategory {
  __typename?: 'ChatbotCategory';
  description: Scalars['String'];
  id: Scalars['String'];
  key: Scalars['String'];
  name: Scalars['String'];
  priority: Scalars['Int'];
  subCategories: Array<ChatbotSubcategory>;
}

export interface ChatbotFaq extends ChatbotFaqCommon {
  __typename?: 'ChatbotFAQ';
  answer: Scalars['String'];
  id: Scalars['String'];
  priority: Scalars['Int'];
  question: Scalars['String'];
  spaceId: Scalars['String'];
  url: Scalars['String'];
}

export interface ChatbotFaqCommon {
  answer: Scalars['String'];
  id: Scalars['String'];
  priority: Scalars['Int'];
  question: Scalars['String'];
  spaceId: Scalars['String'];
  url: Scalars['String'];
}

export interface ChatbotSubcategory {
  __typename?: 'ChatbotSubcategory';
  description: Scalars['String'];
  key: Scalars['String'];
  name: Scalars['String'];
}

export interface ChatbotUserQuestion {
  __typename?: 'ChatbotUserQuestion';
  id: Scalars['String'];
  question: Scalars['String'];
  spaceId: Scalars['String'];
}

export interface CompletionAiInput {
  model?: InputMaybe<Scalars['String']>;
  n?: InputMaybe<Scalars['Int']>;
  prompt: Scalars['String'];
  temperature?: InputMaybe<Scalars['Float']>;
}

export interface ConsolidatedGuideRating {
  __typename?: 'ConsolidatedGuideRating';
  avgRating: Scalars['Float'];
  endRatingFeedbackCount: Scalars['Int'];
  negativeFeedbackCount: Scalars['Int'];
  negativeRatingDistribution: RatingDistribution;
  positiveFeedbackCount: Scalars['Int'];
  positiveRatingDistribution: RatingDistribution;
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

export interface CreateByteCollectionInput {
  byteIds: Array<Scalars['String']>;
  description: Scalars['String'];
  name: Scalars['String'];
  order: Scalars['Int'];
  spaceId: Scalars['String'];
  status: Scalars['String'];
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

export interface DateTimeFilter {
  after?: InputMaybe<Scalars['DateTimeISO']>;
  before?: InputMaybe<Scalars['DateTimeISO']>;
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

export interface DiscordChannel {
  __typename?: 'DiscordChannel';
  createdAt: Scalars['DateTimeISO'];
  discordChannelId: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  serverId: Scalars['String'];
  shouldIndex: Scalars['Boolean'];
  status: Scalars['String'];
  type: Scalars['String'];
  updatedAt: Scalars['DateTimeISO'];
}

export interface DiscordMessage {
  __typename?: 'DiscordMessage';
  authorUsername: Scalars['String'];
  channelId: Scalars['String'];
  content: Scalars['String'];
  createdAt: Scalars['DateTimeISO'];
  discordMessageId: Scalars['String'];
  id: Scalars['String'];
  messageDate: Scalars['DateTimeISO'];
  serverId: Scalars['String'];
  updatedAt: Scalars['DateTimeISO'];
}

export interface DiscordServer {
  __typename?: 'DiscordServer';
  createdAt: Scalars['DateTimeISO'];
  discordServerId: Scalars['String'];
  iconUrl?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  updatedAt: Scalars['DateTimeISO'];
}

export interface DiscourseIndexRun {
  __typename?: 'DiscourseIndexRun';
  createdAt: Scalars['DateTimeISO'];
  id: Scalars['String'];
  runDate?: Maybe<Scalars['DateTimeISO']>;
  spaceId: Scalars['String'];
  status: Scalars['String'];
}

export interface DiscoursePost {
  __typename?: 'DiscoursePost';
  aiSummary?: Maybe<Scalars['String']>;
  aiSummaryDate?: Maybe<Scalars['DateTimeISO']>;
  author?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTimeISO'];
  datePublished: Scalars['DateTimeISO'];
  discussed?: Maybe<Scalars['Boolean']>;
  enacted?: Maybe<Scalars['Boolean']>;
  fullContent?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  indexedAt?: Maybe<Scalars['DateTimeISO']>;
  spaceId: Scalars['String'];
  status: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
}

export interface DiscoursePostComment {
  __typename?: 'DiscoursePostComment';
  author: Scalars['String'];
  commentPostId: Scalars['String'];
  content: Scalars['String'];
  createdAt: Scalars['DateTimeISO'];
  datePublished: Scalars['DateTimeISO'];
  id: Scalars['String'];
  indexedAt: Scalars['DateTimeISO'];
  postId: Scalars['String'];
  spaceId: Scalars['String'];
}

export interface DownloadAndCleanContentResponse {
  __typename?: 'DownloadAndCleanContentResponse';
  content: Scalars['String'];
  links: Array<DownloadLinkInfo>;
}

export interface DownloadLinkInfo {
  __typename?: 'DownloadLinkInfo';
  downloadStatus: Scalars['String'];
  link: Scalars['String'];
  tokenCount: Scalars['Int'];
}

export interface ExtractRelevantTextForTopicInput {
  content: Scalars['String'];
  topic: Scalars['String'];
}

export interface GenerateImageEditInput {
  editImageUrl: Scalars['String'];
  prompt: Scalars['String'];
}

export interface GenerateImageInput {
  prompt: Scalars['String'];
}

export interface GenerateImageResponse {
  __typename?: 'GenerateImageResponse';
  url: Scalars['String'];
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
  courseRepoUrl: Scalars['String'];
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
  questions?: Maybe<Array<GitCourseQuestionsSubmission>>;
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
  createdAt: Scalars['String'];
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
  updatedAt: Scalars['DateTimeISO'];
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
  createdAt: Scalars['DateTimeISO'];
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
  updatedAt: Scalars['DateTimeISO'];
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
  createdAt: Scalars['DateTimeISO'];
  guideIntegrations: GuideIntegrations;
  guideSource: Scalars['String'];
  guideType: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  postSubmissionStepContent?: Maybe<Scalars['String']>;
  previousId?: Maybe<Scalars['String']>;
  priority?: Maybe<Scalars['Int']>;
  publishStatus: Scalars['String'];
  steps: Array<GuideStep>;
  thumbnail?: Maybe<Scalars['String']>;
  uuid: Scalars['String'];
  version: Scalars['Int'];
}

export interface GuideFeedback {
  __typename?: 'GuideFeedback';
  content?: Maybe<Scalars['Boolean']>;
  questions?: Maybe<Scalars['Boolean']>;
  ux?: Maybe<Scalars['Boolean']>;
}

export interface GuideFeedbackInput {
  content?: InputMaybe<Scalars['Boolean']>;
  questions?: InputMaybe<Scalars['Boolean']>;
  ux?: InputMaybe<Scalars['Boolean']>;
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
  priority?: InputMaybe<Scalars['Int']>;
  publishStatus: Scalars['String'];
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
  explanation?: Maybe<Scalars['String']>;
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

export interface GuideRating {
  __typename?: 'GuideRating';
  createdAt: Scalars['DateTimeISO'];
  endRating?: Maybe<Scalars['Int']>;
  guideUuid: Scalars['String'];
  ipAddress?: Maybe<Scalars['String']>;
  negativeFeedback?: Maybe<GuideFeedback>;
  positiveFeedback?: Maybe<GuideFeedback>;
  ratingUuid: Scalars['String'];
  skipEndRating?: Maybe<Scalars['Boolean']>;
  skipStartRating?: Maybe<Scalars['Boolean']>;
  spaceId: Scalars['String'];
  startRating?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['DateTimeISO'];
  userId?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
}

export interface GuideSettings {
  __typename?: 'GuideSettings';
  askForLoginToSubmit?: Maybe<Scalars['Boolean']>;
  /** @deprecated Use captureRating instead */
  captureBeforeAndAfterRating?: Maybe<Scalars['Boolean']>;
  captureRating?: Maybe<Scalars['Boolean']>;
  showCategoriesInSidebar?: Maybe<Scalars['Boolean']>;
  showIncorrectAfterEachStep?: Maybe<Scalars['Boolean']>;
  showIncorrectOnCompletion?: Maybe<Scalars['Boolean']>;
}

export interface GuideSettingsInput {
  askForLoginToSubmit?: InputMaybe<Scalars['Boolean']>;
  captureRating?: InputMaybe<Scalars['Boolean']>;
  showCategoriesInSidebar?: InputMaybe<Scalars['Boolean']>;
  showIncorrectAfterEachStep?: InputMaybe<Scalars['Boolean']>;
  showIncorrectOnCompletion?: InputMaybe<Scalars['Boolean']>;
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
  correctQuestionsCount: Scalars['Int'];
  createdAt: Scalars['DateTimeISO'];
  createdBy: Scalars['String'];
  createdByUsername: Scalars['String'];
  galaxyCredentialsUpdated?: Maybe<Scalars['Boolean']>;
  guideId: Scalars['String'];
  guideUuid: Scalars['String'];
  id: Scalars['String'];
  result: GuideSubmissionResult;
  spaceId: Scalars['String'];
  steps?: Maybe<Array<GuideStepSubmission>>;
  uuid: Scalars['String'];
}

export interface GuideSubmissionFiltersInput {
  correctQuestionsCount?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<DateTimeFilter>;
  createdByUsername?: InputMaybe<Scalars['String']>;
  itemsPerPage: Scalars['Int'];
  page: Scalars['Int'];
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

export interface ImagesResponse {
  __typename?: 'ImagesResponse';
  created: Scalars['Int'];
  data: Array<ImagesResponseDataInner>;
}

export interface ImagesResponseDataInner {
  __typename?: 'ImagesResponseDataInner';
  b64_json?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
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
  _empty?: Maybe<Scalars['String']>;
  addDiscordCredentials: Space;
  addTopic: GitCourseTopic;
  addTopicExplanation: GitCourseExplanation;
  addTopicQuestion: GitCourseQuestion;
  addTopicQuestions: Array<GitCourseQuestion>;
  addTopicSummary: GitCourseSummary;
  addTopicVideo: GitCourseReading;
  annotateDiscoursePost: DiscoursePost;
  askChatCompletionAI: OpenAiChatCompletionResponse;
  askCompletionAI: OpenAiCompletionResponse;
  authenticateWithUnstoppable: JwtResponse;
  copyAllBytesFromGitToDatabase: Scalars['Boolean'];
  createArticleIndexingInfo: ArticleIndexingInfo;
  createByteCollection: ByteCollection;
  createSignedUrl: Scalars['String'];
  createSpace: Space;
  createSummaryOfContent: OpenAiTextResponse;
  createWebsiteScrapingInfo: WebsiteScrapingInfo;
  deleteAndPullCourseRepo: GitCourse;
  deleteByteCollection: Scalars['Boolean'];
  deleteChatbotCategory: Scalars['Boolean'];
  deleteChatbotFAQ: Scalars['Boolean'];
  deleteChatbotUserQuestion: Scalars['Boolean'];
  deleteGitCourseSubmission: Scalars['Boolean'];
  deleteGuide: Scalars['Boolean'];
  deleteTopic: GitCourse;
  deleteTopicExplanation: GitCourse;
  deleteTopicQuestion: GitCourse;
  deleteTopicSummary: GitCourse;
  deleteTopicVideo: GitCourse;
  downloadAndCleanContent: DownloadAndCleanContentResponse;
  dropPineconeNamespace: Scalars['Boolean'];
  editArticleIndexingInfo: ArticleIndexingInfo;
  editWebsiteScrapingInfo: WebsiteScrapingInfo;
  extractRelevantTextForTopic: OpenAiTextResponse;
  generateImage: ImagesResponse;
  generateImageEdit: GenerateImageResponse;
  generateSharablePdf: Scalars['String'];
  indexChatbotFAQs: Scalars['Boolean'];
  indexDiscoursePost: Scalars['Boolean'];
  indexNeedsIndexingDiscoursePosts: DiscourseIndexRun;
  initializeGitCourseSubmission: GitCourseSubmission;
  moveTopic: GitCourse;
  moveTopicExplanation: GitCourse;
  moveTopicQuestion: GitCourse;
  moveTopicSummary: GitCourse;
  moveTopicVideo: GitCourse;
  reFetchDiscordChannels: Array<DiscordChannel>;
  reFetchDiscordMessages: Scalars['Boolean'];
  reFetchDiscordServers: Array<DiscordServer>;
  refreshGitCourse: Scalars['Boolean'];
  refreshGitCourses: Scalars['Boolean'];
  reloadAcademyRepository: Scalars['Boolean'];
  sendEmail: Scalars['Boolean'];
  submitByte: ByteSubmission;
  submitGitCourse: GitCourseSubmission;
  submitGitCourseTopic: GitCourseSubmission;
  submitGuide: GuideSubmission;
  triggerNewDiscourseIndexRun: DiscourseIndexRun;
  triggerSiteScrapingRun: SiteScrapingRun;
  updateAuthSettings: Space;
  updateByteCollection: ByteCollection;
  updateByteSettings: Space;
  updateCourseBasicInfo: GitCourse;
  updateGuideSettings: Space;
  updateIndexWithAllDiscordPosts: Scalars['Boolean'];
  updateIndexingOfDiscordChannel: DiscordChannel;
  updateSocialSettings: Space;
  updateSpace: Space;
  updateThemeColors: Space;
  updateTopicBasicInfo: GitCourse;
  updateTopicExplanation: GitCourse;
  updateTopicQuestion: GitCourse;
  updateTopicSummary: GitCourse;
  updateTopicVideo: GitCourse;
  upsertAcademyTask: AcademyTask;
  upsertByte: Byte;
  upsertByteSocialShare: ByteSocialShare;
  upsertChatbotCategory: ChatbotCategory;
  upsertChatbotFAQ: ChatbotFaq;
  upsertChatbotUserQuestion: ChatbotUserQuestion;
  upsertCourseIntegrations: CourseIntegrations;
  upsertGitCourse?: Maybe<SummarizedGitCourse>;
  upsertGitCourseTopicSubmission: GitCourseSubmission;
  upsertGnosisSafeWallets: Space;
  upsertGuide: Guide;
  upsertGuideRating: GuideRating;
  upsertProject: Project;
  upsertProjectByte: ProjectByte;
  upsertProjectByteCollection: ProjectByteCollection;
  upsertProjectGalaxyAccessToken: Space;
  upsertProjectShortVideo: ProjectShortVideo;
  upsertShortVideo: ShortVideo;
  upsertSimulation: Simulation;
  upsertSpaceAcademyRepository: Space;
  upsertSpaceFeatures: Space;
  upsertSpaceInviteLinks: Space;
  upsertSpaceLoaderInfo: Space;
  upsertSummaryOfDiscoursePost: DiscoursePost;
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


export interface MutationAddTopicQuestionsArgs {
  input: AddTopicQuestionsInput;
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


export interface MutationAnnotateDiscoursePostArgs {
  input: AnnotateDiscoursePostInput;
  spaceId: Scalars['String'];
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


export interface MutationCreateArticleIndexingInfoArgs {
  articleUrl: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationCreateByteCollectionArgs {
  input: CreateByteCollectionInput;
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


export interface MutationCreateWebsiteScrapingInfoArgs {
  baseUrl: Scalars['String'];
  ignoreHashInUrl: Scalars['Boolean'];
  ignoreQueryParams: Scalars['Boolean'];
  scrapingStartUrl: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationDeleteAndPullCourseRepoArgs {
  courseKey: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationDeleteByteCollectionArgs {
  byteCollectionId: Scalars['String'];
}


export interface MutationDeleteChatbotCategoryArgs {
  id: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationDeleteChatbotFaqArgs {
  id: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationDeleteChatbotUserQuestionArgs {
  id: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationDeleteGitCourseSubmissionArgs {
  courseKey: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationDeleteGuideArgs {
  spaceId: Scalars['String'];
  uuid: Scalars['String'];
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


export interface MutationDropPineconeNamespaceArgs {
  spaceId: Scalars['String'];
}


export interface MutationEditArticleIndexingInfoArgs {
  articleIndexingInfoId: Scalars['String'];
  articleUrl: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationEditWebsiteScrapingInfoArgs {
  baseUrl: Scalars['String'];
  ignoreHashInUrl: Scalars['Boolean'];
  ignoreQueryParams: Scalars['Boolean'];
  scrapingStartUrl: Scalars['String'];
  spaceId: Scalars['String'];
  websiteScrapingInfoId: Scalars['String'];
}


export interface MutationExtractRelevantTextForTopicArgs {
  input: ExtractRelevantTextForTopicInput;
}


export interface MutationGenerateImageArgs {
  input: GenerateImageInput;
}


export interface MutationGenerateImageEditArgs {
  input: GenerateImageEditInput;
}


export interface MutationGenerateSharablePdfArgs {
  byteId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationIndexChatbotFaQsArgs {
  spaceId: Scalars['String'];
}


export interface MutationIndexDiscoursePostArgs {
  postId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationIndexNeedsIndexingDiscoursePostsArgs {
  spaceId: Scalars['String'];
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


export interface MutationReFetchDiscordChannelsArgs {
  serverId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationReFetchDiscordMessagesArgs {
  channelId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationRefreshGitCourseArgs {
  courseKey: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationRefreshGitCoursesArgs {
  spaceId: Scalars['String'];
}


export interface MutationReloadAcademyRepositoryArgs {
  spaceId: Scalars['String'];
}


export interface MutationSendEmailArgs {
  input: SendEmailInput;
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


export interface MutationTriggerNewDiscourseIndexRunArgs {
  spaceId: Scalars['String'];
}


export interface MutationTriggerSiteScrapingRunArgs {
  spaceId: Scalars['String'];
  websiteScrapingInfoId: Scalars['String'];
}


export interface MutationUpdateAuthSettingsArgs {
  input: AuthSettingsInput;
  spaceId: Scalars['String'];
}


export interface MutationUpdateByteCollectionArgs {
  input: UpdateByteCollectionInput;
}


export interface MutationUpdateByteSettingsArgs {
  input: ByteSettingsInput;
  spaceId: Scalars['String'];
}


export interface MutationUpdateCourseBasicInfoArgs {
  courseBasicInfo: CourseBasicInfoInput;
  spaceId: Scalars['String'];
}


export interface MutationUpdateGuideSettingsArgs {
  input: GuideSettingsInput;
  spaceId: Scalars['String'];
}


export interface MutationUpdateIndexWithAllDiscordPostsArgs {
  spaceId: Scalars['String'];
}


export interface MutationUpdateIndexingOfDiscordChannelArgs {
  channelId: Scalars['String'];
  shouldIndex: Scalars['Boolean'];
  spaceId: Scalars['String'];
}


export interface MutationUpdateSocialSettingsArgs {
  input: SocialSettingsInput;
  spaceId: Scalars['String'];
}


export interface MutationUpdateSpaceArgs {
  spaceInput: UpsertSpaceInput;
}


export interface MutationUpdateThemeColorsArgs {
  spaceId: Scalars['ID'];
  themeColors: ThemeColorsInput;
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


export interface MutationUpsertByteSocialShareArgs {
  input: UpsertByteSocialShareInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertChatbotCategoryArgs {
  input: UpsertChatbotCategoryInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertChatbotFaqArgs {
  input: UpsertChatbotFaqInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertChatbotUserQuestionArgs {
  input: UpsertChatbotUserQuestionInput;
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


export interface MutationUpsertGuideRatingArgs {
  spaceId: Scalars['String'];
  upsertGuideRatingInput: UpsertGuideRatingInput;
}


export interface MutationUpsertProjectArgs {
  input: UpsertProjectInput;
}


export interface MutationUpsertProjectByteArgs {
  input: UpsertProjectByteInput;
  projectId: Scalars['String'];
}


export interface MutationUpsertProjectByteCollectionArgs {
  input: UpsertProjectByteCollectionInput;
  projectId: Scalars['String'];
}


export interface MutationUpsertProjectGalaxyAccessTokenArgs {
  accessToken: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface MutationUpsertProjectShortVideoArgs {
  projectId: Scalars['String'];
  shortVideo: ProjectShortVideoInput;
}


export interface MutationUpsertShortVideoArgs {
  shortVideo: ShortVideoInput;
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


export interface MutationUpsertSpaceInviteLinksArgs {
  spaceId: Scalars['String'];
  spaceInviteArgs: SpaceInviteArgs;
}


export interface MutationUpsertSpaceLoaderInfoArgs {
  input: SpaceLoadersInfoInput;
  spaceId: Scalars['String'];
}


export interface MutationUpsertSummaryOfDiscoursePostArgs {
  input: UpsertSummaryOfDiscoursePostInput;
  spaceId: Scalars['String'];
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

export interface Project {
  __typename?: 'Project';
  adminUsernames: Array<Scalars['String']>;
  adminUsernamesV1: Array<UsernameAndName>;
  admins: Array<Scalars['String']>;
  archive?: Maybe<Scalars['Boolean']>;
  cardThumbnail?: Maybe<Scalars['String']>;
  creator: Scalars['String'];
  details: Scalars['String'];
  discord?: Maybe<Scalars['String']>;
  docs?: Maybe<Scalars['String']>;
  github?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  telegram?: Maybe<Scalars['String']>;
  type: Scalars['String'];
  website?: Maybe<Scalars['String']>;
}

export interface ProjectByte {
  __typename?: 'ProjectByte';
  admins: Array<Scalars['String']>;
  archive?: Maybe<Scalars['Boolean']>;
  content: Scalars['String'];
  created: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  postSubmissionStepContent?: Maybe<Scalars['String']>;
  priority: Scalars['Int'];
  steps: Array<ByteStep>;
  tags: Array<Scalars['String']>;
}

export interface ProjectByteCollection {
  __typename?: 'ProjectByteCollection';
  archive?: Maybe<Scalars['Boolean']>;
  byteIds: Array<Scalars['String']>;
  bytes: Array<ByteCollectionByte>;
  description: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  order: Scalars['Int'];
  status: Scalars['String'];
}

export interface ProjectShortVideo {
  __typename?: 'ProjectShortVideo';
  archive?: Maybe<Scalars['Boolean']>;
  createdAt: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['ID'];
  priority: Scalars['Int'];
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['String'];
  videoUrl: Scalars['String'];
}

export interface ProjectShortVideoInput {
  archive?: InputMaybe<Scalars['Boolean']>;
  description: Scalars['String'];
  id: Scalars['ID'];
  priority: Scalars['Int'];
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  videoUrl: Scalars['String'];
}

export interface Query {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']>;
  academyTask: AcademyTask;
  academyTasks?: Maybe<Array<AcademyTask>>;
  articleIndexingInfos: Array<ArticleIndexingInfo>;
  byte: Byte;
  byteCollection: ByteCollection;
  byteCollections: Array<ByteCollection>;
  byteSocialShare?: Maybe<ByteSocialShare>;
  bytes: Array<Byte>;
  chatbotCategories: Array<ChatbotCategory>;
  chatbotFAQs: Array<ChatbotFaq>;
  chatbotUserQuestions: Array<ChatbotUserQuestion>;
  consolidatedGuideRating?: Maybe<ConsolidatedGuideRating>;
  courses: Array<GitCourse>;
  discordChannels: Array<DiscordChannel>;
  discordMessages: Array<DiscordMessage>;
  discordServer: DiscordServer;
  discourseIndexRuns: Array<DiscourseIndexRun>;
  discoursePostComments: Array<DiscoursePostComment>;
  discoursePosts: Array<DiscoursePost>;
  gitCourse: GitCourse;
  gitCourseIntegrations?: Maybe<CourseIntegrations>;
  gitCourseSubmission?: Maybe<GitCourseSubmission>;
  gitCourseSummarized: SummarizedGitCourse;
  gitTopicSubmissions: Array<GitCourseTopicSubmission>;
  guide: Guide;
  guideRating: Array<GuideRating>;
  guideRatings: Array<GuideRating>;
  guideSubmissions: Array<GuideSubmission>;
  guides: Array<Guide>;
  project: Project;
  projectByte: ProjectByte;
  projectByteCollection: ProjectByteCollection;
  projectByteCollections: Array<ProjectByteCollection>;
  projectBytes: Array<ProjectByte>;
  projectShortVideo: ProjectShortVideo;
  projectShortVideos: Array<ProjectShortVideo>;
  projects: Array<Project>;
  rawGitCourse: RawGitCourse;
  rawGitCourses: Array<RawGitCourse>;
  route53Records: Array<Route53Record>;
  scrapedUrlInfos: Array<ScrapedUrlInfo>;
  searchChatbotFAQs: Array<SearchedChatbotFaq>;
  shortVideos?: Maybe<Array<ShortVideo>>;
  simulation: Simulation;
  simulations: Array<Simulation>;
  siteScrapingRuns: Array<SiteScrapingRun>;
  space?: Maybe<Space>;
  spaceDiscordGuild?: Maybe<Scalars['Any']>;
  spaces?: Maybe<Array<Space>>;
  timeline: Timeline;
  timelines: Array<Timeline>;
  vercelDomainRecords: Array<VercelDomain>;
  websiteScrapingInfos: Array<WebsiteScrapingInfo>;
}


export interface QueryAcademyTaskArgs {
  uuid: Scalars['String'];
}


export interface QueryAcademyTasksArgs {
  spaceId: Scalars['String'];
  status?: InputMaybe<Scalars['String']>;
}


export interface QueryArticleIndexingInfosArgs {
  spaceId: Scalars['String'];
}


export interface QueryByteArgs {
  byteId: Scalars['String'];
  includeDraft?: InputMaybe<Scalars['Boolean']>;
  spaceId: Scalars['String'];
}


export interface QueryByteCollectionArgs {
  byteCollectionId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryByteCollectionsArgs {
  spaceId: Scalars['String'];
}


export interface QueryByteSocialShareArgs {
  byteId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryBytesArgs {
  spaceId: Scalars['String'];
}


export interface QueryChatbotCategoriesArgs {
  spaceId: Scalars['String'];
}


export interface QueryChatbotFaQsArgs {
  spaceId: Scalars['String'];
}


export interface QueryChatbotUserQuestionsArgs {
  spaceId: Scalars['String'];
}


export interface QueryConsolidatedGuideRatingArgs {
  guideUuid: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryCoursesArgs {
  spaceId: Scalars['String'];
}


export interface QueryDiscordChannelsArgs {
  serverId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryDiscordMessagesArgs {
  channelId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryDiscordServerArgs {
  id: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryDiscourseIndexRunsArgs {
  spaceId: Scalars['String'];
}


export interface QueryDiscoursePostCommentsArgs {
  postId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryDiscoursePostsArgs {
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


export interface QueryGuideRatingArgs {
  ratingUuid: Scalars['String'];
}


export interface QueryGuideRatingsArgs {
  guideUuid: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryGuideSubmissionsArgs {
  filters: GuideSubmissionFiltersInput;
  guideUuid: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryGuidesArgs {
  spaceId: Scalars['String'];
}


export interface QueryProjectArgs {
  id: Scalars['String'];
}


export interface QueryProjectByteArgs {
  projectByteId: Scalars['String'];
  projectId: Scalars['String'];
}


export interface QueryProjectByteCollectionArgs {
  byteCollectionId: Scalars['String'];
  projectId: Scalars['String'];
}


export interface QueryProjectByteCollectionsArgs {
  projectId: Scalars['String'];
}


export interface QueryProjectBytesArgs {
  projectId: Scalars['String'];
}


export interface QueryProjectShortVideoArgs {
  projectByteId: Scalars['String'];
  projectId: Scalars['String'];
}


export interface QueryProjectShortVideosArgs {
  projectId: Scalars['String'];
}


export interface QueryProjectsArgs {
  type?: InputMaybe<Scalars['String']>;
}


export interface QueryRawGitCourseArgs {
  key: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryRawGitCoursesArgs {
  spaceId: Scalars['String'];
}


export interface QueryScrapedUrlInfosArgs {
  spaceId: Scalars['String'];
  websiteScrapingInfoId: Scalars['String'];
}


export interface QuerySearchChatbotFaQsArgs {
  query: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QueryShortVideosArgs {
  spaceId: Scalars['String'];
}


export interface QuerySimulationArgs {
  simulationId: Scalars['String'];
  spaceId: Scalars['String'];
}


export interface QuerySimulationsArgs {
  spaceId: Scalars['String'];
}


export interface QuerySiteScrapingRunsArgs {
  spaceId: Scalars['String'];
  websiteScrapingInfoId: Scalars['String'];
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


export interface QueryWebsiteScrapingInfosArgs {
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

export interface RatingDistribution {
  __typename?: 'RatingDistribution';
  content: Scalars['Float'];
  questions: Scalars['Float'];
  ux: Scalars['Float'];
}

export interface RawGitCourse {
  __typename?: 'RawGitCourse';
  courseKey: Scalars['String'];
  courseRepoUrl: Scalars['String'];
  publishStatus: Scalars['String'];
  weight: Scalars['Int'];
}

export interface Route53Record {
  __typename?: 'Route53Record';
  name?: Maybe<Scalars['String']>;
  records?: Maybe<Array<Maybe<Scalars['String']>>>;
  ttl?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['String']>;
}

export interface ScrapedUrlInfo {
  __typename?: 'ScrapedUrlInfo';
  createdAt: Scalars['DateTimeISO'];
  id: Scalars['String'];
  spaceId: Scalars['String'];
  text: Scalars['String'];
  textLength: Scalars['Int'];
  updatedAt: Scalars['DateTimeISO'];
  url: Scalars['String'];
  websiteScrapingInfo: WebsiteScrapingInfo;
  websiteScrapingInfoId: Scalars['String'];
}

export interface SearchedChatbotFaq extends ChatbotFaqCommon {
  __typename?: 'SearchedChatbotFAQ';
  answer: Scalars['String'];
  id: Scalars['String'];
  priority: Scalars['Int'];
  question: Scalars['String'];
  score: Scalars['Float'];
  spaceId: Scalars['String'];
  url: Scalars['String'];
}

export interface SendEmailInput {
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  message: Scalars['String'];
}

export interface ShortVideo {
  __typename?: 'ShortVideo';
  createdAt: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['ID'];
  priority: Scalars['Int'];
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['String'];
  videoUrl: Scalars['String'];
}

export interface ShortVideoInput {
  description: Scalars['String'];
  id: Scalars['ID'];
  priority: Scalars['Int'];
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  videoUrl: Scalars['String'];
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

export interface SiteScrapingRun {
  __typename?: 'SiteScrapingRun';
  createdAt: Scalars['DateTimeISO'];
  id: Scalars['String'];
  scrapingRunDate: Scalars['DateTimeISO'];
  scrapingStartUrl: Scalars['String'];
  spaceId: Scalars['String'];
  status: Scalars['String'];
  updatedAt: Scalars['DateTimeISO'];
  websiteScrapingInfo: WebsiteScrapingInfo;
  websiteScrapingInfoId: Scalars['String'];
}

export interface SocialSettings {
  __typename?: 'SocialSettings';
  linkedSharePdfBackgroundImage?: Maybe<Scalars['String']>;
}

export interface SocialSettingsInput {
  linkedSharePdfBackgroundImage?: InputMaybe<Scalars['String']>;
}

export interface Space {
  __typename?: 'Space';
  adminUsernames: Array<Scalars['String']>;
  adminUsernamesV1: Array<UsernameAndName>;
  admins: Array<Scalars['String']>;
  authSettings: AuthSettings;
  avatar?: Maybe<Scalars['String']>;
  botDomains?: Maybe<Array<Scalars['String']>>;
  byteSettings: ByteSettings;
  creator: Scalars['String'];
  domains: Array<Scalars['String']>;
  features: Array<Scalars['String']>;
  guideSettings: GuideSettings;
  id: Scalars['String'];
  inviteLinks?: Maybe<SpaceInviteLinks>;
  name: Scalars['String'];
  skin: Scalars['String'];
  socialSettings: SocialSettings;
  spaceIntegrations?: Maybe<SpaceIntegrations>;
  themeColors?: Maybe<ThemeColors>;
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
  loadersInfo?: Maybe<SpaceLoadersInfo>;
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

export interface SpaceLoadersInfo {
  __typename?: 'SpaceLoadersInfo';
  discordServerId?: Maybe<Scalars['String']>;
  discourseUrl?: Maybe<Scalars['String']>;
}

export interface SpaceLoadersInfoInput {
  discordServerId?: InputMaybe<Scalars['String']>;
  discourseUrl?: InputMaybe<Scalars['String']>;
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

export interface ThemeColors {
  __typename?: 'ThemeColors';
  bgColor: Scalars['String'];
  blockBg: Scalars['String'];
  borderColor: Scalars['String'];
  headingColor: Scalars['String'];
  linkColor: Scalars['String'];
  primaryColor: Scalars['String'];
  textColor: Scalars['String'];
}

export interface ThemeColorsInput {
  bgColor: Scalars['String'];
  blockBg: Scalars['String'];
  borderColor: Scalars['String'];
  headingColor: Scalars['String'];
  linkColor: Scalars['String'];
  primaryColor: Scalars['String'];
  textColor: Scalars['String'];
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
  timelineStyle?: Maybe<Scalars['String']>;
}

export interface TimelineEvent {
  __typename?: 'TimelineEvent';
  date: Scalars['DateTimeISO'];
  fullDetails?: Maybe<Scalars['String']>;
  moreLink?: Maybe<Scalars['String']>;
  order: Scalars['Int'];
  summary: Scalars['String'];
  title: Scalars['String'];
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

export interface UpdateByteCollectionInput {
  byteCollectionId: Scalars['String'];
  byteIds: Array<Scalars['String']>;
  description: Scalars['String'];
  name: Scalars['String'];
  order: Scalars['Int'];
  spaceId: Scalars['String'];
  status: Scalars['String'];
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
  steps: Array<ByteStepInput>;
  tags: Array<Scalars['String']>;
  thumbnail?: InputMaybe<Scalars['String']>;
}

export interface UpsertByteSocialShareInput {
  byteId: Scalars['String'];
  linkedInImages?: InputMaybe<Array<Scalars['String']>>;
  linkedInPdf?: InputMaybe<Scalars['String']>;
  linkedinPdfContent?: InputMaybe<ByteLinkedinPdfContentInput>;
  spaceId: Scalars['String'];
  twitterImage?: InputMaybe<Scalars['String']>;
}

export interface UpsertChatbotCategoryInput {
  description: Scalars['String'];
  id: Scalars['String'];
  key: Scalars['String'];
  name: Scalars['String'];
  priority: Scalars['Int'];
  subCategories: Array<UpsertChatbotSubcategoryInput>;
}

export interface UpsertChatbotFaqInput {
  answer: Scalars['String'];
  id: Scalars['String'];
  priority: Scalars['Int'];
  question: Scalars['String'];
  spaceId: Scalars['String'];
  url: Scalars['String'];
}

export interface UpsertChatbotSubcategoryInput {
  description: Scalars['String'];
  key: Scalars['String'];
  name: Scalars['String'];
}

export interface UpsertChatbotUserQuestionInput {
  id: Scalars['String'];
  question: Scalars['String'];
  spaceId: Scalars['String'];
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

export interface UpsertGuideRatingInput {
  endRating?: InputMaybe<Scalars['Int']>;
  guideUuid: Scalars['String'];
  negativeFeedback?: InputMaybe<GuideFeedbackInput>;
  positiveFeedback?: InputMaybe<GuideFeedbackInput>;
  ratingUuid: Scalars['String'];
  skipEndRating?: InputMaybe<Scalars['Boolean']>;
  skipStartRating?: InputMaybe<Scalars['Boolean']>;
  spaceId: Scalars['String'];
  startRating?: InputMaybe<Scalars['Int']>;
  userId?: InputMaybe<Scalars['String']>;
}

export interface UpsertProjectByteCollectionInput {
  archive?: InputMaybe<Scalars['Boolean']>;
  byteIds: Array<Scalars['String']>;
  description: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  order: Scalars['Int'];
  projectId: Scalars['String'];
  status: Scalars['String'];
}

export interface UpsertProjectByteInput {
  admins: Array<Scalars['String']>;
  archive?: InputMaybe<Scalars['Boolean']>;
  content: Scalars['String'];
  created: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  priority: Scalars['Int'];
  steps: Array<ByteStepInput>;
  tags: Array<Scalars['String']>;
  thumbnail?: InputMaybe<Scalars['String']>;
}

export interface UpsertProjectInput {
  adminUsernames: Array<Scalars['String']>;
  adminUsernamesV1: Array<UsernameAndNameInput>;
  admins: Array<Scalars['String']>;
  archive?: InputMaybe<Scalars['Boolean']>;
  cardThumbnail?: InputMaybe<Scalars['String']>;
  details: Scalars['String'];
  discord?: InputMaybe<Scalars['String']>;
  docs?: InputMaybe<Scalars['String']>;
  github?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  logo?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  telegram?: InputMaybe<Scalars['String']>;
  type: Scalars['String'];
  website?: InputMaybe<Scalars['String']>;
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
  adminUsernames: Array<Scalars['String']>;
  adminUsernamesV1: Array<UsernameAndNameInput>;
  admins: Array<Scalars['String']>;
  avatar: Scalars['String'];
  botDomains?: InputMaybe<Array<Scalars['String']>>;
  creator: Scalars['String'];
  domains: Array<Scalars['String']>;
  features: Array<Scalars['String']>;
  id: Scalars['String'];
  inviteLinks: SpaceInviteLinksInput;
  name: Scalars['String'];
  skin: Scalars['String'];
  spaceIntegrations: SpaceIntegrationsInput;
}

export interface UpsertSummaryOfDiscoursePostInput {
  aiSummary?: InputMaybe<Scalars['String']>;
  aiSummaryDate?: InputMaybe<Scalars['DateTimeISO']>;
  postId: Scalars['String'];
}

export interface UpsertTimelineEventInput {
  date: Scalars['DateTimeISO'];
  fullDetails?: InputMaybe<Scalars['String']>;
  moreLink?: InputMaybe<Scalars['String']>;
  summary: Scalars['String'];
  title: Scalars['String'];
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
  timelineStyle?: InputMaybe<Scalars['String']>;
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

export interface UsernameAndName {
  __typename?: 'UsernameAndName';
  nameOfTheUser: Scalars['String'];
  username: Scalars['String'];
}

export interface UsernameAndNameInput {
  nameOfTheUser: Scalars['String'];
  username: Scalars['String'];
}

export interface VercelDomain {
  __typename?: 'VercelDomain';
  apexName: Scalars['String'];
  createdAt?: Maybe<Scalars['Int']>;
  gitBranch?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  projectId: Scalars['String'];
  redirect?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Int']>;
  verified: Scalars['Boolean'];
}

export interface WebsiteScrapingInfo {
  __typename?: 'WebsiteScrapingInfo';
  baseUrl: Scalars['String'];
  createdAt: Scalars['DateTimeISO'];
  id: Scalars['String'];
  ignoreHashInUrl: Scalars['Boolean'];
  ignoreQueryParams: Scalars['Boolean'];
  scrapedUrlInfos: Array<ScrapedUrlInfo>;
  scrapingRuns: Array<SiteScrapingRun>;
  scrapingStartUrl: Scalars['String'];
  spaceId: Scalars['String'];
  updatedAt: Scalars['DateTimeISO'];
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

export type ByteCollectionFragment = { __typename?: 'ByteCollection', id: string, name: string, description: string, status: string, byteIds: Array<string>, order: number, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> };

export type ByteCollectionsQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ByteCollectionsQuery = { __typename?: 'Query', byteCollections: Array<{ __typename?: 'ByteCollection', id: string, name: string, description: string, status: string, byteIds: Array<string>, order: number, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> }> };

export type ByteCollectionQueryVariables = Exact<{
  spaceId: Scalars['String'];
  byteCollectionId: Scalars['String'];
}>;


export type ByteCollectionQuery = { __typename?: 'Query', byteCollection: { __typename?: 'ByteCollection', id: string, name: string, description: string, status: string, byteIds: Array<string>, order: number, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> } };

export type CreateByteCollectionMutationVariables = Exact<{
  input: CreateByteCollectionInput;
}>;


export type CreateByteCollectionMutation = { __typename?: 'Mutation', createByteCollection: { __typename?: 'ByteCollection', id: string, name: string, description: string, status: string, byteIds: Array<string>, order: number, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> } };

export type UpdateByteCollectionMutationVariables = Exact<{
  input: UpdateByteCollectionInput;
}>;


export type UpdateByteCollectionMutation = { __typename?: 'Mutation', updateByteCollection: { __typename?: 'ByteCollection', id: string, name: string, description: string, status: string, byteIds: Array<string>, order: number, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> } };

export type DeleteByteCollectionMutationVariables = Exact<{
  byteCollectionId: Scalars['String'];
}>;


export type DeleteByteCollectionMutation = { __typename?: 'Mutation', deleteByteCollection: boolean };

export type ByteLinkedinPdfContentStepFragment = { __typename?: 'ByteLinkedinPdfContentStep', content: string, name: string };

export type ByteLinkedinPdfContentFragment = { __typename?: 'ByteLinkedinPdfContent', excerpt: string, title: string, steps: Array<{ __typename?: 'ByteLinkedinPdfContentStep', content: string, name: string }> };

export type ByteSocialShareQueryVariables = Exact<{
  spaceId: Scalars['String'];
  byteId: Scalars['String'];
}>;


export type ByteSocialShareQuery = { __typename?: 'Query', byteSocialShare?: { __typename?: 'ByteSocialShare', byteId: string, linkedInImages?: Array<string> | null, linkedInPdf?: string | null, spaceId: string, twitterImage?: string | null, uuid: string, linkedinPdfContent?: { __typename?: 'ByteLinkedinPdfContent', excerpt: string, title: string, steps: Array<{ __typename?: 'ByteLinkedinPdfContentStep', content: string, name: string }> } | null } | null };

export type GenerateSharablePdfForByteMutationVariables = Exact<{
  spaceId: Scalars['String'];
  byteId: Scalars['String'];
}>;


export type GenerateSharablePdfForByteMutation = { __typename?: 'Mutation', payload: string };

export type UpsertByteSocialShareMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertByteSocialShareInput;
}>;


export type UpsertByteSocialShareMutation = { __typename?: 'Mutation', payload: { __typename?: 'ByteSocialShare', byteId: string, linkedInImages?: Array<string> | null, linkedInPdf?: string | null, spaceId: string, twitterImage?: string | null, uuid: string, linkedinPdfContent?: { __typename?: 'ByteLinkedinPdfContent', excerpt: string, title: string, steps: Array<{ __typename?: 'ByteLinkedinPdfContentStep', content: string, name: string }> } | null } };

export type ByteQuestionFragmentFragment = { __typename?: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> };

export type ByteUserInputFragmentFragment = { __typename?: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string };

export type ByteUserDiscordConnectFragmentFragment = { __typename?: 'UserDiscordConnect', type: string, uuid: string };

type ByteStepItem_ByteQuestion_Fragment = { __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> };

type ByteStepItem_ByteUserInput_Fragment = { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string };

type ByteStepItem_UserDiscordConnect_Fragment = { __typename: 'UserDiscordConnect', type: string, uuid: string };

export type ByteStepItemFragment = ByteStepItem_ByteQuestion_Fragment | ByteStepItem_ByteUserInput_Fragment | ByteStepItem_UserDiscordConnect_Fragment;

export type ByteStepFragment = { __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> };

export type ByteDetailsFragment = { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> };

export type ByteDetailsFragmentFragment = { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> };

export type ByteSummaryFragment = { __typename?: 'Byte', content: string, created: string, id: string, name: string, admins: Array<string>, tags: Array<string>, priority: number };

export type QueryBytesQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type QueryBytesQuery = { __typename?: 'Query', bytes: Array<{ __typename?: 'Byte', content: string, created: string, id: string, name: string, admins: Array<string>, tags: Array<string>, priority: number }> };

export type QueryByteDetailsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  byteId: Scalars['String'];
  includeDraft?: InputMaybe<Scalars['Boolean']>;
}>;


export type QueryByteDetailsQuery = { __typename?: 'Query', byte: { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type UpsertByteMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertByteInput;
}>;


export type UpsertByteMutation = { __typename?: 'Mutation', payload: { __typename?: 'Byte', postSubmissionStepContent?: string | null, content: string, created: string, id: string, name: string, admins: Array<string>, tags: Array<string>, priority: number, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type SubmitByteMutationVariables = Exact<{
  input: ByteSubmissionInput;
}>;


export type SubmitByteMutation = { __typename?: 'Mutation', submitByte: { __typename?: 'ByteSubmission', id: string, created: string, createdBy: string, byteId: string, spaceId: string } };

export type ChatbotSubCategoryFragment = { __typename?: 'ChatbotSubcategory', name: string, key: string, description: string };

export type ChatbotCategoryFragment = { __typename?: 'ChatbotCategory', id: string, priority: number, description: string, key: string, name: string, subCategories: Array<{ __typename?: 'ChatbotSubcategory', name: string, key: string, description: string }> };

export type ChatbotFaqFragment = { __typename?: 'ChatbotFAQ', id: string, spaceId: string, question: string, answer: string, priority: number, url: string };

export type SearchedChatbotFaqFragmentFragment = { __typename?: 'SearchedChatbotFAQ', id: string, spaceId: string, question: string, answer: string, priority: number, url: string, score: number };

export type ChatbotUserQuestionFragment = { __typename?: 'ChatbotUserQuestion', id: string, spaceId: string, question: string };

export type ChatbotCategoriesQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ChatbotCategoriesQuery = { __typename?: 'Query', chatbotCategories: Array<{ __typename?: 'ChatbotCategory', id: string, priority: number, description: string, key: string, name: string, subCategories: Array<{ __typename?: 'ChatbotSubcategory', name: string, key: string, description: string }> }> };

export type ChatbotFaQsQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ChatbotFaQsQuery = { __typename?: 'Query', chatbotFAQs: Array<{ __typename?: 'ChatbotFAQ', id: string, spaceId: string, question: string, answer: string, priority: number, url: string }> };

export type SearchChatbotFaQsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  query: Scalars['String'];
}>;


export type SearchChatbotFaQsQuery = { __typename?: 'Query', searchChatbotFAQs: Array<{ __typename?: 'SearchedChatbotFAQ', id: string, spaceId: string, question: string, answer: string, priority: number, url: string, score: number }> };

export type ChatbotUserQuestionsQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ChatbotUserQuestionsQuery = { __typename?: 'Query', chatbotUserQuestions: Array<{ __typename?: 'ChatbotUserQuestion', id: string, spaceId: string, question: string }> };

export type UpsertChatbotCategoryMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertChatbotCategoryInput;
}>;


export type UpsertChatbotCategoryMutation = { __typename?: 'Mutation', upsertChatbotCategory: { __typename?: 'ChatbotCategory', id: string, priority: number, description: string, key: string, name: string, subCategories: Array<{ __typename?: 'ChatbotSubcategory', name: string, key: string, description: string }> } };

export type UpsertChatbotFaqMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertChatbotFaqInput;
}>;


export type UpsertChatbotFaqMutation = { __typename?: 'Mutation', upsertChatbotFAQ: { __typename?: 'ChatbotFAQ', id: string, spaceId: string, question: string, answer: string, priority: number, url: string } };

export type IndexChatbotFaQsMutationVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type IndexChatbotFaQsMutation = { __typename?: 'Mutation', indexChatbotFAQs: boolean };

export type UpsertChatbotUserQuestionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertChatbotUserQuestionInput;
}>;


export type UpsertChatbotUserQuestionMutation = { __typename?: 'Mutation', upsertChatbotUserQuestion: { __typename?: 'ChatbotUserQuestion', id: string, spaceId: string, question: string } };

export type DeleteChatbotCategoryMutationVariables = Exact<{
  spaceId: Scalars['String'];
  id: Scalars['String'];
}>;


export type DeleteChatbotCategoryMutation = { __typename?: 'Mutation', deleteChatbotCategory: boolean };

export type DeleteChatbotFaqMutationVariables = Exact<{
  spaceId: Scalars['String'];
  id: Scalars['String'];
}>;


export type DeleteChatbotFaqMutation = { __typename?: 'Mutation', deleteChatbotFAQ: boolean };

export type DeleteChatbotUserQuestionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  id: Scalars['String'];
}>;


export type DeleteChatbotUserQuestionMutation = { __typename?: 'Mutation', deleteChatbotUserQuestion: boolean };

export type TopicSubmissionJsonFragment = { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> | null }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null };

export type TopicCorrectAnswersFragment = { __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> };

export type TopicSubmissionFragment = { __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: any, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: any, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> | null }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null };

export type CourseSubmissionFragment = { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: string, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: any, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: any, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: any, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> | null }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> };

export type GitCourseSubmissionQueryVariables = Exact<{
  spaceId: Scalars['String'];
  courseKey: Scalars['String'];
}>;


export type GitCourseSubmissionQuery = { __typename?: 'Query', payload?: { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: string, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: any, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: any, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: any, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> | null }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> } | null };

export type UpsertGitCourseTopicSubmissionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  gitCourseTopicSubmission: GitCourseTopicSubmissionInput;
}>;


export type UpsertGitCourseTopicSubmissionMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: string, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: any, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: any, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: any, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> | null }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> } };

export type SubmitGitCourseTopicMutationVariables = Exact<{
  spaceId: Scalars['String'];
  gitCourseTopicSubmission: GitCourseTopicSubmissionInput;
}>;


export type SubmitGitCourseTopicMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: string, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: any, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: any, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: any, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> | null }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> } };

export type SubmitGitCourseMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: CourseSubmissionInput;
}>;


export type SubmitGitCourseMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: string, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: any, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: any, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: any, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> | null }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> } };

export type InitializeGitCourseSubmissionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  courseKey: Scalars['String'];
}>;


export type InitializeGitCourseSubmissionMutation = { __typename?: 'Mutation', payload: { __typename?: 'GitCourseSubmission', uuid: string, courseKey: string, createdAt: string, createdBy: string, galaxyCredentialsUpdated?: boolean | null, isLatestSubmission?: boolean | null, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, updatedAt: any, topicSubmissions: Array<{ __typename?: 'GitCourseTopicSubmission', uuid: string, courseKey: string, courseSubmissionUuid: string, createdAt: any, createdBy: string, isLatestSubmission: boolean, questionsAttempted?: number | null, questionsCorrect?: number | null, questionsIncorrect?: number | null, questionsSkipped?: number | null, spaceId: string, status: string, topicKey: string, updatedAt: any, correctAnswers?: Array<{ __typename?: 'GitCourseTopicCorrectAnswer', uuid: string, answerKeys: Array<string> }> | null, submission?: { __typename?: 'GitCourseTopicSubmissionJson', uuid: string, topicKey: string, status: string, explanations?: Array<{ __typename?: 'GitCourseExplanationsSubmission', key: string, status: string }> | null, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, status: string, answers: Array<string> }> | null, readings?: Array<{ __typename?: 'GitCourseReadingsSubmission', uuid: string, status: string, questions?: Array<{ __typename?: 'GitCourseQuestionsSubmission', uuid: string, answers: Array<string>, status: string }> | null }> | null, summaries?: Array<{ __typename?: 'GitCourseSummariesSubmission', key: string, status: string }> | null } | null }> } };

export type DeleteGitCourseSubmissionMutationVariables = Exact<{
  spaceId: Scalars['String'];
  courseKey: Scalars['String'];
}>;


export type DeleteGitCourseSubmissionMutation = { __typename?: 'Mutation', payload: boolean };

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

export type AddTopicQuestionsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: AddTopicQuestionsInput;
}>;


export type AddTopicQuestionsMutation = { __typename?: 'Mutation', payload: Array<{ __typename?: 'GitCourseQuestion', uuid: string, type: string, content: string, answerKeys: Array<string>, hint: string, explanation: string, choices: Array<{ __typename?: 'GitCourseQuestionChoice', content: string, key: string }> }> };

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


export type RawGitCourseQuery = { __typename?: 'Query', payload: { __typename?: 'RawGitCourse', courseKey: string, courseRepoUrl: string, weight: number, publishStatus: string } };

export type UpsertRawGitCourseMutationVariables = Exact<{
  spaceId: Scalars['String'];
  courseInput: GitCourseInput;
}>;


export type UpsertRawGitCourseMutation = { __typename?: 'Mutation', payload?: { __typename?: 'SummarizedGitCourse', courseAdmins?: Array<string> | null, details: string, duration: string, highlights: Array<string>, key: string, priority?: number | null, publishStatus: string, summary: string, thumbnail: string, title: string, uuid: string } | null };

export type RawGitCoursesQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type RawGitCoursesQuery = { __typename?: 'Query', payload: Array<{ __typename?: 'RawGitCourse', courseKey: string, courseRepoUrl: string, weight: number, publishStatus: string }> };

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

export type DeleteAndPullCourseRepoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  courseKey: Scalars['String'];
}>;


export type DeleteAndPullCourseRepoMutation = { __typename?: 'Mutation', deleteAndPullCourseRepo: { __typename?: 'GitCourse', courseAdmins?: Array<string> | null, courseFailContent?: string | null, coursePassContent?: string | null, coursePassCount?: number | null, details: string, duration: string, highlights: Array<string>, key: string, priority?: number | null, publishStatus: string, summary: string, thumbnail: string, title: string } };

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

export type UpsertGnosisSafeWalletsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  wallets: Array<GnosisSafeWalletInput> | GnosisSafeWalletInput;
}>;


export type UpsertGnosisSafeWalletsMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string } };

export type GuideRatingFragment = { __typename?: 'GuideRating', ratingUuid: string, createdAt: any, endRating?: number | null, guideUuid: string, ipAddress?: string | null, skipEndRating?: boolean | null, skipStartRating?: boolean | null, spaceId: string, startRating?: number | null, updatedAt: any, userId?: string | null, username?: string | null, negativeFeedback?: { __typename?: 'GuideFeedback', content?: boolean | null, questions?: boolean | null, ux?: boolean | null } | null, positiveFeedback?: { __typename?: 'GuideFeedback', ux?: boolean | null, questions?: boolean | null, content?: boolean | null } | null };

export type UpsertGuideRatingsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  upsertGuideRatingInput: UpsertGuideRatingInput;
}>;


export type UpsertGuideRatingsMutation = { __typename?: 'Mutation', payload: { __typename?: 'GuideRating', ratingUuid: string, createdAt: any, endRating?: number | null, guideUuid: string, ipAddress?: string | null, skipEndRating?: boolean | null, skipStartRating?: boolean | null, spaceId: string, startRating?: number | null, updatedAt: any, userId?: string | null, username?: string | null, negativeFeedback?: { __typename?: 'GuideFeedback', content?: boolean | null, questions?: boolean | null, ux?: boolean | null } | null, positiveFeedback?: { __typename?: 'GuideFeedback', ux?: boolean | null, questions?: boolean | null, content?: boolean | null } | null } };

export type GuideRatingsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  guideUuid: Scalars['String'];
}>;


export type GuideRatingsQuery = { __typename?: 'Query', guideRatings: Array<{ __typename?: 'GuideRating', ratingUuid: string, createdAt: any, endRating?: number | null, guideUuid: string, ipAddress?: string | null, skipEndRating?: boolean | null, skipStartRating?: boolean | null, spaceId: string, startRating?: number | null, updatedAt: any, userId?: string | null, username?: string | null, negativeFeedback?: { __typename?: 'GuideFeedback', content?: boolean | null, questions?: boolean | null, ux?: boolean | null } | null, positiveFeedback?: { __typename?: 'GuideFeedback', ux?: boolean | null, questions?: boolean | null, content?: boolean | null } | null }> };

export type ConsolidatedGuideRatingQueryVariables = Exact<{
  spaceId: Scalars['String'];
  guideUuid: Scalars['String'];
}>;


export type ConsolidatedGuideRatingQuery = { __typename?: 'Query', consolidatedGuideRating?: { __typename?: 'ConsolidatedGuideRating', avgRating: number, endRatingFeedbackCount: number, positiveFeedbackCount: number, negativeFeedbackCount: number, positiveRatingDistribution: { __typename?: 'RatingDistribution', content: number, questions: number, ux: number }, negativeRatingDistribution: { __typename?: 'RatingDistribution', content: number, questions: number, ux: number } } | null };

export type GuideSubmissionsQueryQueryVariables = Exact<{
  spaceId: Scalars['String'];
  guideUuid: Scalars['String'];
  filters: GuideSubmissionFiltersInput;
}>;


export type GuideSubmissionsQueryQuery = { __typename?: 'Query', guideSubmissions: Array<{ __typename?: 'GuideSubmission', id: string, createdAt: any, createdBy: string, createdByUsername: string, guideId: string, guideUuid: string, spaceId: string, uuid: string, correctQuestionsCount: number, result: { __typename?: 'GuideSubmissionResult', correctQuestions: Array<string>, wrongQuestions: Array<string>, allQuestions: Array<string> }, steps?: Array<{ __typename?: 'GuideStepSubmission', uuid: string, itemResponses: Array<{ __typename?: 'GuideStepItemSubmission', type: string, userInput?: string | null, uuid: string }> }> | null }> };

export type SubmitGuideMutationVariables = Exact<{
  input: GuideSubmissionInput;
}>;


export type SubmitGuideMutation = { __typename?: 'Mutation', payload: { __typename?: 'GuideSubmission', galaxyCredentialsUpdated?: boolean | null, result: { __typename?: 'GuideSubmissionResult', wrongQuestions: Array<string>, correctQuestions: Array<string>, allQuestions: Array<string> } } };

export type GuideQuestionFragment = { __typename?: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, explanation?: string | null, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> };

export type GuideUserInputFragment = { __typename?: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string };

export type GuideUserDiscordConnectFragment = { __typename?: 'UserDiscordConnect', type: string, uuid: string };

type GuideStepItem_GuideQuestion_Fragment = { __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, explanation?: string | null, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> };

type GuideStepItem_GuideUserInput_Fragment = { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string };

type GuideStepItem_UserDiscordConnect_Fragment = { __typename: 'UserDiscordConnect', type: string, uuid: string };

export type GuideStepItemFragment = GuideStepItem_GuideQuestion_Fragment | GuideStepItem_GuideUserInput_Fragment | GuideStepItem_UserDiscordConnect_Fragment;

export type GuideStepFragment = { __typename?: 'GuideStep', content: string, id: string, name: string, order: number, uuid: string, stepItems: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, explanation?: string | null, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> };

export type GuideIntegrationFragment = { __typename?: 'GuideIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null };

export type GuideFragment = { __typename?: 'Guide', authors: Array<string>, categories: Array<string>, postSubmissionStepContent?: string | null, content: string, createdAt: any, id: string, guideSource: string, guideType: string, name: string, publishStatus: string, priority?: number | null, thumbnail?: string | null, uuid: string, version: number, guideIntegrations: { __typename?: 'GuideIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null }, steps: Array<{ __typename?: 'GuideStep', content: string, id: string, name: string, order: number, uuid: string, stepItems: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, explanation?: string | null, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> };

export type UpsertGuideMutationVariables = Exact<{
  spaceId: Scalars['String'];
  guideInput: GuideInput;
}>;


export type UpsertGuideMutation = { __typename?: 'Mutation', payload: { __typename?: 'Guide', authors: Array<string>, categories: Array<string>, postSubmissionStepContent?: string | null, content: string, createdAt: any, id: string, guideSource: string, guideType: string, name: string, publishStatus: string, priority?: number | null, thumbnail?: string | null, uuid: string, version: number, guideIntegrations: { __typename?: 'GuideIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null }, steps: Array<{ __typename?: 'GuideStep', content: string, id: string, name: string, order: number, uuid: string, stepItems: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, explanation?: string | null, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type GuideQueryQueryVariables = Exact<{
  spaceId: Scalars['String'];
  uuid: Scalars['String'];
}>;


export type GuideQueryQuery = { __typename?: 'Query', guide: { __typename?: 'Guide', authors: Array<string>, categories: Array<string>, postSubmissionStepContent?: string | null, content: string, createdAt: any, id: string, guideSource: string, guideType: string, name: string, publishStatus: string, priority?: number | null, thumbnail?: string | null, uuid: string, version: number, guideIntegrations: { __typename?: 'GuideIntegrations', discordRoleIds?: Array<string> | null, discordRolePassingCount?: number | null, discordWebhook?: string | null, projectGalaxyCredentialId?: string | null, projectGalaxyOatMintUrl?: string | null, projectGalaxyOatPassingCount?: number | null }, steps: Array<{ __typename?: 'GuideStep', content: string, id: string, name: string, order: number, uuid: string, stepItems: Array<{ __typename: 'GuideQuestion', answerKeys: Array<string>, content: string, order: number, type: string, uuid: string, explanation?: string | null, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'GuideUserInput', label: string, order: number, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type DeleteGuideMutationVariables = Exact<{
  spaceId: Scalars['String'];
  uuid: Scalars['String'];
}>;


export type DeleteGuideMutation = { __typename?: 'Mutation', payload: boolean };

export type GuideSummaryFragment = { __typename?: 'Guide', id: string, authors: Array<string>, name: string, categories: Array<string>, content: string, createdAt: any, guideSource: string, guideType: string, publishStatus: string, thumbnail?: string | null, uuid: string, priority?: number | null };

export type GuidesQueryQueryVariables = Exact<{
  space: Scalars['String'];
}>;


export type GuidesQueryQuery = { __typename?: 'Query', guides: Array<{ __typename?: 'Guide', id: string, authors: Array<string>, name: string, categories: Array<string>, content: string, createdAt: any, guideSource: string, guideType: string, publishStatus: string, thumbnail?: string | null, uuid: string, priority?: number | null }> };

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


export type DownloadAndCleanContentMutation = { __typename?: 'Mutation', downloadAndCleanContent: { __typename?: 'DownloadAndCleanContentResponse', content: string, links: Array<{ __typename?: 'DownloadLinkInfo', downloadStatus: string, link: string, tokenCount: number }> } };

export type GenerateImageMutationVariables = Exact<{
  input: GenerateImageInput;
}>;


export type GenerateImageMutation = { __typename?: 'Mutation', generateImage: { __typename?: 'ImagesResponse', created: number, data: Array<{ __typename?: 'ImagesResponseDataInner', url?: string | null }> } };

export type ProjectFragment = { __typename?: 'Project', adminUsernames: Array<string>, admins: Array<string>, creator: string, details: string, discord?: string | null, docs?: string | null, github?: string | null, id: string, logo?: string | null, name: string, telegram?: string | null, website?: string | null, type: string, cardThumbnail?: string | null, archive?: boolean | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }> };

export type ProjectByteFragment = { __typename?: 'ProjectByte', admins: Array<string>, content: string, created: string, id: string, name: string, postSubmissionStepContent?: string | null, priority: number, tags: Array<string>, archive?: boolean | null, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> };

export type ProjectShortVideoFragment = { __typename?: 'ProjectShortVideo', id: string, title: string, description: string, thumbnail: string, videoUrl: string, priority: number, createdAt: string, updatedAt: string, archive?: boolean | null };

export type ProjectByteCollectionFragment = { __typename?: 'ProjectByteCollection', byteIds: Array<string>, description: string, id: string, name: string, order: number, status: string, archive?: boolean | null, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> };

export type ProjectsQueryVariables = Exact<{
  type?: InputMaybe<Scalars['String']>;
}>;


export type ProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', adminUsernames: Array<string>, admins: Array<string>, creator: string, details: string, discord?: string | null, docs?: string | null, github?: string | null, id: string, logo?: string | null, name: string, telegram?: string | null, website?: string | null, type: string, cardThumbnail?: string | null, archive?: boolean | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }> }> };

export type ProjectQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type ProjectQuery = { __typename?: 'Query', project: { __typename?: 'Project', adminUsernames: Array<string>, admins: Array<string>, creator: string, details: string, discord?: string | null, docs?: string | null, github?: string | null, id: string, logo?: string | null, name: string, telegram?: string | null, website?: string | null, type: string, cardThumbnail?: string | null, archive?: boolean | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }> } };

export type ProjectBytesQueryVariables = Exact<{
  projectId: Scalars['String'];
}>;


export type ProjectBytesQuery = { __typename?: 'Query', projectBytes: Array<{ __typename?: 'ProjectByte', admins: Array<string>, content: string, created: string, id: string, name: string, postSubmissionStepContent?: string | null, priority: number, tags: Array<string>, archive?: boolean | null, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> }> };

export type ProjectShortVideosQueryVariables = Exact<{
  projectId: Scalars['String'];
}>;


export type ProjectShortVideosQuery = { __typename?: 'Query', projectShortVideos: Array<{ __typename?: 'ProjectShortVideo', id: string, title: string, description: string, thumbnail: string, videoUrl: string, priority: number, createdAt: string, updatedAt: string, archive?: boolean | null }> };

export type ProjectByteQueryVariables = Exact<{
  projectId: Scalars['String'];
  id: Scalars['String'];
}>;


export type ProjectByteQuery = { __typename?: 'Query', projectByte: { __typename?: 'ProjectByte', admins: Array<string>, content: string, created: string, id: string, name: string, postSubmissionStepContent?: string | null, priority: number, tags: Array<string>, archive?: boolean | null, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type ProjectByteCollectionsQueryVariables = Exact<{
  projectId: Scalars['String'];
}>;


export type ProjectByteCollectionsQuery = { __typename?: 'Query', projectByteCollections: Array<{ __typename?: 'ProjectByteCollection', byteIds: Array<string>, description: string, id: string, name: string, order: number, status: string, archive?: boolean | null, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> }> };

export type ProjectByteCollectionQueryVariables = Exact<{
  projectId: Scalars['String'];
  id: Scalars['String'];
}>;


export type ProjectByteCollectionQuery = { __typename?: 'Query', projectByteCollection: { __typename?: 'ProjectByteCollection', byteIds: Array<string>, description: string, id: string, name: string, order: number, status: string, archive?: boolean | null, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> } };

export type UpsertProjectMutationVariables = Exact<{
  input: UpsertProjectInput;
}>;


export type UpsertProjectMutation = { __typename?: 'Mutation', upsertProject: { __typename?: 'Project', adminUsernames: Array<string>, admins: Array<string>, creator: string, details: string, discord?: string | null, docs?: string | null, github?: string | null, id: string, logo?: string | null, name: string, telegram?: string | null, website?: string | null, type: string, cardThumbnail?: string | null, archive?: boolean | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }> } };

export type UpsertProjectByteMutationVariables = Exact<{
  projectId: Scalars['String'];
  input: UpsertProjectByteInput;
}>;


export type UpsertProjectByteMutation = { __typename?: 'Mutation', upsertProjectByte: { __typename?: 'ProjectByte', admins: Array<string>, content: string, created: string, id: string, name: string, postSubmissionStepContent?: string | null, priority: number, tags: Array<string>, archive?: boolean | null, steps: Array<{ __typename?: 'ByteStep', content: string, name: string, uuid: string, stepItems: Array<{ __typename: 'ByteQuestion', answerKeys: Array<string>, content: string, type: string, uuid: string, explanation: string, choices: Array<{ __typename?: 'QuestionChoice', content: string, key: string }> } | { __typename: 'ByteUserInput', label: string, required: boolean, type: string, uuid: string } | { __typename: 'UserDiscordConnect', type: string, uuid: string }> }> } };

export type UpsertProjectByteCollectionMutationVariables = Exact<{
  projectId: Scalars['String'];
  input: UpsertProjectByteCollectionInput;
}>;


export type UpsertProjectByteCollectionMutation = { __typename?: 'Mutation', upsertProjectByteCollection: { __typename?: 'ProjectByteCollection', byteIds: Array<string>, description: string, id: string, name: string, order: number, status: string, archive?: boolean | null, bytes: Array<{ __typename?: 'ByteCollectionByte', byteId: string, name: string, content: string }> } };

export type UpsertProjectShortVideoMutationVariables = Exact<{
  projectId: Scalars['String'];
  input: ProjectShortVideoInput;
}>;


export type UpsertProjectShortVideoMutation = { __typename?: 'Mutation', upsertProjectShortVideo: { __typename?: 'ProjectShortVideo', id: string, title: string, description: string, thumbnail: string, videoUrl: string, priority: number, createdAt: string, updatedAt: string, archive?: boolean | null } };

export type ShortVideoFragment = { __typename?: 'ShortVideo', id: string, title: string, description: string, thumbnail: string, videoUrl: string, priority: number, createdAt: string, updatedAt: string };

export type UpsertShortVideoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  shortVideo: ShortVideoInput;
}>;


export type UpsertShortVideoMutation = { __typename?: 'Mutation', upsertShortVideo: { __typename?: 'ShortVideo', id: string, title: string, description: string, thumbnail: string, videoUrl: string, priority: number, createdAt: string, updatedAt: string } };

export type ShortVideosQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ShortVideosQuery = { __typename?: 'Query', shortVideos?: Array<{ __typename?: 'ShortVideo', id: string, title: string, description: string, thumbnail: string, videoUrl: string, priority: number, createdAt: string, updatedAt: string }> | null };

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

export type DiscourseIndexRunFragmentFragment = { __typename?: 'DiscourseIndexRun', createdAt: any, id: string, runDate?: any | null, status: string };

export type DiscordServerFragmentFragment = { __typename?: 'DiscordServer', createdAt: any, discordServerId: string, iconUrl?: string | null, id: string, name: string, updatedAt: any };

export type DiscordChannelFragmentFragment = { __typename?: 'DiscordChannel', id: string, name: string, type: string, status: string, discordChannelId: string, shouldIndex: boolean, createdAt: any, serverId: string, updatedAt: any };

export type DiscordMessageFragmentFragment = { __typename?: 'DiscordMessage', id: string, content: string, discordMessageId: string, createdAt: any, updatedAt: any, serverId: string, channelId: string, messageDate: any, authorUsername: string };

export type WebsiteScrapingInfoFragment = { __typename?: 'WebsiteScrapingInfo', id: string, baseUrl: string, scrapingStartUrl: string, ignoreHashInUrl: boolean, ignoreQueryParams: boolean, createdAt: any, updatedAt: any };

export type ArticleIndexingInfoFragment = { __typename?: 'ArticleIndexingInfo', id: string, spaceId: string, articleUrl: string, createdAt: any, updatedAt: any, status: string, text?: string | null, textLength?: number | null };

export type SiteScrapingRunFragmentFragment = { __typename?: 'SiteScrapingRun', id: string, websiteScrapingInfoId: string, scrapingRunDate: any, status: string, createdAt: any, updatedAt: any };

export type ScrapedUrlInfoFragmentFragment = { __typename?: 'ScrapedUrlInfo', id: string, websiteScrapingInfoId: string, url: string, text: string, textLength: number, createdAt: any, updatedAt: any };

export type DiscoursePostFragment = { __typename?: 'DiscoursePost', id: string, spaceId: string, title: string, url: string, fullContent?: string | null, author?: string | null, datePublished: any, createdAt: any, indexedAt?: any | null, status: string, enacted?: boolean | null, discussed?: boolean | null, aiSummary?: string | null, aiSummaryDate?: any | null };

export type DiscourseIndexRunsQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type DiscourseIndexRunsQuery = { __typename?: 'Query', discourseIndexRuns: Array<{ __typename?: 'DiscourseIndexRun', createdAt: any, id: string, runDate?: any | null, status: string }> };

export type DiscoursePostsQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type DiscoursePostsQuery = { __typename?: 'Query', discoursePosts: Array<{ __typename?: 'DiscoursePost', id: string, spaceId: string, title: string, url: string, fullContent?: string | null, author?: string | null, datePublished: any, createdAt: any, indexedAt?: any | null, status: string, enacted?: boolean | null, discussed?: boolean | null, aiSummary?: string | null, aiSummaryDate?: any | null }> };

export type DiscoursePostCommentsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  postId: Scalars['String'];
}>;


export type DiscoursePostCommentsQuery = { __typename?: 'Query', discoursePostComments: Array<{ __typename?: 'DiscoursePostComment', id: string, spaceId: string, commentPostId: string, author: string, datePublished: any, createdAt: any, indexedAt: any, content: string, postId: string }> };

export type DiscourseTopicsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  postId: Scalars['String'];
}>;


export type DiscourseTopicsQuery = { __typename?: 'Query', discoursePostComments: Array<{ __typename?: 'DiscoursePostComment', id: string, commentPostId: string, spaceId: string, content: string, author: string, datePublished: any, createdAt: any, indexedAt: any, postId: string }> };

export type DiscordServerQueryVariables = Exact<{
  spaceId: Scalars['String'];
  id: Scalars['String'];
}>;


export type DiscordServerQuery = { __typename?: 'Query', discordServer: { __typename?: 'DiscordServer', createdAt: any, discordServerId: string, iconUrl?: string | null, id: string, name: string, updatedAt: any } };

export type DiscordChannelsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  serverId: Scalars['String'];
}>;


export type DiscordChannelsQuery = { __typename?: 'Query', discordChannels: Array<{ __typename?: 'DiscordChannel', id: string, name: string, type: string, status: string, discordChannelId: string, shouldIndex: boolean, createdAt: any, serverId: string, updatedAt: any }> };

export type DiscordMessagesQueryVariables = Exact<{
  spaceId: Scalars['String'];
  channelId: Scalars['String'];
}>;


export type DiscordMessagesQuery = { __typename?: 'Query', discordMessages: Array<{ __typename?: 'DiscordMessage', id: string, content: string, discordMessageId: string, createdAt: any, updatedAt: any, serverId: string, channelId: string, messageDate: any, authorUsername: string }> };

export type WebsiteScrapingInfosQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type WebsiteScrapingInfosQuery = { __typename?: 'Query', websiteScrapingInfos: Array<{ __typename?: 'WebsiteScrapingInfo', id: string, baseUrl: string, scrapingStartUrl: string, ignoreHashInUrl: boolean, ignoreQueryParams: boolean, createdAt: any, updatedAt: any }> };

export type ArticleIndexingInfosQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ArticleIndexingInfosQuery = { __typename?: 'Query', articleIndexingInfos: Array<{ __typename?: 'ArticleIndexingInfo', id: string, spaceId: string, articleUrl: string, createdAt: any, updatedAt: any, status: string, text?: string | null, textLength?: number | null }> };

export type SiteScrapingRunsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  websiteScrapingInfoId: Scalars['String'];
}>;


export type SiteScrapingRunsQuery = { __typename?: 'Query', siteScrapingRuns: Array<{ __typename?: 'SiteScrapingRun', id: string, websiteScrapingInfoId: string, scrapingRunDate: any, status: string, createdAt: any, updatedAt: any }> };

export type ScrapedUrlInfosQueryVariables = Exact<{
  spaceId: Scalars['String'];
  websiteScrapingInfoId: Scalars['String'];
}>;


export type ScrapedUrlInfosQuery = { __typename?: 'Query', scrapedUrlInfos: Array<{ __typename?: 'ScrapedUrlInfo', id: string, websiteScrapingInfoId: string, url: string, text: string, textLength: number, createdAt: any, updatedAt: any }> };

export type TriggerNewDiscourseIndexRunMutationVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type TriggerNewDiscourseIndexRunMutation = { __typename?: 'Mutation', triggerNewDiscourseIndexRun: { __typename?: 'DiscourseIndexRun', createdAt: any, id: string, runDate?: any | null, status: string } };

export type UpdateIndexWithAllDiscordPostsMutationVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type UpdateIndexWithAllDiscordPostsMutation = { __typename?: 'Mutation', updateIndexWithAllDiscordPosts: boolean };

export type IndexNeedsIndexingDiscoursePostsMutationVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type IndexNeedsIndexingDiscoursePostsMutation = { __typename?: 'Mutation', indexNeedsIndexingDiscoursePosts: { __typename?: 'DiscourseIndexRun', createdAt: any, id: string, runDate?: any | null, status: string } };

export type ReFetchDiscordServersMutationVariables = Exact<{ [key: string]: never; }>;


export type ReFetchDiscordServersMutation = { __typename?: 'Mutation', reFetchDiscordServers: Array<{ __typename?: 'DiscordServer', createdAt: any, discordServerId: string, iconUrl?: string | null, id: string, name: string, updatedAt: any }> };

export type ReFetchDiscordChannelsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  serverId: Scalars['String'];
}>;


export type ReFetchDiscordChannelsMutation = { __typename?: 'Mutation', reFetchDiscordChannels: Array<{ __typename?: 'DiscordChannel', id: string, name: string, type: string, status: string, discordChannelId: string, shouldIndex: boolean, createdAt: any, serverId: string, updatedAt: any }> };

export type ReFetchDiscordMessagesMutationVariables = Exact<{
  spaceId: Scalars['String'];
  channelId: Scalars['String'];
}>;


export type ReFetchDiscordMessagesMutation = { __typename?: 'Mutation', reFetchDiscordMessages: boolean };

export type UpdateIndexingOfDiscordChannelMutationVariables = Exact<{
  spaceId: Scalars['String'];
  channelId: Scalars['String'];
  shouldIndex: Scalars['Boolean'];
}>;


export type UpdateIndexingOfDiscordChannelMutation = { __typename?: 'Mutation', updateIndexingOfDiscordChannel: { __typename?: 'DiscordChannel', id: string, name: string, type: string, status: string, discordChannelId: string, shouldIndex: boolean, createdAt: any, serverId: string, updatedAt: any } };

export type IndexDiscoursePostMutationVariables = Exact<{
  spaceId: Scalars['String'];
  postId: Scalars['String'];
}>;


export type IndexDiscoursePostMutation = { __typename?: 'Mutation', indexDiscoursePost: boolean };

export type CreateWebsiteScrapingInfoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  baseUrl: Scalars['String'];
  scrapingStartUrl: Scalars['String'];
  ignoreHashInUrl: Scalars['Boolean'];
  ignoreQueryParams: Scalars['Boolean'];
}>;


export type CreateWebsiteScrapingInfoMutation = { __typename?: 'Mutation', createWebsiteScrapingInfo: { __typename?: 'WebsiteScrapingInfo', id: string, baseUrl: string, scrapingStartUrl: string, ignoreHashInUrl: boolean, ignoreQueryParams: boolean, createdAt: any, updatedAt: any } };

export type EditWebsiteScrapingInfoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  websiteScrapingInfoId: Scalars['String'];
  baseUrl: Scalars['String'];
  scrapingStartUrl: Scalars['String'];
  ignoreHashInUrl: Scalars['Boolean'];
  ignoreQueryParams: Scalars['Boolean'];
}>;


export type EditWebsiteScrapingInfoMutation = { __typename?: 'Mutation', editWebsiteScrapingInfo: { __typename?: 'WebsiteScrapingInfo', id: string, baseUrl: string, scrapingStartUrl: string, ignoreHashInUrl: boolean, ignoreQueryParams: boolean, createdAt: any, updatedAt: any } };

export type TriggerSiteScrapingRunMutationVariables = Exact<{
  spaceId: Scalars['String'];
  websiteScrapingInfoId: Scalars['String'];
}>;


export type TriggerSiteScrapingRunMutation = { __typename?: 'Mutation', triggerSiteScrapingRun: { __typename?: 'SiteScrapingRun', id: string, websiteScrapingInfoId: string, scrapingRunDate: any, status: string, createdAt: any, updatedAt: any } };

export type CreateArticleIndexingInfoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  articleUrl: Scalars['String'];
}>;


export type CreateArticleIndexingInfoMutation = { __typename?: 'Mutation', createArticleIndexingInfo: { __typename?: 'ArticleIndexingInfo', id: string, spaceId: string, articleUrl: string, createdAt: any, updatedAt: any, status: string, text?: string | null, textLength?: number | null } };

export type EditArticleIndexingInfoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  articleIndexingInfoId: Scalars['String'];
  articleUrl: Scalars['String'];
}>;


export type EditArticleIndexingInfoMutation = { __typename?: 'Mutation', editArticleIndexingInfo: { __typename?: 'ArticleIndexingInfo', id: string, spaceId: string, articleUrl: string, createdAt: any, updatedAt: any, status: string, text?: string | null, textLength?: number | null } };

export type AnnotateDiscoursePostMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: AnnotateDiscoursePostInput;
}>;


export type AnnotateDiscoursePostMutation = { __typename?: 'Mutation', annotateDiscoursePost: { __typename?: 'DiscoursePost', id: string, spaceId: string, title: string, url: string, fullContent?: string | null, author?: string | null, datePublished: any, createdAt: any, indexedAt?: any | null, status: string, enacted?: boolean | null, discussed?: boolean | null, aiSummary?: string | null, aiSummaryDate?: any | null } };

export type UpsertSummaryOfDiscoursePostMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertSummaryOfDiscoursePostInput;
}>;


export type UpsertSummaryOfDiscoursePostMutation = { __typename?: 'Mutation', upsertSummaryOfDiscoursePost: { __typename?: 'DiscoursePost', id: string, spaceId: string, title: string, url: string, fullContent?: string | null, author?: string | null, datePublished: any, createdAt: any, indexedAt?: any | null, status: string, enacted?: boolean | null, discussed?: boolean | null, aiSummary?: string | null, aiSummaryDate?: any | null } };

export type GuideSettingsFragment = { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null };

export type AuthSettingsFragment = { __typename?: 'AuthSettings', enableLogin?: boolean | null, loginOptions?: Array<string> | null };

export type SocialSettingsFragment = { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null };

export type SpaceWithIntegrationsFragment = { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null };

export type SpaceSummaryFragment = { __typename?: 'Space', id: string, admins: Array<string>, adminUsernames: Array<string>, avatar?: string | null, creator: string, name: string, skin: string, domains: Array<string> };

export type SpacesQueryVariables = Exact<{ [key: string]: never; }>;


export type SpacesQuery = { __typename?: 'Query', spaces?: Array<{ __typename?: 'Space', id: string, admins: Array<string>, adminUsernames: Array<string>, avatar?: string | null, creator: string, name: string, skin: string, domains: Array<string> }> | null };

export type ExtendedSpaceQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ExtendedSpaceQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } | null };

export type ExtendedSpaceByDomainQueryVariables = Exact<{
  domain: Scalars['String'];
}>;


export type ExtendedSpaceByDomainQuery = { __typename?: 'Query', space?: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } | null };

export type SpaceDiscordGuildQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type SpaceDiscordGuildQuery = { __typename?: 'Query', payload?: any | null };

export type UpsertSpaceFeaturesMutationVariables = Exact<{
  spaceId: Scalars['String'];
  features: Array<Scalars['String']> | Scalars['String'];
}>;


export type UpsertSpaceFeaturesMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type DropPineconeNamespaceMutationVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type DropPineconeNamespaceMutation = { __typename?: 'Mutation', dropPineconeNamespace: boolean };

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

export type UpsertSpaceAcademyRepositoryMutationVariables = Exact<{
  spaceId: Scalars['String'];
  academyRepository: Scalars['String'];
}>;


export type UpsertSpaceAcademyRepositoryMutation = { __typename?: 'Mutation', upsertSpaceAcademyRepository: { __typename?: 'Space', id: string } };

export type UpdateSpaceMutationVariables = Exact<{
  spaceInput: UpsertSpaceInput;
}>;


export type UpdateSpaceMutation = { __typename?: 'Mutation', updateSpace: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type CreateSpaceMutationVariables = Exact<{
  spaceInput: UpsertSpaceInput;
}>;


export type CreateSpaceMutation = { __typename?: 'Mutation', createSpace: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type ReloadAcademyRepoMutationVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type ReloadAcademyRepoMutation = { __typename?: 'Mutation', reloadAcademyRepository: boolean };

export type UpdateSpaceGuideSettingsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: GuideSettingsInput;
}>;


export type UpdateSpaceGuideSettingsMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type UpdateSpaceAuthSettingsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: AuthSettingsInput;
}>;


export type UpdateSpaceAuthSettingsMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type UpdateSpaceSocialSettingsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: SocialSettingsInput;
}>;


export type UpdateSpaceSocialSettingsMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type UpdateSpaceByteSettingsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: ByteSettingsInput;
}>;


export type UpdateSpaceByteSettingsMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type SendEmailMutationVariables = Exact<{
  input: SendEmailInput;
}>;


export type SendEmailMutation = { __typename?: 'Mutation', payload: boolean };

export type UpsertSpaceLoaderInfoMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: SpaceLoadersInfoInput;
}>;


export type UpsertSpaceLoaderInfoMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type UpdateThemeColorsMutationVariables = Exact<{
  spaceId: Scalars['ID'];
  themeColors: ThemeColorsInput;
}>;


export type UpdateThemeColorsMutation = { __typename?: 'Mutation', payload: { __typename?: 'Space', id: string, creator: string, features: Array<string>, name: string, skin: string, avatar?: string | null, domains: Array<string>, botDomains?: Array<string> | null, admins: Array<string>, adminUsernames: Array<string>, inviteLinks?: { __typename?: 'SpaceInviteLinks', discordInviteLink?: string | null, showAnimatedButtonForDiscord?: boolean | null, telegramInviteLink?: string | null, showAnimatedButtonForTelegram?: boolean | null } | null, adminUsernamesV1: Array<{ __typename?: 'UsernameAndName', username: string, nameOfTheUser: string }>, spaceIntegrations?: { __typename?: 'SpaceIntegrations', academyRepository?: string | null, discordGuildId?: string | null, projectGalaxyTokenLastFour?: string | null, gitGuideRepositories?: Array<{ __typename?: 'SpaceGitRepository', authenticationToken?: string | null, gitRepoType?: string | null, repoUrl: string }> | null, gnosisSafeWallets?: Array<{ __typename?: 'GnosisSafeWallet', id: string, chainId: number, order: number, tokenContractAddress: string, walletAddress: string, walletName: string }> | null, loadersInfo?: { __typename?: 'SpaceLoadersInfo', discourseUrl?: string | null, discordServerId?: string | null } | null } | null, authSettings: { __typename?: 'AuthSettings', loginOptions?: Array<string> | null, enableLogin?: boolean | null }, socialSettings: { __typename?: 'SocialSettings', linkedSharePdfBackgroundImage?: string | null }, guideSettings: { __typename?: 'GuideSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null, showIncorrectAfterEachStep?: boolean | null, showIncorrectOnCompletion?: boolean | null }, byteSettings: { __typename?: 'ByteSettings', askForLoginToSubmit?: boolean | null, captureRating?: boolean | null, showCategoriesInSidebar?: boolean | null }, themeColors?: { __typename?: 'ThemeColors', primaryColor: string, bgColor: string, textColor: string, linkColor: string, headingColor: string, borderColor: string, blockBg: string } | null } };

export type TimelineEventFragment = { __typename?: 'TimelineEvent', title: string, uuid: string, date: any, summary: string, fullDetails?: string | null, moreLink?: string | null };

export type TimelineDetailsFragment = { __typename?: 'Timeline', id: string, name: string, excerpt: string, content: string, thumbnail?: string | null, created: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, timelineStyle?: string | null, events: Array<{ __typename?: 'TimelineEvent', title: string, uuid: string, date: any, summary: string, fullDetails?: string | null, moreLink?: string | null }> };

export type TimelinesQueryVariables = Exact<{
  spaceId: Scalars['String'];
}>;


export type TimelinesQuery = { __typename?: 'Query', timelines: Array<{ __typename?: 'Timeline', id: string, name: string, excerpt: string, content: string, thumbnail?: string | null, created: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number }> };

export type TimelineDetailsQueryVariables = Exact<{
  spaceId: Scalars['String'];
  timelineId: Scalars['String'];
}>;


export type TimelineDetailsQuery = { __typename?: 'Query', timeline: { __typename?: 'Timeline', id: string, name: string, excerpt: string, content: string, thumbnail?: string | null, created: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, timelineStyle?: string | null, events: Array<{ __typename?: 'TimelineEvent', title: string, uuid: string, date: any, summary: string, fullDetails?: string | null, moreLink?: string | null }> } };

export type UpsertTimelineMutationVariables = Exact<{
  spaceId: Scalars['String'];
  input: UpsertTimelineInput;
}>;


export type UpsertTimelineMutation = { __typename?: 'Mutation', upsertTimeline: { __typename?: 'Timeline', id: string, name: string, excerpt: string, content: string, thumbnail?: string | null, created: string, publishStatus: string, admins: Array<string>, tags: Array<string>, priority: number, timelineStyle?: string | null, events: Array<{ __typename?: 'TimelineEvent', title: string, uuid: string, date: any, summary: string, fullDetails?: string | null, moreLink?: string | null }> } };

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
export const ByteCollectionFragmentDoc = gql`
    fragment ByteCollection on ByteCollection {
  id
  name
  description
  status
  byteIds
  order
  bytes {
    byteId
    name
    content
  }
}
    `;
export const ByteLinkedinPdfContentStepFragmentDoc = gql`
    fragment ByteLinkedinPdfContentStep on ByteLinkedinPdfContentStep {
  content
  name
}
    `;
export const ByteLinkedinPdfContentFragmentDoc = gql`
    fragment ByteLinkedinPdfContent on ByteLinkedinPdfContent {
  excerpt
  steps {
    ...ByteLinkedinPdfContentStep
  }
  title
}
    ${ByteLinkedinPdfContentStepFragmentDoc}`;
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
export const ByteSummaryFragmentDoc = gql`
    fragment ByteSummary on Byte {
  content
  created
  id
  name
  admins
  tags
  priority
}
    `;
export const ChatbotSubCategoryFragmentDoc = gql`
    fragment ChatbotSubCategory on ChatbotSubcategory {
  name
  key
  description
}
    `;
export const ChatbotCategoryFragmentDoc = gql`
    fragment ChatbotCategory on ChatbotCategory {
  id
  priority
  description
  key
  name
  subCategories {
    name
    key
    description
  }
}
    `;
export const ChatbotFaqFragmentDoc = gql`
    fragment ChatbotFAQ on ChatbotFAQ {
  id
  spaceId
  question
  answer
  priority
  url
}
    `;
export const SearchedChatbotFaqFragmentFragmentDoc = gql`
    fragment SearchedChatbotFAQFragment on SearchedChatbotFAQ {
  id
  spaceId
  question
  answer
  priority
  url
  score
}
    `;
export const ChatbotUserQuestionFragmentDoc = gql`
    fragment ChatbotUserQuestion on ChatbotUserQuestion {
  id
  spaceId
  question
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
export const GuideRatingFragmentDoc = gql`
    fragment GuideRating on GuideRating {
  ratingUuid
  createdAt
  endRating
  guideUuid
  ipAddress
  negativeFeedback {
    content
    questions
    ux
  }
  positiveFeedback {
    ux
    questions
    content
  }
  ratingUuid
  skipEndRating
  skipStartRating
  spaceId
  startRating
  updatedAt
  userId
  username
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
  explanation
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
    explanation
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
      explanation
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
  categories
  createdAt
  id
  guideIntegrations {
    ...GuideIntegration
  }
  guideSource
  guideType
  name
  steps {
    ...GuideStep
  }
  publishStatus
  priority
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
  createdAt
  guideSource
  guideType
  publishStatus
  thumbnail
  uuid
  priority
}
    `;
export const ProjectFragmentDoc = gql`
    fragment Project on Project {
  adminUsernames
  adminUsernamesV1 {
    username
    nameOfTheUser
  }
  admins
  creator
  details
  discord
  docs
  github
  id
  logo
  name
  telegram
  website
  type
  cardThumbnail
  archive
}
    `;
export const ProjectByteFragmentDoc = gql`
    fragment ProjectByte on ProjectByte {
  admins
  content
  created
  id
  name
  postSubmissionStepContent
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
  tags
  archive
}
    `;
export const ProjectShortVideoFragmentDoc = gql`
    fragment ProjectShortVideo on ProjectShortVideo {
  id
  title
  description
  thumbnail
  videoUrl
  priority
  createdAt
  updatedAt
  archive
}
    `;
export const ProjectByteCollectionFragmentDoc = gql`
    fragment ProjectByteCollection on ProjectByteCollection {
  byteIds
  bytes {
    byteId
    name
    content
  }
  description
  id
  name
  order
  status
  archive
}
    `;
export const ShortVideoFragmentDoc = gql`
    fragment ShortVideo on ShortVideo {
  id
  title
  description
  thumbnail
  videoUrl
  priority
  createdAt
  updatedAt
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
export const DiscourseIndexRunFragmentFragmentDoc = gql`
    fragment DiscourseIndexRunFragment on DiscourseIndexRun {
  createdAt
  id
  runDate
  status
}
    `;
export const DiscordServerFragmentFragmentDoc = gql`
    fragment DiscordServerFragment on DiscordServer {
  createdAt
  discordServerId
  iconUrl
  id
  name
  updatedAt
}
    `;
export const DiscordChannelFragmentFragmentDoc = gql`
    fragment DiscordChannelFragment on DiscordChannel {
  id
  name
  type
  status
  discordChannelId
  shouldIndex
  createdAt
  serverId
  updatedAt
}
    `;
export const DiscordMessageFragmentFragmentDoc = gql`
    fragment DiscordMessageFragment on DiscordMessage {
  id
  content
  discordMessageId
  createdAt
  updatedAt
  serverId
  channelId
  messageDate
  authorUsername
}
    `;
export const WebsiteScrapingInfoFragmentDoc = gql`
    fragment WebsiteScrapingInfo on WebsiteScrapingInfo {
  id
  baseUrl
  scrapingStartUrl
  ignoreHashInUrl
  ignoreQueryParams
  createdAt
  updatedAt
}
    `;
export const ArticleIndexingInfoFragmentDoc = gql`
    fragment ArticleIndexingInfo on ArticleIndexingInfo {
  id
  spaceId
  articleUrl
  createdAt
  updatedAt
  status
  text
  textLength
}
    `;
export const SiteScrapingRunFragmentFragmentDoc = gql`
    fragment SiteScrapingRunFragment on SiteScrapingRun {
  id
  websiteScrapingInfoId
  scrapingRunDate
  status
  createdAt
  updatedAt
}
    `;
export const ScrapedUrlInfoFragmentFragmentDoc = gql`
    fragment ScrapedUrlInfoFragment on ScrapedUrlInfo {
  id
  websiteScrapingInfoId
  url
  text
  textLength
  createdAt
  updatedAt
}
    `;
export const DiscoursePostFragmentDoc = gql`
    fragment DiscoursePost on DiscoursePost {
  id
  spaceId
  title
  url
  fullContent
  author
  datePublished
  createdAt
  indexedAt
  status
  enacted
  discussed
  aiSummary
  aiSummaryDate
}
    `;
export const GuideSettingsFragmentDoc = gql`
    fragment GuideSettings on GuideSettings {
  askForLoginToSubmit
  captureRating
  showIncorrectAfterEachStep
  showIncorrectOnCompletion
}
    `;
export const AuthSettingsFragmentDoc = gql`
    fragment AuthSettings on AuthSettings {
  enableLogin
  loginOptions
}
    `;
export const SocialSettingsFragmentDoc = gql`
    fragment SocialSettings on SocialSettings {
  linkedSharePdfBackgroundImage
}
    `;
export const SpaceWithIntegrationsFragmentDoc = gql`
    fragment SpaceWithIntegrations on Space {
  id
  creator
  features
  name
  skin
  avatar
  domains
  botDomains
  inviteLinks {
    discordInviteLink
    showAnimatedButtonForDiscord
    telegramInviteLink
    showAnimatedButtonForTelegram
  }
  admins
  adminUsernames
  adminUsernamesV1 {
    username
    nameOfTheUser
  }
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
    loadersInfo {
      discourseUrl
      discordServerId
    }
  }
  authSettings {
    loginOptions
    enableLogin
  }
  socialSettings {
    linkedSharePdfBackgroundImage
  }
  guideSettings {
    askForLoginToSubmit
    captureRating
    showCategoriesInSidebar
    showIncorrectAfterEachStep
    showIncorrectOnCompletion
  }
  byteSettings {
    askForLoginToSubmit
    captureRating
    showCategoriesInSidebar
  }
  themeColors {
    primaryColor
    bgColor
    textColor
    linkColor
    headingColor
    borderColor
    blockBg
  }
}
    `;
export const SpaceSummaryFragmentDoc = gql`
    fragment SpaceSummary on Space {
  id
  admins
  adminUsernames
  avatar
  creator
  name
  skin
  domains
}
    `;
export const TimelineEventFragmentDoc = gql`
    fragment TimelineEvent on TimelineEvent {
  title
  uuid
  date
  summary
  fullDetails
  moreLink
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
    title
    uuid
    date
    summary
    fullDetails
    moreLink
  }
  timelineStyle
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
export const ByteCollectionsDocument = gql`
    query ByteCollections($spaceId: String!) {
  byteCollections(spaceId: $spaceId) {
    ...ByteCollection
  }
}
    ${ByteCollectionFragmentDoc}`;

/**
 * __useByteCollectionsQuery__
 *
 * To run a query within a React component, call `useByteCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useByteCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useByteCollectionsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useByteCollectionsQuery(baseOptions: Apollo.QueryHookOptions<ByteCollectionsQuery, ByteCollectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ByteCollectionsQuery, ByteCollectionsQueryVariables>(ByteCollectionsDocument, options);
      }
export function useByteCollectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ByteCollectionsQuery, ByteCollectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ByteCollectionsQuery, ByteCollectionsQueryVariables>(ByteCollectionsDocument, options);
        }
export type ByteCollectionsQueryHookResult = ReturnType<typeof useByteCollectionsQuery>;
export type ByteCollectionsLazyQueryHookResult = ReturnType<typeof useByteCollectionsLazyQuery>;
export type ByteCollectionsQueryResult = Apollo.QueryResult<ByteCollectionsQuery, ByteCollectionsQueryVariables>;
export function refetchByteCollectionsQuery(variables: ByteCollectionsQueryVariables) {
      return { query: ByteCollectionsDocument, variables: variables }
    }
export const ByteCollectionDocument = gql`
    query ByteCollection($spaceId: String!, $byteCollectionId: String!) {
  byteCollection(spaceId: $spaceId, byteCollectionId: $byteCollectionId) {
    ...ByteCollection
  }
}
    ${ByteCollectionFragmentDoc}`;

/**
 * __useByteCollectionQuery__
 *
 * To run a query within a React component, call `useByteCollectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useByteCollectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useByteCollectionQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      byteCollectionId: // value for 'byteCollectionId'
 *   },
 * });
 */
export function useByteCollectionQuery(baseOptions: Apollo.QueryHookOptions<ByteCollectionQuery, ByteCollectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ByteCollectionQuery, ByteCollectionQueryVariables>(ByteCollectionDocument, options);
      }
export function useByteCollectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ByteCollectionQuery, ByteCollectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ByteCollectionQuery, ByteCollectionQueryVariables>(ByteCollectionDocument, options);
        }
export type ByteCollectionQueryHookResult = ReturnType<typeof useByteCollectionQuery>;
export type ByteCollectionLazyQueryHookResult = ReturnType<typeof useByteCollectionLazyQuery>;
export type ByteCollectionQueryResult = Apollo.QueryResult<ByteCollectionQuery, ByteCollectionQueryVariables>;
export function refetchByteCollectionQuery(variables: ByteCollectionQueryVariables) {
      return { query: ByteCollectionDocument, variables: variables }
    }
export const CreateByteCollectionDocument = gql`
    mutation CreateByteCollection($input: CreateByteCollectionInput!) {
  createByteCollection(input: $input) {
    ...ByteCollection
  }
}
    ${ByteCollectionFragmentDoc}`;
export type CreateByteCollectionMutationFn = Apollo.MutationFunction<CreateByteCollectionMutation, CreateByteCollectionMutationVariables>;

/**
 * __useCreateByteCollectionMutation__
 *
 * To run a mutation, you first call `useCreateByteCollectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateByteCollectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createByteCollectionMutation, { data, loading, error }] = useCreateByteCollectionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateByteCollectionMutation(baseOptions?: Apollo.MutationHookOptions<CreateByteCollectionMutation, CreateByteCollectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateByteCollectionMutation, CreateByteCollectionMutationVariables>(CreateByteCollectionDocument, options);
      }
export type CreateByteCollectionMutationHookResult = ReturnType<typeof useCreateByteCollectionMutation>;
export type CreateByteCollectionMutationResult = Apollo.MutationResult<CreateByteCollectionMutation>;
export type CreateByteCollectionMutationOptions = Apollo.BaseMutationOptions<CreateByteCollectionMutation, CreateByteCollectionMutationVariables>;
export const UpdateByteCollectionDocument = gql`
    mutation UpdateByteCollection($input: UpdateByteCollectionInput!) {
  updateByteCollection(input: $input) {
    ...ByteCollection
  }
}
    ${ByteCollectionFragmentDoc}`;
export type UpdateByteCollectionMutationFn = Apollo.MutationFunction<UpdateByteCollectionMutation, UpdateByteCollectionMutationVariables>;

/**
 * __useUpdateByteCollectionMutation__
 *
 * To run a mutation, you first call `useUpdateByteCollectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateByteCollectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateByteCollectionMutation, { data, loading, error }] = useUpdateByteCollectionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateByteCollectionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateByteCollectionMutation, UpdateByteCollectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateByteCollectionMutation, UpdateByteCollectionMutationVariables>(UpdateByteCollectionDocument, options);
      }
export type UpdateByteCollectionMutationHookResult = ReturnType<typeof useUpdateByteCollectionMutation>;
export type UpdateByteCollectionMutationResult = Apollo.MutationResult<UpdateByteCollectionMutation>;
export type UpdateByteCollectionMutationOptions = Apollo.BaseMutationOptions<UpdateByteCollectionMutation, UpdateByteCollectionMutationVariables>;
export const DeleteByteCollectionDocument = gql`
    mutation DeleteByteCollection($byteCollectionId: String!) {
  deleteByteCollection(byteCollectionId: $byteCollectionId)
}
    `;
export type DeleteByteCollectionMutationFn = Apollo.MutationFunction<DeleteByteCollectionMutation, DeleteByteCollectionMutationVariables>;

/**
 * __useDeleteByteCollectionMutation__
 *
 * To run a mutation, you first call `useDeleteByteCollectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteByteCollectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteByteCollectionMutation, { data, loading, error }] = useDeleteByteCollectionMutation({
 *   variables: {
 *      byteCollectionId: // value for 'byteCollectionId'
 *   },
 * });
 */
export function useDeleteByteCollectionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteByteCollectionMutation, DeleteByteCollectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteByteCollectionMutation, DeleteByteCollectionMutationVariables>(DeleteByteCollectionDocument, options);
      }
export type DeleteByteCollectionMutationHookResult = ReturnType<typeof useDeleteByteCollectionMutation>;
export type DeleteByteCollectionMutationResult = Apollo.MutationResult<DeleteByteCollectionMutation>;
export type DeleteByteCollectionMutationOptions = Apollo.BaseMutationOptions<DeleteByteCollectionMutation, DeleteByteCollectionMutationVariables>;
export const ByteSocialShareDocument = gql`
    query ByteSocialShare($spaceId: String!, $byteId: String!) {
  byteSocialShare(spaceId: $spaceId, byteId: $byteId) {
    byteId
    linkedInImages
    linkedInPdf
    linkedinPdfContent {
      excerpt
      steps {
        content
        name
      }
      title
    }
    spaceId
    twitterImage
    uuid
  }
}
    `;

/**
 * __useByteSocialShareQuery__
 *
 * To run a query within a React component, call `useByteSocialShareQuery` and pass it any options that fit your needs.
 * When your component renders, `useByteSocialShareQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useByteSocialShareQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      byteId: // value for 'byteId'
 *   },
 * });
 */
export function useByteSocialShareQuery(baseOptions: Apollo.QueryHookOptions<ByteSocialShareQuery, ByteSocialShareQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ByteSocialShareQuery, ByteSocialShareQueryVariables>(ByteSocialShareDocument, options);
      }
export function useByteSocialShareLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ByteSocialShareQuery, ByteSocialShareQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ByteSocialShareQuery, ByteSocialShareQueryVariables>(ByteSocialShareDocument, options);
        }
export type ByteSocialShareQueryHookResult = ReturnType<typeof useByteSocialShareQuery>;
export type ByteSocialShareLazyQueryHookResult = ReturnType<typeof useByteSocialShareLazyQuery>;
export type ByteSocialShareQueryResult = Apollo.QueryResult<ByteSocialShareQuery, ByteSocialShareQueryVariables>;
export function refetchByteSocialShareQuery(variables: ByteSocialShareQueryVariables) {
      return { query: ByteSocialShareDocument, variables: variables }
    }
export const GenerateSharablePdfForByteDocument = gql`
    mutation GenerateSharablePdfForByte($spaceId: String!, $byteId: String!) {
  payload: generateSharablePdf(byteId: $byteId, spaceId: $spaceId)
}
    `;
export type GenerateSharablePdfForByteMutationFn = Apollo.MutationFunction<GenerateSharablePdfForByteMutation, GenerateSharablePdfForByteMutationVariables>;

/**
 * __useGenerateSharablePdfForByteMutation__
 *
 * To run a mutation, you first call `useGenerateSharablePdfForByteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateSharablePdfForByteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateSharablePdfForByteMutation, { data, loading, error }] = useGenerateSharablePdfForByteMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      byteId: // value for 'byteId'
 *   },
 * });
 */
export function useGenerateSharablePdfForByteMutation(baseOptions?: Apollo.MutationHookOptions<GenerateSharablePdfForByteMutation, GenerateSharablePdfForByteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateSharablePdfForByteMutation, GenerateSharablePdfForByteMutationVariables>(GenerateSharablePdfForByteDocument, options);
      }
export type GenerateSharablePdfForByteMutationHookResult = ReturnType<typeof useGenerateSharablePdfForByteMutation>;
export type GenerateSharablePdfForByteMutationResult = Apollo.MutationResult<GenerateSharablePdfForByteMutation>;
export type GenerateSharablePdfForByteMutationOptions = Apollo.BaseMutationOptions<GenerateSharablePdfForByteMutation, GenerateSharablePdfForByteMutationVariables>;
export const UpsertByteSocialShareDocument = gql`
    mutation UpsertByteSocialShare($spaceId: String!, $input: UpsertByteSocialShareInput!) {
  payload: upsertByteSocialShare(spaceId: $spaceId, input: $input) {
    byteId
    linkedInImages
    linkedInPdf
    linkedinPdfContent {
      excerpt
      steps {
        content
        name
      }
      title
    }
    spaceId
    twitterImage
    uuid
  }
}
    `;
export type UpsertByteSocialShareMutationFn = Apollo.MutationFunction<UpsertByteSocialShareMutation, UpsertByteSocialShareMutationVariables>;

/**
 * __useUpsertByteSocialShareMutation__
 *
 * To run a mutation, you first call `useUpsertByteSocialShareMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertByteSocialShareMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertByteSocialShareMutation, { data, loading, error }] = useUpsertByteSocialShareMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertByteSocialShareMutation(baseOptions?: Apollo.MutationHookOptions<UpsertByteSocialShareMutation, UpsertByteSocialShareMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertByteSocialShareMutation, UpsertByteSocialShareMutationVariables>(UpsertByteSocialShareDocument, options);
      }
export type UpsertByteSocialShareMutationHookResult = ReturnType<typeof useUpsertByteSocialShareMutation>;
export type UpsertByteSocialShareMutationResult = Apollo.MutationResult<UpsertByteSocialShareMutation>;
export type UpsertByteSocialShareMutationOptions = Apollo.BaseMutationOptions<UpsertByteSocialShareMutation, UpsertByteSocialShareMutationVariables>;
export const QueryBytesDocument = gql`
    query QueryBytes($spaceId: String!) {
  bytes(spaceId: $spaceId) {
    ...ByteSummary
  }
}
    ${ByteSummaryFragmentDoc}`;

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
export const ChatbotCategoriesDocument = gql`
    query ChatbotCategories($spaceId: String!) {
  chatbotCategories(spaceId: $spaceId) {
    ...ChatbotCategory
  }
}
    ${ChatbotCategoryFragmentDoc}`;

/**
 * __useChatbotCategoriesQuery__
 *
 * To run a query within a React component, call `useChatbotCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChatbotCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatbotCategoriesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useChatbotCategoriesQuery(baseOptions: Apollo.QueryHookOptions<ChatbotCategoriesQuery, ChatbotCategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ChatbotCategoriesQuery, ChatbotCategoriesQueryVariables>(ChatbotCategoriesDocument, options);
      }
export function useChatbotCategoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ChatbotCategoriesQuery, ChatbotCategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ChatbotCategoriesQuery, ChatbotCategoriesQueryVariables>(ChatbotCategoriesDocument, options);
        }
export type ChatbotCategoriesQueryHookResult = ReturnType<typeof useChatbotCategoriesQuery>;
export type ChatbotCategoriesLazyQueryHookResult = ReturnType<typeof useChatbotCategoriesLazyQuery>;
export type ChatbotCategoriesQueryResult = Apollo.QueryResult<ChatbotCategoriesQuery, ChatbotCategoriesQueryVariables>;
export function refetchChatbotCategoriesQuery(variables: ChatbotCategoriesQueryVariables) {
      return { query: ChatbotCategoriesDocument, variables: variables }
    }
export const ChatbotFaQsDocument = gql`
    query ChatbotFAQs($spaceId: String!) {
  chatbotFAQs(spaceId: $spaceId) {
    ...ChatbotFAQ
  }
}
    ${ChatbotFaqFragmentDoc}`;

/**
 * __useChatbotFaQsQuery__
 *
 * To run a query within a React component, call `useChatbotFaQsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChatbotFaQsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatbotFaQsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useChatbotFaQsQuery(baseOptions: Apollo.QueryHookOptions<ChatbotFaQsQuery, ChatbotFaQsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ChatbotFaQsQuery, ChatbotFaQsQueryVariables>(ChatbotFaQsDocument, options);
      }
export function useChatbotFaQsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ChatbotFaQsQuery, ChatbotFaQsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ChatbotFaQsQuery, ChatbotFaQsQueryVariables>(ChatbotFaQsDocument, options);
        }
export type ChatbotFaQsQueryHookResult = ReturnType<typeof useChatbotFaQsQuery>;
export type ChatbotFaQsLazyQueryHookResult = ReturnType<typeof useChatbotFaQsLazyQuery>;
export type ChatbotFaQsQueryResult = Apollo.QueryResult<ChatbotFaQsQuery, ChatbotFaQsQueryVariables>;
export function refetchChatbotFaQsQuery(variables: ChatbotFaQsQueryVariables) {
      return { query: ChatbotFaQsDocument, variables: variables }
    }
export const SearchChatbotFaQsDocument = gql`
    query SearchChatbotFAQs($spaceId: String!, $query: String!) {
  searchChatbotFAQs(spaceId: $spaceId, query: $query) {
    ...SearchedChatbotFAQFragment
  }
}
    ${SearchedChatbotFaqFragmentFragmentDoc}`;

/**
 * __useSearchChatbotFaQsQuery__
 *
 * To run a query within a React component, call `useSearchChatbotFaQsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchChatbotFaQsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchChatbotFaQsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useSearchChatbotFaQsQuery(baseOptions: Apollo.QueryHookOptions<SearchChatbotFaQsQuery, SearchChatbotFaQsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchChatbotFaQsQuery, SearchChatbotFaQsQueryVariables>(SearchChatbotFaQsDocument, options);
      }
export function useSearchChatbotFaQsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchChatbotFaQsQuery, SearchChatbotFaQsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchChatbotFaQsQuery, SearchChatbotFaQsQueryVariables>(SearchChatbotFaQsDocument, options);
        }
export type SearchChatbotFaQsQueryHookResult = ReturnType<typeof useSearchChatbotFaQsQuery>;
export type SearchChatbotFaQsLazyQueryHookResult = ReturnType<typeof useSearchChatbotFaQsLazyQuery>;
export type SearchChatbotFaQsQueryResult = Apollo.QueryResult<SearchChatbotFaQsQuery, SearchChatbotFaQsQueryVariables>;
export function refetchSearchChatbotFaQsQuery(variables: SearchChatbotFaQsQueryVariables) {
      return { query: SearchChatbotFaQsDocument, variables: variables }
    }
export const ChatbotUserQuestionsDocument = gql`
    query ChatbotUserQuestions($spaceId: String!) {
  chatbotUserQuestions(spaceId: $spaceId) {
    ...ChatbotUserQuestion
  }
}
    ${ChatbotUserQuestionFragmentDoc}`;

/**
 * __useChatbotUserQuestionsQuery__
 *
 * To run a query within a React component, call `useChatbotUserQuestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChatbotUserQuestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatbotUserQuestionsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useChatbotUserQuestionsQuery(baseOptions: Apollo.QueryHookOptions<ChatbotUserQuestionsQuery, ChatbotUserQuestionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ChatbotUserQuestionsQuery, ChatbotUserQuestionsQueryVariables>(ChatbotUserQuestionsDocument, options);
      }
export function useChatbotUserQuestionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ChatbotUserQuestionsQuery, ChatbotUserQuestionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ChatbotUserQuestionsQuery, ChatbotUserQuestionsQueryVariables>(ChatbotUserQuestionsDocument, options);
        }
export type ChatbotUserQuestionsQueryHookResult = ReturnType<typeof useChatbotUserQuestionsQuery>;
export type ChatbotUserQuestionsLazyQueryHookResult = ReturnType<typeof useChatbotUserQuestionsLazyQuery>;
export type ChatbotUserQuestionsQueryResult = Apollo.QueryResult<ChatbotUserQuestionsQuery, ChatbotUserQuestionsQueryVariables>;
export function refetchChatbotUserQuestionsQuery(variables: ChatbotUserQuestionsQueryVariables) {
      return { query: ChatbotUserQuestionsDocument, variables: variables }
    }
export const UpsertChatbotCategoryDocument = gql`
    mutation UpsertChatbotCategory($spaceId: String!, $input: UpsertChatbotCategoryInput!) {
  upsertChatbotCategory(spaceId: $spaceId, input: $input) {
    ...ChatbotCategory
  }
}
    ${ChatbotCategoryFragmentDoc}`;
export type UpsertChatbotCategoryMutationFn = Apollo.MutationFunction<UpsertChatbotCategoryMutation, UpsertChatbotCategoryMutationVariables>;

/**
 * __useUpsertChatbotCategoryMutation__
 *
 * To run a mutation, you first call `useUpsertChatbotCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertChatbotCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertChatbotCategoryMutation, { data, loading, error }] = useUpsertChatbotCategoryMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertChatbotCategoryMutation(baseOptions?: Apollo.MutationHookOptions<UpsertChatbotCategoryMutation, UpsertChatbotCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertChatbotCategoryMutation, UpsertChatbotCategoryMutationVariables>(UpsertChatbotCategoryDocument, options);
      }
export type UpsertChatbotCategoryMutationHookResult = ReturnType<typeof useUpsertChatbotCategoryMutation>;
export type UpsertChatbotCategoryMutationResult = Apollo.MutationResult<UpsertChatbotCategoryMutation>;
export type UpsertChatbotCategoryMutationOptions = Apollo.BaseMutationOptions<UpsertChatbotCategoryMutation, UpsertChatbotCategoryMutationVariables>;
export const UpsertChatbotFaqDocument = gql`
    mutation UpsertChatbotFAQ($spaceId: String!, $input: UpsertChatbotFAQInput!) {
  upsertChatbotFAQ(spaceId: $spaceId, input: $input) {
    ...ChatbotFAQ
  }
}
    ${ChatbotFaqFragmentDoc}`;
export type UpsertChatbotFaqMutationFn = Apollo.MutationFunction<UpsertChatbotFaqMutation, UpsertChatbotFaqMutationVariables>;

/**
 * __useUpsertChatbotFaqMutation__
 *
 * To run a mutation, you first call `useUpsertChatbotFaqMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertChatbotFaqMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertChatbotFaqMutation, { data, loading, error }] = useUpsertChatbotFaqMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertChatbotFaqMutation(baseOptions?: Apollo.MutationHookOptions<UpsertChatbotFaqMutation, UpsertChatbotFaqMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertChatbotFaqMutation, UpsertChatbotFaqMutationVariables>(UpsertChatbotFaqDocument, options);
      }
export type UpsertChatbotFaqMutationHookResult = ReturnType<typeof useUpsertChatbotFaqMutation>;
export type UpsertChatbotFaqMutationResult = Apollo.MutationResult<UpsertChatbotFaqMutation>;
export type UpsertChatbotFaqMutationOptions = Apollo.BaseMutationOptions<UpsertChatbotFaqMutation, UpsertChatbotFaqMutationVariables>;
export const IndexChatbotFaQsDocument = gql`
    mutation IndexChatbotFAQs($spaceId: String!) {
  indexChatbotFAQs(spaceId: $spaceId)
}
    `;
export type IndexChatbotFaQsMutationFn = Apollo.MutationFunction<IndexChatbotFaQsMutation, IndexChatbotFaQsMutationVariables>;

/**
 * __useIndexChatbotFaQsMutation__
 *
 * To run a mutation, you first call `useIndexChatbotFaQsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIndexChatbotFaQsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [indexChatbotFaQsMutation, { data, loading, error }] = useIndexChatbotFaQsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useIndexChatbotFaQsMutation(baseOptions?: Apollo.MutationHookOptions<IndexChatbotFaQsMutation, IndexChatbotFaQsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<IndexChatbotFaQsMutation, IndexChatbotFaQsMutationVariables>(IndexChatbotFaQsDocument, options);
      }
export type IndexChatbotFaQsMutationHookResult = ReturnType<typeof useIndexChatbotFaQsMutation>;
export type IndexChatbotFaQsMutationResult = Apollo.MutationResult<IndexChatbotFaQsMutation>;
export type IndexChatbotFaQsMutationOptions = Apollo.BaseMutationOptions<IndexChatbotFaQsMutation, IndexChatbotFaQsMutationVariables>;
export const UpsertChatbotUserQuestionDocument = gql`
    mutation UpsertChatbotUserQuestion($spaceId: String!, $input: UpsertChatbotUserQuestionInput!) {
  upsertChatbotUserQuestion(spaceId: $spaceId, input: $input) {
    ...ChatbotUserQuestion
  }
}
    ${ChatbotUserQuestionFragmentDoc}`;
export type UpsertChatbotUserQuestionMutationFn = Apollo.MutationFunction<UpsertChatbotUserQuestionMutation, UpsertChatbotUserQuestionMutationVariables>;

/**
 * __useUpsertChatbotUserQuestionMutation__
 *
 * To run a mutation, you first call `useUpsertChatbotUserQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertChatbotUserQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertChatbotUserQuestionMutation, { data, loading, error }] = useUpsertChatbotUserQuestionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertChatbotUserQuestionMutation(baseOptions?: Apollo.MutationHookOptions<UpsertChatbotUserQuestionMutation, UpsertChatbotUserQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertChatbotUserQuestionMutation, UpsertChatbotUserQuestionMutationVariables>(UpsertChatbotUserQuestionDocument, options);
      }
export type UpsertChatbotUserQuestionMutationHookResult = ReturnType<typeof useUpsertChatbotUserQuestionMutation>;
export type UpsertChatbotUserQuestionMutationResult = Apollo.MutationResult<UpsertChatbotUserQuestionMutation>;
export type UpsertChatbotUserQuestionMutationOptions = Apollo.BaseMutationOptions<UpsertChatbotUserQuestionMutation, UpsertChatbotUserQuestionMutationVariables>;
export const DeleteChatbotCategoryDocument = gql`
    mutation DeleteChatbotCategory($spaceId: String!, $id: String!) {
  deleteChatbotCategory(spaceId: $spaceId, id: $id)
}
    `;
export type DeleteChatbotCategoryMutationFn = Apollo.MutationFunction<DeleteChatbotCategoryMutation, DeleteChatbotCategoryMutationVariables>;

/**
 * __useDeleteChatbotCategoryMutation__
 *
 * To run a mutation, you first call `useDeleteChatbotCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteChatbotCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteChatbotCategoryMutation, { data, loading, error }] = useDeleteChatbotCategoryMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteChatbotCategoryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteChatbotCategoryMutation, DeleteChatbotCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteChatbotCategoryMutation, DeleteChatbotCategoryMutationVariables>(DeleteChatbotCategoryDocument, options);
      }
export type DeleteChatbotCategoryMutationHookResult = ReturnType<typeof useDeleteChatbotCategoryMutation>;
export type DeleteChatbotCategoryMutationResult = Apollo.MutationResult<DeleteChatbotCategoryMutation>;
export type DeleteChatbotCategoryMutationOptions = Apollo.BaseMutationOptions<DeleteChatbotCategoryMutation, DeleteChatbotCategoryMutationVariables>;
export const DeleteChatbotFaqDocument = gql`
    mutation DeleteChatbotFAQ($spaceId: String!, $id: String!) {
  deleteChatbotFAQ(spaceId: $spaceId, id: $id)
}
    `;
export type DeleteChatbotFaqMutationFn = Apollo.MutationFunction<DeleteChatbotFaqMutation, DeleteChatbotFaqMutationVariables>;

/**
 * __useDeleteChatbotFaqMutation__
 *
 * To run a mutation, you first call `useDeleteChatbotFaqMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteChatbotFaqMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteChatbotFaqMutation, { data, loading, error }] = useDeleteChatbotFaqMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteChatbotFaqMutation(baseOptions?: Apollo.MutationHookOptions<DeleteChatbotFaqMutation, DeleteChatbotFaqMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteChatbotFaqMutation, DeleteChatbotFaqMutationVariables>(DeleteChatbotFaqDocument, options);
      }
export type DeleteChatbotFaqMutationHookResult = ReturnType<typeof useDeleteChatbotFaqMutation>;
export type DeleteChatbotFaqMutationResult = Apollo.MutationResult<DeleteChatbotFaqMutation>;
export type DeleteChatbotFaqMutationOptions = Apollo.BaseMutationOptions<DeleteChatbotFaqMutation, DeleteChatbotFaqMutationVariables>;
export const DeleteChatbotUserQuestionDocument = gql`
    mutation DeleteChatbotUserQuestion($spaceId: String!, $id: String!) {
  deleteChatbotUserQuestion(spaceId: $spaceId, id: $id)
}
    `;
export type DeleteChatbotUserQuestionMutationFn = Apollo.MutationFunction<DeleteChatbotUserQuestionMutation, DeleteChatbotUserQuestionMutationVariables>;

/**
 * __useDeleteChatbotUserQuestionMutation__
 *
 * To run a mutation, you first call `useDeleteChatbotUserQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteChatbotUserQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteChatbotUserQuestionMutation, { data, loading, error }] = useDeleteChatbotUserQuestionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteChatbotUserQuestionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteChatbotUserQuestionMutation, DeleteChatbotUserQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteChatbotUserQuestionMutation, DeleteChatbotUserQuestionMutationVariables>(DeleteChatbotUserQuestionDocument, options);
      }
export type DeleteChatbotUserQuestionMutationHookResult = ReturnType<typeof useDeleteChatbotUserQuestionMutation>;
export type DeleteChatbotUserQuestionMutationResult = Apollo.MutationResult<DeleteChatbotUserQuestionMutation>;
export type DeleteChatbotUserQuestionMutationOptions = Apollo.BaseMutationOptions<DeleteChatbotUserQuestionMutation, DeleteChatbotUserQuestionMutationVariables>;
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
    ...CourseSubmission
  }
}
    ${CourseSubmissionFragmentDoc}`;
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
    ...CourseSubmission
  }
}
    ${CourseSubmissionFragmentDoc}`;
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
export const DeleteGitCourseSubmissionDocument = gql`
    mutation DeleteGitCourseSubmission($spaceId: String!, $courseKey: String!) {
  payload: deleteGitCourseSubmission(spaceId: $spaceId, courseKey: $courseKey)
}
    `;
export type DeleteGitCourseSubmissionMutationFn = Apollo.MutationFunction<DeleteGitCourseSubmissionMutation, DeleteGitCourseSubmissionMutationVariables>;

/**
 * __useDeleteGitCourseSubmissionMutation__
 *
 * To run a mutation, you first call `useDeleteGitCourseSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGitCourseSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGitCourseSubmissionMutation, { data, loading, error }] = useDeleteGitCourseSubmissionMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      courseKey: // value for 'courseKey'
 *   },
 * });
 */
export function useDeleteGitCourseSubmissionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGitCourseSubmissionMutation, DeleteGitCourseSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGitCourseSubmissionMutation, DeleteGitCourseSubmissionMutationVariables>(DeleteGitCourseSubmissionDocument, options);
      }
export type DeleteGitCourseSubmissionMutationHookResult = ReturnType<typeof useDeleteGitCourseSubmissionMutation>;
export type DeleteGitCourseSubmissionMutationResult = Apollo.MutationResult<DeleteGitCourseSubmissionMutation>;
export type DeleteGitCourseSubmissionMutationOptions = Apollo.BaseMutationOptions<DeleteGitCourseSubmissionMutation, DeleteGitCourseSubmissionMutationVariables>;
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
export const AddTopicQuestionsDocument = gql`
    mutation AddTopicQuestions($spaceId: String!, $input: AddTopicQuestionsInput!) {
  payload: addTopicQuestions(spaceId: $spaceId, input: $input) {
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
export type AddTopicQuestionsMutationFn = Apollo.MutationFunction<AddTopicQuestionsMutation, AddTopicQuestionsMutationVariables>;

/**
 * __useAddTopicQuestionsMutation__
 *
 * To run a mutation, you first call `useAddTopicQuestionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTopicQuestionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTopicQuestionsMutation, { data, loading, error }] = useAddTopicQuestionsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddTopicQuestionsMutation(baseOptions?: Apollo.MutationHookOptions<AddTopicQuestionsMutation, AddTopicQuestionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTopicQuestionsMutation, AddTopicQuestionsMutationVariables>(AddTopicQuestionsDocument, options);
      }
export type AddTopicQuestionsMutationHookResult = ReturnType<typeof useAddTopicQuestionsMutation>;
export type AddTopicQuestionsMutationResult = Apollo.MutationResult<AddTopicQuestionsMutation>;
export type AddTopicQuestionsMutationOptions = Apollo.BaseMutationOptions<AddTopicQuestionsMutation, AddTopicQuestionsMutationVariables>;
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
    courseKey
    courseRepoUrl
    weight
    publishStatus
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
export const UpsertRawGitCourseDocument = gql`
    mutation UpsertRawGitCourse($spaceId: String!, $courseInput: GitCourseInput!) {
  payload: upsertGitCourse(spaceId: $spaceId, gitCourseInput: $courseInput) {
    courseAdmins
    details
    duration
    highlights
    key
    priority
    publishStatus
    summary
    thumbnail
    title
    uuid
  }
}
    `;
export type UpsertRawGitCourseMutationFn = Apollo.MutationFunction<UpsertRawGitCourseMutation, UpsertRawGitCourseMutationVariables>;

/**
 * __useUpsertRawGitCourseMutation__
 *
 * To run a mutation, you first call `useUpsertRawGitCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertRawGitCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertRawGitCourseMutation, { data, loading, error }] = useUpsertRawGitCourseMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      courseInput: // value for 'courseInput'
 *   },
 * });
 */
export function useUpsertRawGitCourseMutation(baseOptions?: Apollo.MutationHookOptions<UpsertRawGitCourseMutation, UpsertRawGitCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertRawGitCourseMutation, UpsertRawGitCourseMutationVariables>(UpsertRawGitCourseDocument, options);
      }
export type UpsertRawGitCourseMutationHookResult = ReturnType<typeof useUpsertRawGitCourseMutation>;
export type UpsertRawGitCourseMutationResult = Apollo.MutationResult<UpsertRawGitCourseMutation>;
export type UpsertRawGitCourseMutationOptions = Apollo.BaseMutationOptions<UpsertRawGitCourseMutation, UpsertRawGitCourseMutationVariables>;
export const RawGitCoursesDocument = gql`
    query RawGitCourses($spaceId: String!) {
  payload: rawGitCourses(spaceId: $spaceId) {
    courseKey
    courseRepoUrl
    weight
    publishStatus
  }
}
    `;

/**
 * __useRawGitCoursesQuery__
 *
 * To run a query within a React component, call `useRawGitCoursesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRawGitCoursesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRawGitCoursesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useRawGitCoursesQuery(baseOptions: Apollo.QueryHookOptions<RawGitCoursesQuery, RawGitCoursesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RawGitCoursesQuery, RawGitCoursesQueryVariables>(RawGitCoursesDocument, options);
      }
export function useRawGitCoursesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RawGitCoursesQuery, RawGitCoursesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RawGitCoursesQuery, RawGitCoursesQueryVariables>(RawGitCoursesDocument, options);
        }
export type RawGitCoursesQueryHookResult = ReturnType<typeof useRawGitCoursesQuery>;
export type RawGitCoursesLazyQueryHookResult = ReturnType<typeof useRawGitCoursesLazyQuery>;
export type RawGitCoursesQueryResult = Apollo.QueryResult<RawGitCoursesQuery, RawGitCoursesQueryVariables>;
export function refetchRawGitCoursesQuery(variables: RawGitCoursesQueryVariables) {
      return { query: RawGitCoursesDocument, variables: variables }
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
export const DeleteAndPullCourseRepoDocument = gql`
    mutation DeleteAndPullCourseRepo($spaceId: String!, $courseKey: String!) {
  deleteAndPullCourseRepo(spaceId: $spaceId, courseKey: $courseKey) {
    ...Course
  }
}
    ${CourseFragmentDoc}`;
export type DeleteAndPullCourseRepoMutationFn = Apollo.MutationFunction<DeleteAndPullCourseRepoMutation, DeleteAndPullCourseRepoMutationVariables>;

/**
 * __useDeleteAndPullCourseRepoMutation__
 *
 * To run a mutation, you first call `useDeleteAndPullCourseRepoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAndPullCourseRepoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAndPullCourseRepoMutation, { data, loading, error }] = useDeleteAndPullCourseRepoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      courseKey: // value for 'courseKey'
 *   },
 * });
 */
export function useDeleteAndPullCourseRepoMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAndPullCourseRepoMutation, DeleteAndPullCourseRepoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAndPullCourseRepoMutation, DeleteAndPullCourseRepoMutationVariables>(DeleteAndPullCourseRepoDocument, options);
      }
export type DeleteAndPullCourseRepoMutationHookResult = ReturnType<typeof useDeleteAndPullCourseRepoMutation>;
export type DeleteAndPullCourseRepoMutationResult = Apollo.MutationResult<DeleteAndPullCourseRepoMutation>;
export type DeleteAndPullCourseRepoMutationOptions = Apollo.BaseMutationOptions<DeleteAndPullCourseRepoMutation, DeleteAndPullCourseRepoMutationVariables>;
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
export const UpsertGuideRatingsDocument = gql`
    mutation UpsertGuideRatings($spaceId: String!, $upsertGuideRatingInput: UpsertGuideRatingInput!) {
  payload: upsertGuideRating(
    spaceId: $spaceId
    upsertGuideRatingInput: $upsertGuideRatingInput
  ) {
    ...GuideRating
  }
}
    ${GuideRatingFragmentDoc}`;
export type UpsertGuideRatingsMutationFn = Apollo.MutationFunction<UpsertGuideRatingsMutation, UpsertGuideRatingsMutationVariables>;

/**
 * __useUpsertGuideRatingsMutation__
 *
 * To run a mutation, you first call `useUpsertGuideRatingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGuideRatingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGuideRatingsMutation, { data, loading, error }] = useUpsertGuideRatingsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      upsertGuideRatingInput: // value for 'upsertGuideRatingInput'
 *   },
 * });
 */
export function useUpsertGuideRatingsMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGuideRatingsMutation, UpsertGuideRatingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGuideRatingsMutation, UpsertGuideRatingsMutationVariables>(UpsertGuideRatingsDocument, options);
      }
export type UpsertGuideRatingsMutationHookResult = ReturnType<typeof useUpsertGuideRatingsMutation>;
export type UpsertGuideRatingsMutationResult = Apollo.MutationResult<UpsertGuideRatingsMutation>;
export type UpsertGuideRatingsMutationOptions = Apollo.BaseMutationOptions<UpsertGuideRatingsMutation, UpsertGuideRatingsMutationVariables>;
export const GuideRatingsDocument = gql`
    query GuideRatings($spaceId: String!, $guideUuid: String!) {
  guideRatings(spaceId: $spaceId, guideUuid: $guideUuid) {
    ...GuideRating
  }
}
    ${GuideRatingFragmentDoc}`;

/**
 * __useGuideRatingsQuery__
 *
 * To run a query within a React component, call `useGuideRatingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGuideRatingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGuideRatingsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      guideUuid: // value for 'guideUuid'
 *   },
 * });
 */
export function useGuideRatingsQuery(baseOptions: Apollo.QueryHookOptions<GuideRatingsQuery, GuideRatingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GuideRatingsQuery, GuideRatingsQueryVariables>(GuideRatingsDocument, options);
      }
export function useGuideRatingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GuideRatingsQuery, GuideRatingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GuideRatingsQuery, GuideRatingsQueryVariables>(GuideRatingsDocument, options);
        }
export type GuideRatingsQueryHookResult = ReturnType<typeof useGuideRatingsQuery>;
export type GuideRatingsLazyQueryHookResult = ReturnType<typeof useGuideRatingsLazyQuery>;
export type GuideRatingsQueryResult = Apollo.QueryResult<GuideRatingsQuery, GuideRatingsQueryVariables>;
export function refetchGuideRatingsQuery(variables: GuideRatingsQueryVariables) {
      return { query: GuideRatingsDocument, variables: variables }
    }
export const ConsolidatedGuideRatingDocument = gql`
    query ConsolidatedGuideRating($spaceId: String!, $guideUuid: String!) {
  consolidatedGuideRating(spaceId: $spaceId, guideUuid: $guideUuid) {
    avgRating
    endRatingFeedbackCount
    positiveFeedbackCount
    negativeFeedbackCount
    positiveRatingDistribution {
      content
      questions
      ux
    }
    negativeRatingDistribution {
      content
      questions
      ux
    }
  }
}
    `;

/**
 * __useConsolidatedGuideRatingQuery__
 *
 * To run a query within a React component, call `useConsolidatedGuideRatingQuery` and pass it any options that fit your needs.
 * When your component renders, `useConsolidatedGuideRatingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConsolidatedGuideRatingQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      guideUuid: // value for 'guideUuid'
 *   },
 * });
 */
export function useConsolidatedGuideRatingQuery(baseOptions: Apollo.QueryHookOptions<ConsolidatedGuideRatingQuery, ConsolidatedGuideRatingQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConsolidatedGuideRatingQuery, ConsolidatedGuideRatingQueryVariables>(ConsolidatedGuideRatingDocument, options);
      }
export function useConsolidatedGuideRatingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConsolidatedGuideRatingQuery, ConsolidatedGuideRatingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConsolidatedGuideRatingQuery, ConsolidatedGuideRatingQueryVariables>(ConsolidatedGuideRatingDocument, options);
        }
export type ConsolidatedGuideRatingQueryHookResult = ReturnType<typeof useConsolidatedGuideRatingQuery>;
export type ConsolidatedGuideRatingLazyQueryHookResult = ReturnType<typeof useConsolidatedGuideRatingLazyQuery>;
export type ConsolidatedGuideRatingQueryResult = Apollo.QueryResult<ConsolidatedGuideRatingQuery, ConsolidatedGuideRatingQueryVariables>;
export function refetchConsolidatedGuideRatingQuery(variables: ConsolidatedGuideRatingQueryVariables) {
      return { query: ConsolidatedGuideRatingDocument, variables: variables }
    }
export const GuideSubmissionsQueryDocument = gql`
    query GuideSubmissionsQuery($spaceId: String!, $guideUuid: String!, $filters: GuideSubmissionFiltersInput!) {
  guideSubmissions(spaceId: $spaceId, guideUuid: $guideUuid, filters: $filters) {
    id
    createdAt
    createdBy
    createdByUsername
    guideId
    guideUuid
    result {
      correctQuestions
      wrongQuestions
      allQuestions
    }
    steps {
      itemResponses {
        type
        userInput
        uuid
      }
      uuid
    }
    spaceId
    uuid
    correctQuestionsCount
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
 *      spaceId: // value for 'spaceId'
 *      guideUuid: // value for 'guideUuid'
 *      filters: // value for 'filters'
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
export const DeleteGuideDocument = gql`
    mutation DeleteGuide($spaceId: String!, $uuid: String!) {
  payload: deleteGuide(spaceId: $spaceId, uuid: $uuid)
}
    `;
export type DeleteGuideMutationFn = Apollo.MutationFunction<DeleteGuideMutation, DeleteGuideMutationVariables>;

/**
 * __useDeleteGuideMutation__
 *
 * To run a mutation, you first call `useDeleteGuideMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGuideMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGuideMutation, { data, loading, error }] = useDeleteGuideMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      uuid: // value for 'uuid'
 *   },
 * });
 */
export function useDeleteGuideMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGuideMutation, DeleteGuideMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGuideMutation, DeleteGuideMutationVariables>(DeleteGuideDocument, options);
      }
export type DeleteGuideMutationHookResult = ReturnType<typeof useDeleteGuideMutation>;
export type DeleteGuideMutationResult = Apollo.MutationResult<DeleteGuideMutation>;
export type DeleteGuideMutationOptions = Apollo.BaseMutationOptions<DeleteGuideMutation, DeleteGuideMutationVariables>;
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
    content
    links {
      downloadStatus
      link
      tokenCount
    }
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
export const GenerateImageDocument = gql`
    mutation GenerateImage($input: GenerateImageInput!) {
  generateImage(input: $input) {
    created
    data {
      url
    }
  }
}
    `;
export type GenerateImageMutationFn = Apollo.MutationFunction<GenerateImageMutation, GenerateImageMutationVariables>;

/**
 * __useGenerateImageMutation__
 *
 * To run a mutation, you first call `useGenerateImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateImageMutation, { data, loading, error }] = useGenerateImageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateImageMutation(baseOptions?: Apollo.MutationHookOptions<GenerateImageMutation, GenerateImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateImageMutation, GenerateImageMutationVariables>(GenerateImageDocument, options);
      }
export type GenerateImageMutationHookResult = ReturnType<typeof useGenerateImageMutation>;
export type GenerateImageMutationResult = Apollo.MutationResult<GenerateImageMutation>;
export type GenerateImageMutationOptions = Apollo.BaseMutationOptions<GenerateImageMutation, GenerateImageMutationVariables>;
export const ProjectsDocument = gql`
    query Projects($type: String) {
  projects(type: $type) {
    ...Project
  }
}
    ${ProjectFragmentDoc}`;

/**
 * __useProjectsQuery__
 *
 * To run a query within a React component, call `useProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectsQuery({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useProjectsQuery(baseOptions?: Apollo.QueryHookOptions<ProjectsQuery, ProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectsQuery, ProjectsQueryVariables>(ProjectsDocument, options);
      }
export function useProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectsQuery, ProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectsQuery, ProjectsQueryVariables>(ProjectsDocument, options);
        }
export type ProjectsQueryHookResult = ReturnType<typeof useProjectsQuery>;
export type ProjectsLazyQueryHookResult = ReturnType<typeof useProjectsLazyQuery>;
export type ProjectsQueryResult = Apollo.QueryResult<ProjectsQuery, ProjectsQueryVariables>;
export function refetchProjectsQuery(variables?: ProjectsQueryVariables) {
      return { query: ProjectsDocument, variables: variables }
    }
export const ProjectDocument = gql`
    query Project($id: String!) {
  project(id: $id) {
    ...Project
  }
}
    ${ProjectFragmentDoc}`;

/**
 * __useProjectQuery__
 *
 * To run a query within a React component, call `useProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProjectQuery(baseOptions: Apollo.QueryHookOptions<ProjectQuery, ProjectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectQuery, ProjectQueryVariables>(ProjectDocument, options);
      }
export function useProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectQuery, ProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectQuery, ProjectQueryVariables>(ProjectDocument, options);
        }
export type ProjectQueryHookResult = ReturnType<typeof useProjectQuery>;
export type ProjectLazyQueryHookResult = ReturnType<typeof useProjectLazyQuery>;
export type ProjectQueryResult = Apollo.QueryResult<ProjectQuery, ProjectQueryVariables>;
export function refetchProjectQuery(variables: ProjectQueryVariables) {
      return { query: ProjectDocument, variables: variables }
    }
export const ProjectBytesDocument = gql`
    query ProjectBytes($projectId: String!) {
  projectBytes(projectId: $projectId) {
    ...ProjectByte
  }
}
    ${ProjectByteFragmentDoc}`;

/**
 * __useProjectBytesQuery__
 *
 * To run a query within a React component, call `useProjectBytesQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectBytesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectBytesQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useProjectBytesQuery(baseOptions: Apollo.QueryHookOptions<ProjectBytesQuery, ProjectBytesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectBytesQuery, ProjectBytesQueryVariables>(ProjectBytesDocument, options);
      }
export function useProjectBytesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectBytesQuery, ProjectBytesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectBytesQuery, ProjectBytesQueryVariables>(ProjectBytesDocument, options);
        }
export type ProjectBytesQueryHookResult = ReturnType<typeof useProjectBytesQuery>;
export type ProjectBytesLazyQueryHookResult = ReturnType<typeof useProjectBytesLazyQuery>;
export type ProjectBytesQueryResult = Apollo.QueryResult<ProjectBytesQuery, ProjectBytesQueryVariables>;
export function refetchProjectBytesQuery(variables: ProjectBytesQueryVariables) {
      return { query: ProjectBytesDocument, variables: variables }
    }
export const ProjectShortVideosDocument = gql`
    query ProjectShortVideos($projectId: String!) {
  projectShortVideos(projectId: $projectId) {
    ...ProjectShortVideo
  }
}
    ${ProjectShortVideoFragmentDoc}`;

/**
 * __useProjectShortVideosQuery__
 *
 * To run a query within a React component, call `useProjectShortVideosQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectShortVideosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectShortVideosQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useProjectShortVideosQuery(baseOptions: Apollo.QueryHookOptions<ProjectShortVideosQuery, ProjectShortVideosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectShortVideosQuery, ProjectShortVideosQueryVariables>(ProjectShortVideosDocument, options);
      }
export function useProjectShortVideosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectShortVideosQuery, ProjectShortVideosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectShortVideosQuery, ProjectShortVideosQueryVariables>(ProjectShortVideosDocument, options);
        }
export type ProjectShortVideosQueryHookResult = ReturnType<typeof useProjectShortVideosQuery>;
export type ProjectShortVideosLazyQueryHookResult = ReturnType<typeof useProjectShortVideosLazyQuery>;
export type ProjectShortVideosQueryResult = Apollo.QueryResult<ProjectShortVideosQuery, ProjectShortVideosQueryVariables>;
export function refetchProjectShortVideosQuery(variables: ProjectShortVideosQueryVariables) {
      return { query: ProjectShortVideosDocument, variables: variables }
    }
export const ProjectByteDocument = gql`
    query ProjectByte($projectId: String!, $id: String!) {
  projectByte(projectId: $projectId, projectByteId: $id) {
    ...ProjectByte
  }
}
    ${ProjectByteFragmentDoc}`;

/**
 * __useProjectByteQuery__
 *
 * To run a query within a React component, call `useProjectByteQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectByteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectByteQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProjectByteQuery(baseOptions: Apollo.QueryHookOptions<ProjectByteQuery, ProjectByteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectByteQuery, ProjectByteQueryVariables>(ProjectByteDocument, options);
      }
export function useProjectByteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectByteQuery, ProjectByteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectByteQuery, ProjectByteQueryVariables>(ProjectByteDocument, options);
        }
export type ProjectByteQueryHookResult = ReturnType<typeof useProjectByteQuery>;
export type ProjectByteLazyQueryHookResult = ReturnType<typeof useProjectByteLazyQuery>;
export type ProjectByteQueryResult = Apollo.QueryResult<ProjectByteQuery, ProjectByteQueryVariables>;
export function refetchProjectByteQuery(variables: ProjectByteQueryVariables) {
      return { query: ProjectByteDocument, variables: variables }
    }
export const ProjectByteCollectionsDocument = gql`
    query ProjectByteCollections($projectId: String!) {
  projectByteCollections(projectId: $projectId) {
    ...ProjectByteCollection
  }
}
    ${ProjectByteCollectionFragmentDoc}`;

/**
 * __useProjectByteCollectionsQuery__
 *
 * To run a query within a React component, call `useProjectByteCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectByteCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectByteCollectionsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useProjectByteCollectionsQuery(baseOptions: Apollo.QueryHookOptions<ProjectByteCollectionsQuery, ProjectByteCollectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectByteCollectionsQuery, ProjectByteCollectionsQueryVariables>(ProjectByteCollectionsDocument, options);
      }
export function useProjectByteCollectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectByteCollectionsQuery, ProjectByteCollectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectByteCollectionsQuery, ProjectByteCollectionsQueryVariables>(ProjectByteCollectionsDocument, options);
        }
export type ProjectByteCollectionsQueryHookResult = ReturnType<typeof useProjectByteCollectionsQuery>;
export type ProjectByteCollectionsLazyQueryHookResult = ReturnType<typeof useProjectByteCollectionsLazyQuery>;
export type ProjectByteCollectionsQueryResult = Apollo.QueryResult<ProjectByteCollectionsQuery, ProjectByteCollectionsQueryVariables>;
export function refetchProjectByteCollectionsQuery(variables: ProjectByteCollectionsQueryVariables) {
      return { query: ProjectByteCollectionsDocument, variables: variables }
    }
export const ProjectByteCollectionDocument = gql`
    query ProjectByteCollection($projectId: String!, $id: String!) {
  projectByteCollection(projectId: $projectId, byteCollectionId: $id) {
    ...ProjectByteCollection
  }
}
    ${ProjectByteCollectionFragmentDoc}`;

/**
 * __useProjectByteCollectionQuery__
 *
 * To run a query within a React component, call `useProjectByteCollectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectByteCollectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectByteCollectionQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProjectByteCollectionQuery(baseOptions: Apollo.QueryHookOptions<ProjectByteCollectionQuery, ProjectByteCollectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectByteCollectionQuery, ProjectByteCollectionQueryVariables>(ProjectByteCollectionDocument, options);
      }
export function useProjectByteCollectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectByteCollectionQuery, ProjectByteCollectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectByteCollectionQuery, ProjectByteCollectionQueryVariables>(ProjectByteCollectionDocument, options);
        }
export type ProjectByteCollectionQueryHookResult = ReturnType<typeof useProjectByteCollectionQuery>;
export type ProjectByteCollectionLazyQueryHookResult = ReturnType<typeof useProjectByteCollectionLazyQuery>;
export type ProjectByteCollectionQueryResult = Apollo.QueryResult<ProjectByteCollectionQuery, ProjectByteCollectionQueryVariables>;
export function refetchProjectByteCollectionQuery(variables: ProjectByteCollectionQueryVariables) {
      return { query: ProjectByteCollectionDocument, variables: variables }
    }
export const UpsertProjectDocument = gql`
    mutation UpsertProject($input: UpsertProjectInput!) {
  upsertProject(input: $input) {
    ...Project
  }
}
    ${ProjectFragmentDoc}`;
export type UpsertProjectMutationFn = Apollo.MutationFunction<UpsertProjectMutation, UpsertProjectMutationVariables>;

/**
 * __useUpsertProjectMutation__
 *
 * To run a mutation, you first call `useUpsertProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertProjectMutation, { data, loading, error }] = useUpsertProjectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertProjectMutation(baseOptions?: Apollo.MutationHookOptions<UpsertProjectMutation, UpsertProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertProjectMutation, UpsertProjectMutationVariables>(UpsertProjectDocument, options);
      }
export type UpsertProjectMutationHookResult = ReturnType<typeof useUpsertProjectMutation>;
export type UpsertProjectMutationResult = Apollo.MutationResult<UpsertProjectMutation>;
export type UpsertProjectMutationOptions = Apollo.BaseMutationOptions<UpsertProjectMutation, UpsertProjectMutationVariables>;
export const UpsertProjectByteDocument = gql`
    mutation UpsertProjectByte($projectId: String!, $input: UpsertProjectByteInput!) {
  upsertProjectByte(projectId: $projectId, input: $input) {
    ...ProjectByte
  }
}
    ${ProjectByteFragmentDoc}`;
export type UpsertProjectByteMutationFn = Apollo.MutationFunction<UpsertProjectByteMutation, UpsertProjectByteMutationVariables>;

/**
 * __useUpsertProjectByteMutation__
 *
 * To run a mutation, you first call `useUpsertProjectByteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertProjectByteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertProjectByteMutation, { data, loading, error }] = useUpsertProjectByteMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertProjectByteMutation(baseOptions?: Apollo.MutationHookOptions<UpsertProjectByteMutation, UpsertProjectByteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertProjectByteMutation, UpsertProjectByteMutationVariables>(UpsertProjectByteDocument, options);
      }
export type UpsertProjectByteMutationHookResult = ReturnType<typeof useUpsertProjectByteMutation>;
export type UpsertProjectByteMutationResult = Apollo.MutationResult<UpsertProjectByteMutation>;
export type UpsertProjectByteMutationOptions = Apollo.BaseMutationOptions<UpsertProjectByteMutation, UpsertProjectByteMutationVariables>;
export const UpsertProjectByteCollectionDocument = gql`
    mutation UpsertProjectByteCollection($projectId: String!, $input: UpsertProjectByteCollectionInput!) {
  upsertProjectByteCollection(projectId: $projectId, input: $input) {
    ...ProjectByteCollection
  }
}
    ${ProjectByteCollectionFragmentDoc}`;
export type UpsertProjectByteCollectionMutationFn = Apollo.MutationFunction<UpsertProjectByteCollectionMutation, UpsertProjectByteCollectionMutationVariables>;

/**
 * __useUpsertProjectByteCollectionMutation__
 *
 * To run a mutation, you first call `useUpsertProjectByteCollectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertProjectByteCollectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertProjectByteCollectionMutation, { data, loading, error }] = useUpsertProjectByteCollectionMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertProjectByteCollectionMutation(baseOptions?: Apollo.MutationHookOptions<UpsertProjectByteCollectionMutation, UpsertProjectByteCollectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertProjectByteCollectionMutation, UpsertProjectByteCollectionMutationVariables>(UpsertProjectByteCollectionDocument, options);
      }
export type UpsertProjectByteCollectionMutationHookResult = ReturnType<typeof useUpsertProjectByteCollectionMutation>;
export type UpsertProjectByteCollectionMutationResult = Apollo.MutationResult<UpsertProjectByteCollectionMutation>;
export type UpsertProjectByteCollectionMutationOptions = Apollo.BaseMutationOptions<UpsertProjectByteCollectionMutation, UpsertProjectByteCollectionMutationVariables>;
export const UpsertProjectShortVideoDocument = gql`
    mutation UpsertProjectShortVideo($projectId: String!, $input: ProjectShortVideoInput!) {
  upsertProjectShortVideo(projectId: $projectId, shortVideo: $input) {
    ...ProjectShortVideo
  }
}
    ${ProjectShortVideoFragmentDoc}`;
export type UpsertProjectShortVideoMutationFn = Apollo.MutationFunction<UpsertProjectShortVideoMutation, UpsertProjectShortVideoMutationVariables>;

/**
 * __useUpsertProjectShortVideoMutation__
 *
 * To run a mutation, you first call `useUpsertProjectShortVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertProjectShortVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertProjectShortVideoMutation, { data, loading, error }] = useUpsertProjectShortVideoMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertProjectShortVideoMutation(baseOptions?: Apollo.MutationHookOptions<UpsertProjectShortVideoMutation, UpsertProjectShortVideoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertProjectShortVideoMutation, UpsertProjectShortVideoMutationVariables>(UpsertProjectShortVideoDocument, options);
      }
export type UpsertProjectShortVideoMutationHookResult = ReturnType<typeof useUpsertProjectShortVideoMutation>;
export type UpsertProjectShortVideoMutationResult = Apollo.MutationResult<UpsertProjectShortVideoMutation>;
export type UpsertProjectShortVideoMutationOptions = Apollo.BaseMutationOptions<UpsertProjectShortVideoMutation, UpsertProjectShortVideoMutationVariables>;
export const UpsertShortVideoDocument = gql`
    mutation UpsertShortVideo($spaceId: String!, $shortVideo: ShortVideoInput!) {
  upsertShortVideo(spaceId: $spaceId, shortVideo: $shortVideo) {
    ...ShortVideo
  }
}
    ${ShortVideoFragmentDoc}`;
export type UpsertShortVideoMutationFn = Apollo.MutationFunction<UpsertShortVideoMutation, UpsertShortVideoMutationVariables>;

/**
 * __useUpsertShortVideoMutation__
 *
 * To run a mutation, you first call `useUpsertShortVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertShortVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertShortVideoMutation, { data, loading, error }] = useUpsertShortVideoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      shortVideo: // value for 'shortVideo'
 *   },
 * });
 */
export function useUpsertShortVideoMutation(baseOptions?: Apollo.MutationHookOptions<UpsertShortVideoMutation, UpsertShortVideoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertShortVideoMutation, UpsertShortVideoMutationVariables>(UpsertShortVideoDocument, options);
      }
export type UpsertShortVideoMutationHookResult = ReturnType<typeof useUpsertShortVideoMutation>;
export type UpsertShortVideoMutationResult = Apollo.MutationResult<UpsertShortVideoMutation>;
export type UpsertShortVideoMutationOptions = Apollo.BaseMutationOptions<UpsertShortVideoMutation, UpsertShortVideoMutationVariables>;
export const ShortVideosDocument = gql`
    query ShortVideos($spaceId: String!) {
  shortVideos(spaceId: $spaceId) {
    ...ShortVideo
  }
}
    ${ShortVideoFragmentDoc}`;

/**
 * __useShortVideosQuery__
 *
 * To run a query within a React component, call `useShortVideosQuery` and pass it any options that fit your needs.
 * When your component renders, `useShortVideosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useShortVideosQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useShortVideosQuery(baseOptions: Apollo.QueryHookOptions<ShortVideosQuery, ShortVideosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ShortVideosQuery, ShortVideosQueryVariables>(ShortVideosDocument, options);
      }
export function useShortVideosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ShortVideosQuery, ShortVideosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ShortVideosQuery, ShortVideosQueryVariables>(ShortVideosDocument, options);
        }
export type ShortVideosQueryHookResult = ReturnType<typeof useShortVideosQuery>;
export type ShortVideosLazyQueryHookResult = ReturnType<typeof useShortVideosLazyQuery>;
export type ShortVideosQueryResult = Apollo.QueryResult<ShortVideosQuery, ShortVideosQueryVariables>;
export function refetchShortVideosQuery(variables: ShortVideosQueryVariables) {
      return { query: ShortVideosDocument, variables: variables }
    }
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
export const DiscourseIndexRunsDocument = gql`
    query DiscourseIndexRuns($spaceId: String!) {
  discourseIndexRuns(spaceId: $spaceId) {
    ...DiscourseIndexRunFragment
  }
}
    ${DiscourseIndexRunFragmentFragmentDoc}`;

/**
 * __useDiscourseIndexRunsQuery__
 *
 * To run a query within a React component, call `useDiscourseIndexRunsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscourseIndexRunsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscourseIndexRunsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useDiscourseIndexRunsQuery(baseOptions: Apollo.QueryHookOptions<DiscourseIndexRunsQuery, DiscourseIndexRunsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscourseIndexRunsQuery, DiscourseIndexRunsQueryVariables>(DiscourseIndexRunsDocument, options);
      }
export function useDiscourseIndexRunsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscourseIndexRunsQuery, DiscourseIndexRunsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscourseIndexRunsQuery, DiscourseIndexRunsQueryVariables>(DiscourseIndexRunsDocument, options);
        }
export type DiscourseIndexRunsQueryHookResult = ReturnType<typeof useDiscourseIndexRunsQuery>;
export type DiscourseIndexRunsLazyQueryHookResult = ReturnType<typeof useDiscourseIndexRunsLazyQuery>;
export type DiscourseIndexRunsQueryResult = Apollo.QueryResult<DiscourseIndexRunsQuery, DiscourseIndexRunsQueryVariables>;
export function refetchDiscourseIndexRunsQuery(variables: DiscourseIndexRunsQueryVariables) {
      return { query: DiscourseIndexRunsDocument, variables: variables }
    }
export const DiscoursePostsDocument = gql`
    query DiscoursePosts($spaceId: String!) {
  discoursePosts(spaceId: $spaceId) {
    ...DiscoursePost
  }
}
    ${DiscoursePostFragmentDoc}`;

/**
 * __useDiscoursePostsQuery__
 *
 * To run a query within a React component, call `useDiscoursePostsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscoursePostsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscoursePostsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useDiscoursePostsQuery(baseOptions: Apollo.QueryHookOptions<DiscoursePostsQuery, DiscoursePostsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscoursePostsQuery, DiscoursePostsQueryVariables>(DiscoursePostsDocument, options);
      }
export function useDiscoursePostsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscoursePostsQuery, DiscoursePostsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscoursePostsQuery, DiscoursePostsQueryVariables>(DiscoursePostsDocument, options);
        }
export type DiscoursePostsQueryHookResult = ReturnType<typeof useDiscoursePostsQuery>;
export type DiscoursePostsLazyQueryHookResult = ReturnType<typeof useDiscoursePostsLazyQuery>;
export type DiscoursePostsQueryResult = Apollo.QueryResult<DiscoursePostsQuery, DiscoursePostsQueryVariables>;
export function refetchDiscoursePostsQuery(variables: DiscoursePostsQueryVariables) {
      return { query: DiscoursePostsDocument, variables: variables }
    }
export const DiscoursePostCommentsDocument = gql`
    query DiscoursePostComments($spaceId: String!, $postId: String!) {
  discoursePostComments(spaceId: $spaceId, postId: $postId) {
    id
    spaceId
    commentPostId
    author
    datePublished
    createdAt
    indexedAt
    content
    postId
  }
}
    `;

/**
 * __useDiscoursePostCommentsQuery__
 *
 * To run a query within a React component, call `useDiscoursePostCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscoursePostCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscoursePostCommentsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useDiscoursePostCommentsQuery(baseOptions: Apollo.QueryHookOptions<DiscoursePostCommentsQuery, DiscoursePostCommentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscoursePostCommentsQuery, DiscoursePostCommentsQueryVariables>(DiscoursePostCommentsDocument, options);
      }
export function useDiscoursePostCommentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscoursePostCommentsQuery, DiscoursePostCommentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscoursePostCommentsQuery, DiscoursePostCommentsQueryVariables>(DiscoursePostCommentsDocument, options);
        }
export type DiscoursePostCommentsQueryHookResult = ReturnType<typeof useDiscoursePostCommentsQuery>;
export type DiscoursePostCommentsLazyQueryHookResult = ReturnType<typeof useDiscoursePostCommentsLazyQuery>;
export type DiscoursePostCommentsQueryResult = Apollo.QueryResult<DiscoursePostCommentsQuery, DiscoursePostCommentsQueryVariables>;
export function refetchDiscoursePostCommentsQuery(variables: DiscoursePostCommentsQueryVariables) {
      return { query: DiscoursePostCommentsDocument, variables: variables }
    }
export const DiscourseTopicsDocument = gql`
    query DiscourseTopics($spaceId: String!, $postId: String!) {
  discoursePostComments(spaceId: $spaceId, postId: $postId) {
    id
    commentPostId
    spaceId
    content
    author
    datePublished
    createdAt
    indexedAt
    postId
  }
}
    `;

/**
 * __useDiscourseTopicsQuery__
 *
 * To run a query within a React component, call `useDiscourseTopicsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscourseTopicsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscourseTopicsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useDiscourseTopicsQuery(baseOptions: Apollo.QueryHookOptions<DiscourseTopicsQuery, DiscourseTopicsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscourseTopicsQuery, DiscourseTopicsQueryVariables>(DiscourseTopicsDocument, options);
      }
export function useDiscourseTopicsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscourseTopicsQuery, DiscourseTopicsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscourseTopicsQuery, DiscourseTopicsQueryVariables>(DiscourseTopicsDocument, options);
        }
export type DiscourseTopicsQueryHookResult = ReturnType<typeof useDiscourseTopicsQuery>;
export type DiscourseTopicsLazyQueryHookResult = ReturnType<typeof useDiscourseTopicsLazyQuery>;
export type DiscourseTopicsQueryResult = Apollo.QueryResult<DiscourseTopicsQuery, DiscourseTopicsQueryVariables>;
export function refetchDiscourseTopicsQuery(variables: DiscourseTopicsQueryVariables) {
      return { query: DiscourseTopicsDocument, variables: variables }
    }
export const DiscordServerDocument = gql`
    query DiscordServer($spaceId: String!, $id: String!) {
  discordServer(spaceId: $spaceId, id: $id) {
    ...DiscordServerFragment
  }
}
    ${DiscordServerFragmentFragmentDoc}`;

/**
 * __useDiscordServerQuery__
 *
 * To run a query within a React component, call `useDiscordServerQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscordServerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscordServerQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDiscordServerQuery(baseOptions: Apollo.QueryHookOptions<DiscordServerQuery, DiscordServerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscordServerQuery, DiscordServerQueryVariables>(DiscordServerDocument, options);
      }
export function useDiscordServerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscordServerQuery, DiscordServerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscordServerQuery, DiscordServerQueryVariables>(DiscordServerDocument, options);
        }
export type DiscordServerQueryHookResult = ReturnType<typeof useDiscordServerQuery>;
export type DiscordServerLazyQueryHookResult = ReturnType<typeof useDiscordServerLazyQuery>;
export type DiscordServerQueryResult = Apollo.QueryResult<DiscordServerQuery, DiscordServerQueryVariables>;
export function refetchDiscordServerQuery(variables: DiscordServerQueryVariables) {
      return { query: DiscordServerDocument, variables: variables }
    }
export const DiscordChannelsDocument = gql`
    query DiscordChannels($spaceId: String!, $serverId: String!) {
  discordChannels(spaceId: $spaceId, serverId: $serverId) {
    ...DiscordChannelFragment
  }
}
    ${DiscordChannelFragmentFragmentDoc}`;

/**
 * __useDiscordChannelsQuery__
 *
 * To run a query within a React component, call `useDiscordChannelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscordChannelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscordChannelsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      serverId: // value for 'serverId'
 *   },
 * });
 */
export function useDiscordChannelsQuery(baseOptions: Apollo.QueryHookOptions<DiscordChannelsQuery, DiscordChannelsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscordChannelsQuery, DiscordChannelsQueryVariables>(DiscordChannelsDocument, options);
      }
export function useDiscordChannelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscordChannelsQuery, DiscordChannelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscordChannelsQuery, DiscordChannelsQueryVariables>(DiscordChannelsDocument, options);
        }
export type DiscordChannelsQueryHookResult = ReturnType<typeof useDiscordChannelsQuery>;
export type DiscordChannelsLazyQueryHookResult = ReturnType<typeof useDiscordChannelsLazyQuery>;
export type DiscordChannelsQueryResult = Apollo.QueryResult<DiscordChannelsQuery, DiscordChannelsQueryVariables>;
export function refetchDiscordChannelsQuery(variables: DiscordChannelsQueryVariables) {
      return { query: DiscordChannelsDocument, variables: variables }
    }
export const DiscordMessagesDocument = gql`
    query DiscordMessages($spaceId: String!, $channelId: String!) {
  discordMessages(spaceId: $spaceId, channelId: $channelId) {
    ...DiscordMessageFragment
  }
}
    ${DiscordMessageFragmentFragmentDoc}`;

/**
 * __useDiscordMessagesQuery__
 *
 * To run a query within a React component, call `useDiscordMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscordMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscordMessagesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      channelId: // value for 'channelId'
 *   },
 * });
 */
export function useDiscordMessagesQuery(baseOptions: Apollo.QueryHookOptions<DiscordMessagesQuery, DiscordMessagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscordMessagesQuery, DiscordMessagesQueryVariables>(DiscordMessagesDocument, options);
      }
export function useDiscordMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscordMessagesQuery, DiscordMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscordMessagesQuery, DiscordMessagesQueryVariables>(DiscordMessagesDocument, options);
        }
export type DiscordMessagesQueryHookResult = ReturnType<typeof useDiscordMessagesQuery>;
export type DiscordMessagesLazyQueryHookResult = ReturnType<typeof useDiscordMessagesLazyQuery>;
export type DiscordMessagesQueryResult = Apollo.QueryResult<DiscordMessagesQuery, DiscordMessagesQueryVariables>;
export function refetchDiscordMessagesQuery(variables: DiscordMessagesQueryVariables) {
      return { query: DiscordMessagesDocument, variables: variables }
    }
export const WebsiteScrapingInfosDocument = gql`
    query WebsiteScrapingInfos($spaceId: String!) {
  websiteScrapingInfos(spaceId: $spaceId) {
    ...WebsiteScrapingInfo
  }
}
    ${WebsiteScrapingInfoFragmentDoc}`;

/**
 * __useWebsiteScrapingInfosQuery__
 *
 * To run a query within a React component, call `useWebsiteScrapingInfosQuery` and pass it any options that fit your needs.
 * When your component renders, `useWebsiteScrapingInfosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWebsiteScrapingInfosQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useWebsiteScrapingInfosQuery(baseOptions: Apollo.QueryHookOptions<WebsiteScrapingInfosQuery, WebsiteScrapingInfosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WebsiteScrapingInfosQuery, WebsiteScrapingInfosQueryVariables>(WebsiteScrapingInfosDocument, options);
      }
export function useWebsiteScrapingInfosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WebsiteScrapingInfosQuery, WebsiteScrapingInfosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WebsiteScrapingInfosQuery, WebsiteScrapingInfosQueryVariables>(WebsiteScrapingInfosDocument, options);
        }
export type WebsiteScrapingInfosQueryHookResult = ReturnType<typeof useWebsiteScrapingInfosQuery>;
export type WebsiteScrapingInfosLazyQueryHookResult = ReturnType<typeof useWebsiteScrapingInfosLazyQuery>;
export type WebsiteScrapingInfosQueryResult = Apollo.QueryResult<WebsiteScrapingInfosQuery, WebsiteScrapingInfosQueryVariables>;
export function refetchWebsiteScrapingInfosQuery(variables: WebsiteScrapingInfosQueryVariables) {
      return { query: WebsiteScrapingInfosDocument, variables: variables }
    }
export const ArticleIndexingInfosDocument = gql`
    query ArticleIndexingInfos($spaceId: String!) {
  articleIndexingInfos(spaceId: $spaceId) {
    ...ArticleIndexingInfo
  }
}
    ${ArticleIndexingInfoFragmentDoc}`;

/**
 * __useArticleIndexingInfosQuery__
 *
 * To run a query within a React component, call `useArticleIndexingInfosQuery` and pass it any options that fit your needs.
 * When your component renders, `useArticleIndexingInfosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useArticleIndexingInfosQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useArticleIndexingInfosQuery(baseOptions: Apollo.QueryHookOptions<ArticleIndexingInfosQuery, ArticleIndexingInfosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ArticleIndexingInfosQuery, ArticleIndexingInfosQueryVariables>(ArticleIndexingInfosDocument, options);
      }
export function useArticleIndexingInfosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ArticleIndexingInfosQuery, ArticleIndexingInfosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ArticleIndexingInfosQuery, ArticleIndexingInfosQueryVariables>(ArticleIndexingInfosDocument, options);
        }
export type ArticleIndexingInfosQueryHookResult = ReturnType<typeof useArticleIndexingInfosQuery>;
export type ArticleIndexingInfosLazyQueryHookResult = ReturnType<typeof useArticleIndexingInfosLazyQuery>;
export type ArticleIndexingInfosQueryResult = Apollo.QueryResult<ArticleIndexingInfosQuery, ArticleIndexingInfosQueryVariables>;
export function refetchArticleIndexingInfosQuery(variables: ArticleIndexingInfosQueryVariables) {
      return { query: ArticleIndexingInfosDocument, variables: variables }
    }
export const SiteScrapingRunsDocument = gql`
    query SiteScrapingRuns($spaceId: String!, $websiteScrapingInfoId: String!) {
  siteScrapingRuns(
    spaceId: $spaceId
    websiteScrapingInfoId: $websiteScrapingInfoId
  ) {
    ...SiteScrapingRunFragment
  }
}
    ${SiteScrapingRunFragmentFragmentDoc}`;

/**
 * __useSiteScrapingRunsQuery__
 *
 * To run a query within a React component, call `useSiteScrapingRunsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSiteScrapingRunsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSiteScrapingRunsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      websiteScrapingInfoId: // value for 'websiteScrapingInfoId'
 *   },
 * });
 */
export function useSiteScrapingRunsQuery(baseOptions: Apollo.QueryHookOptions<SiteScrapingRunsQuery, SiteScrapingRunsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SiteScrapingRunsQuery, SiteScrapingRunsQueryVariables>(SiteScrapingRunsDocument, options);
      }
export function useSiteScrapingRunsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SiteScrapingRunsQuery, SiteScrapingRunsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SiteScrapingRunsQuery, SiteScrapingRunsQueryVariables>(SiteScrapingRunsDocument, options);
        }
export type SiteScrapingRunsQueryHookResult = ReturnType<typeof useSiteScrapingRunsQuery>;
export type SiteScrapingRunsLazyQueryHookResult = ReturnType<typeof useSiteScrapingRunsLazyQuery>;
export type SiteScrapingRunsQueryResult = Apollo.QueryResult<SiteScrapingRunsQuery, SiteScrapingRunsQueryVariables>;
export function refetchSiteScrapingRunsQuery(variables: SiteScrapingRunsQueryVariables) {
      return { query: SiteScrapingRunsDocument, variables: variables }
    }
export const ScrapedUrlInfosDocument = gql`
    query ScrapedUrlInfos($spaceId: String!, $websiteScrapingInfoId: String!) {
  scrapedUrlInfos(
    spaceId: $spaceId
    websiteScrapingInfoId: $websiteScrapingInfoId
  ) {
    ...ScrapedUrlInfoFragment
  }
}
    ${ScrapedUrlInfoFragmentFragmentDoc}`;

/**
 * __useScrapedUrlInfosQuery__
 *
 * To run a query within a React component, call `useScrapedUrlInfosQuery` and pass it any options that fit your needs.
 * When your component renders, `useScrapedUrlInfosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useScrapedUrlInfosQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      websiteScrapingInfoId: // value for 'websiteScrapingInfoId'
 *   },
 * });
 */
export function useScrapedUrlInfosQuery(baseOptions: Apollo.QueryHookOptions<ScrapedUrlInfosQuery, ScrapedUrlInfosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ScrapedUrlInfosQuery, ScrapedUrlInfosQueryVariables>(ScrapedUrlInfosDocument, options);
      }
export function useScrapedUrlInfosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ScrapedUrlInfosQuery, ScrapedUrlInfosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ScrapedUrlInfosQuery, ScrapedUrlInfosQueryVariables>(ScrapedUrlInfosDocument, options);
        }
export type ScrapedUrlInfosQueryHookResult = ReturnType<typeof useScrapedUrlInfosQuery>;
export type ScrapedUrlInfosLazyQueryHookResult = ReturnType<typeof useScrapedUrlInfosLazyQuery>;
export type ScrapedUrlInfosQueryResult = Apollo.QueryResult<ScrapedUrlInfosQuery, ScrapedUrlInfosQueryVariables>;
export function refetchScrapedUrlInfosQuery(variables: ScrapedUrlInfosQueryVariables) {
      return { query: ScrapedUrlInfosDocument, variables: variables }
    }
export const TriggerNewDiscourseIndexRunDocument = gql`
    mutation TriggerNewDiscourseIndexRun($spaceId: String!) {
  triggerNewDiscourseIndexRun(spaceId: $spaceId) {
    ...DiscourseIndexRunFragment
  }
}
    ${DiscourseIndexRunFragmentFragmentDoc}`;
export type TriggerNewDiscourseIndexRunMutationFn = Apollo.MutationFunction<TriggerNewDiscourseIndexRunMutation, TriggerNewDiscourseIndexRunMutationVariables>;

/**
 * __useTriggerNewDiscourseIndexRunMutation__
 *
 * To run a mutation, you first call `useTriggerNewDiscourseIndexRunMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTriggerNewDiscourseIndexRunMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [triggerNewDiscourseIndexRunMutation, { data, loading, error }] = useTriggerNewDiscourseIndexRunMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useTriggerNewDiscourseIndexRunMutation(baseOptions?: Apollo.MutationHookOptions<TriggerNewDiscourseIndexRunMutation, TriggerNewDiscourseIndexRunMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TriggerNewDiscourseIndexRunMutation, TriggerNewDiscourseIndexRunMutationVariables>(TriggerNewDiscourseIndexRunDocument, options);
      }
export type TriggerNewDiscourseIndexRunMutationHookResult = ReturnType<typeof useTriggerNewDiscourseIndexRunMutation>;
export type TriggerNewDiscourseIndexRunMutationResult = Apollo.MutationResult<TriggerNewDiscourseIndexRunMutation>;
export type TriggerNewDiscourseIndexRunMutationOptions = Apollo.BaseMutationOptions<TriggerNewDiscourseIndexRunMutation, TriggerNewDiscourseIndexRunMutationVariables>;
export const UpdateIndexWithAllDiscordPostsDocument = gql`
    mutation UpdateIndexWithAllDiscordPosts($spaceId: String!) {
  updateIndexWithAllDiscordPosts(spaceId: $spaceId)
}
    `;
export type UpdateIndexWithAllDiscordPostsMutationFn = Apollo.MutationFunction<UpdateIndexWithAllDiscordPostsMutation, UpdateIndexWithAllDiscordPostsMutationVariables>;

/**
 * __useUpdateIndexWithAllDiscordPostsMutation__
 *
 * To run a mutation, you first call `useUpdateIndexWithAllDiscordPostsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIndexWithAllDiscordPostsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIndexWithAllDiscordPostsMutation, { data, loading, error }] = useUpdateIndexWithAllDiscordPostsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useUpdateIndexWithAllDiscordPostsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateIndexWithAllDiscordPostsMutation, UpdateIndexWithAllDiscordPostsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateIndexWithAllDiscordPostsMutation, UpdateIndexWithAllDiscordPostsMutationVariables>(UpdateIndexWithAllDiscordPostsDocument, options);
      }
export type UpdateIndexWithAllDiscordPostsMutationHookResult = ReturnType<typeof useUpdateIndexWithAllDiscordPostsMutation>;
export type UpdateIndexWithAllDiscordPostsMutationResult = Apollo.MutationResult<UpdateIndexWithAllDiscordPostsMutation>;
export type UpdateIndexWithAllDiscordPostsMutationOptions = Apollo.BaseMutationOptions<UpdateIndexWithAllDiscordPostsMutation, UpdateIndexWithAllDiscordPostsMutationVariables>;
export const IndexNeedsIndexingDiscoursePostsDocument = gql`
    mutation IndexNeedsIndexingDiscoursePosts($spaceId: String!) {
  indexNeedsIndexingDiscoursePosts(spaceId: $spaceId) {
    ...DiscourseIndexRunFragment
  }
}
    ${DiscourseIndexRunFragmentFragmentDoc}`;
export type IndexNeedsIndexingDiscoursePostsMutationFn = Apollo.MutationFunction<IndexNeedsIndexingDiscoursePostsMutation, IndexNeedsIndexingDiscoursePostsMutationVariables>;

/**
 * __useIndexNeedsIndexingDiscoursePostsMutation__
 *
 * To run a mutation, you first call `useIndexNeedsIndexingDiscoursePostsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIndexNeedsIndexingDiscoursePostsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [indexNeedsIndexingDiscoursePostsMutation, { data, loading, error }] = useIndexNeedsIndexingDiscoursePostsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useIndexNeedsIndexingDiscoursePostsMutation(baseOptions?: Apollo.MutationHookOptions<IndexNeedsIndexingDiscoursePostsMutation, IndexNeedsIndexingDiscoursePostsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<IndexNeedsIndexingDiscoursePostsMutation, IndexNeedsIndexingDiscoursePostsMutationVariables>(IndexNeedsIndexingDiscoursePostsDocument, options);
      }
export type IndexNeedsIndexingDiscoursePostsMutationHookResult = ReturnType<typeof useIndexNeedsIndexingDiscoursePostsMutation>;
export type IndexNeedsIndexingDiscoursePostsMutationResult = Apollo.MutationResult<IndexNeedsIndexingDiscoursePostsMutation>;
export type IndexNeedsIndexingDiscoursePostsMutationOptions = Apollo.BaseMutationOptions<IndexNeedsIndexingDiscoursePostsMutation, IndexNeedsIndexingDiscoursePostsMutationVariables>;
export const ReFetchDiscordServersDocument = gql`
    mutation ReFetchDiscordServers {
  reFetchDiscordServers {
    ...DiscordServerFragment
  }
}
    ${DiscordServerFragmentFragmentDoc}`;
export type ReFetchDiscordServersMutationFn = Apollo.MutationFunction<ReFetchDiscordServersMutation, ReFetchDiscordServersMutationVariables>;

/**
 * __useReFetchDiscordServersMutation__
 *
 * To run a mutation, you first call `useReFetchDiscordServersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReFetchDiscordServersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reFetchDiscordServersMutation, { data, loading, error }] = useReFetchDiscordServersMutation({
 *   variables: {
 *   },
 * });
 */
export function useReFetchDiscordServersMutation(baseOptions?: Apollo.MutationHookOptions<ReFetchDiscordServersMutation, ReFetchDiscordServersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReFetchDiscordServersMutation, ReFetchDiscordServersMutationVariables>(ReFetchDiscordServersDocument, options);
      }
export type ReFetchDiscordServersMutationHookResult = ReturnType<typeof useReFetchDiscordServersMutation>;
export type ReFetchDiscordServersMutationResult = Apollo.MutationResult<ReFetchDiscordServersMutation>;
export type ReFetchDiscordServersMutationOptions = Apollo.BaseMutationOptions<ReFetchDiscordServersMutation, ReFetchDiscordServersMutationVariables>;
export const ReFetchDiscordChannelsDocument = gql`
    mutation ReFetchDiscordChannels($spaceId: String!, $serverId: String!) {
  reFetchDiscordChannels(spaceId: $spaceId, serverId: $serverId) {
    ...DiscordChannelFragment
  }
}
    ${DiscordChannelFragmentFragmentDoc}`;
export type ReFetchDiscordChannelsMutationFn = Apollo.MutationFunction<ReFetchDiscordChannelsMutation, ReFetchDiscordChannelsMutationVariables>;

/**
 * __useReFetchDiscordChannelsMutation__
 *
 * To run a mutation, you first call `useReFetchDiscordChannelsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReFetchDiscordChannelsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reFetchDiscordChannelsMutation, { data, loading, error }] = useReFetchDiscordChannelsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      serverId: // value for 'serverId'
 *   },
 * });
 */
export function useReFetchDiscordChannelsMutation(baseOptions?: Apollo.MutationHookOptions<ReFetchDiscordChannelsMutation, ReFetchDiscordChannelsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReFetchDiscordChannelsMutation, ReFetchDiscordChannelsMutationVariables>(ReFetchDiscordChannelsDocument, options);
      }
export type ReFetchDiscordChannelsMutationHookResult = ReturnType<typeof useReFetchDiscordChannelsMutation>;
export type ReFetchDiscordChannelsMutationResult = Apollo.MutationResult<ReFetchDiscordChannelsMutation>;
export type ReFetchDiscordChannelsMutationOptions = Apollo.BaseMutationOptions<ReFetchDiscordChannelsMutation, ReFetchDiscordChannelsMutationVariables>;
export const ReFetchDiscordMessagesDocument = gql`
    mutation ReFetchDiscordMessages($spaceId: String!, $channelId: String!) {
  reFetchDiscordMessages(spaceId: $spaceId, channelId: $channelId)
}
    `;
export type ReFetchDiscordMessagesMutationFn = Apollo.MutationFunction<ReFetchDiscordMessagesMutation, ReFetchDiscordMessagesMutationVariables>;

/**
 * __useReFetchDiscordMessagesMutation__
 *
 * To run a mutation, you first call `useReFetchDiscordMessagesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReFetchDiscordMessagesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reFetchDiscordMessagesMutation, { data, loading, error }] = useReFetchDiscordMessagesMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      channelId: // value for 'channelId'
 *   },
 * });
 */
export function useReFetchDiscordMessagesMutation(baseOptions?: Apollo.MutationHookOptions<ReFetchDiscordMessagesMutation, ReFetchDiscordMessagesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReFetchDiscordMessagesMutation, ReFetchDiscordMessagesMutationVariables>(ReFetchDiscordMessagesDocument, options);
      }
export type ReFetchDiscordMessagesMutationHookResult = ReturnType<typeof useReFetchDiscordMessagesMutation>;
export type ReFetchDiscordMessagesMutationResult = Apollo.MutationResult<ReFetchDiscordMessagesMutation>;
export type ReFetchDiscordMessagesMutationOptions = Apollo.BaseMutationOptions<ReFetchDiscordMessagesMutation, ReFetchDiscordMessagesMutationVariables>;
export const UpdateIndexingOfDiscordChannelDocument = gql`
    mutation UpdateIndexingOfDiscordChannel($spaceId: String!, $channelId: String!, $shouldIndex: Boolean!) {
  updateIndexingOfDiscordChannel(
    spaceId: $spaceId
    channelId: $channelId
    shouldIndex: $shouldIndex
  ) {
    ...DiscordChannelFragment
  }
}
    ${DiscordChannelFragmentFragmentDoc}`;
export type UpdateIndexingOfDiscordChannelMutationFn = Apollo.MutationFunction<UpdateIndexingOfDiscordChannelMutation, UpdateIndexingOfDiscordChannelMutationVariables>;

/**
 * __useUpdateIndexingOfDiscordChannelMutation__
 *
 * To run a mutation, you first call `useUpdateIndexingOfDiscordChannelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIndexingOfDiscordChannelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIndexingOfDiscordChannelMutation, { data, loading, error }] = useUpdateIndexingOfDiscordChannelMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      channelId: // value for 'channelId'
 *      shouldIndex: // value for 'shouldIndex'
 *   },
 * });
 */
export function useUpdateIndexingOfDiscordChannelMutation(baseOptions?: Apollo.MutationHookOptions<UpdateIndexingOfDiscordChannelMutation, UpdateIndexingOfDiscordChannelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateIndexingOfDiscordChannelMutation, UpdateIndexingOfDiscordChannelMutationVariables>(UpdateIndexingOfDiscordChannelDocument, options);
      }
export type UpdateIndexingOfDiscordChannelMutationHookResult = ReturnType<typeof useUpdateIndexingOfDiscordChannelMutation>;
export type UpdateIndexingOfDiscordChannelMutationResult = Apollo.MutationResult<UpdateIndexingOfDiscordChannelMutation>;
export type UpdateIndexingOfDiscordChannelMutationOptions = Apollo.BaseMutationOptions<UpdateIndexingOfDiscordChannelMutation, UpdateIndexingOfDiscordChannelMutationVariables>;
export const IndexDiscoursePostDocument = gql`
    mutation IndexDiscoursePost($spaceId: String!, $postId: String!) {
  indexDiscoursePost(spaceId: $spaceId, postId: $postId)
}
    `;
export type IndexDiscoursePostMutationFn = Apollo.MutationFunction<IndexDiscoursePostMutation, IndexDiscoursePostMutationVariables>;

/**
 * __useIndexDiscoursePostMutation__
 *
 * To run a mutation, you first call `useIndexDiscoursePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIndexDiscoursePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [indexDiscoursePostMutation, { data, loading, error }] = useIndexDiscoursePostMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useIndexDiscoursePostMutation(baseOptions?: Apollo.MutationHookOptions<IndexDiscoursePostMutation, IndexDiscoursePostMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<IndexDiscoursePostMutation, IndexDiscoursePostMutationVariables>(IndexDiscoursePostDocument, options);
      }
export type IndexDiscoursePostMutationHookResult = ReturnType<typeof useIndexDiscoursePostMutation>;
export type IndexDiscoursePostMutationResult = Apollo.MutationResult<IndexDiscoursePostMutation>;
export type IndexDiscoursePostMutationOptions = Apollo.BaseMutationOptions<IndexDiscoursePostMutation, IndexDiscoursePostMutationVariables>;
export const CreateWebsiteScrapingInfoDocument = gql`
    mutation CreateWebsiteScrapingInfo($spaceId: String!, $baseUrl: String!, $scrapingStartUrl: String!, $ignoreHashInUrl: Boolean!, $ignoreQueryParams: Boolean!) {
  createWebsiteScrapingInfo(
    spaceId: $spaceId
    baseUrl: $baseUrl
    scrapingStartUrl: $scrapingStartUrl
    ignoreHashInUrl: $ignoreHashInUrl
    ignoreQueryParams: $ignoreQueryParams
  ) {
    ...WebsiteScrapingInfo
  }
}
    ${WebsiteScrapingInfoFragmentDoc}`;
export type CreateWebsiteScrapingInfoMutationFn = Apollo.MutationFunction<CreateWebsiteScrapingInfoMutation, CreateWebsiteScrapingInfoMutationVariables>;

/**
 * __useCreateWebsiteScrapingInfoMutation__
 *
 * To run a mutation, you first call `useCreateWebsiteScrapingInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWebsiteScrapingInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWebsiteScrapingInfoMutation, { data, loading, error }] = useCreateWebsiteScrapingInfoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      baseUrl: // value for 'baseUrl'
 *      scrapingStartUrl: // value for 'scrapingStartUrl'
 *      ignoreHashInUrl: // value for 'ignoreHashInUrl'
 *      ignoreQueryParams: // value for 'ignoreQueryParams'
 *   },
 * });
 */
export function useCreateWebsiteScrapingInfoMutation(baseOptions?: Apollo.MutationHookOptions<CreateWebsiteScrapingInfoMutation, CreateWebsiteScrapingInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWebsiteScrapingInfoMutation, CreateWebsiteScrapingInfoMutationVariables>(CreateWebsiteScrapingInfoDocument, options);
      }
export type CreateWebsiteScrapingInfoMutationHookResult = ReturnType<typeof useCreateWebsiteScrapingInfoMutation>;
export type CreateWebsiteScrapingInfoMutationResult = Apollo.MutationResult<CreateWebsiteScrapingInfoMutation>;
export type CreateWebsiteScrapingInfoMutationOptions = Apollo.BaseMutationOptions<CreateWebsiteScrapingInfoMutation, CreateWebsiteScrapingInfoMutationVariables>;
export const EditWebsiteScrapingInfoDocument = gql`
    mutation EditWebsiteScrapingInfo($spaceId: String!, $websiteScrapingInfoId: String!, $baseUrl: String!, $scrapingStartUrl: String!, $ignoreHashInUrl: Boolean!, $ignoreQueryParams: Boolean!) {
  editWebsiteScrapingInfo(
    spaceId: $spaceId
    websiteScrapingInfoId: $websiteScrapingInfoId
    baseUrl: $baseUrl
    scrapingStartUrl: $scrapingStartUrl
    ignoreHashInUrl: $ignoreHashInUrl
    ignoreQueryParams: $ignoreQueryParams
  ) {
    ...WebsiteScrapingInfo
  }
}
    ${WebsiteScrapingInfoFragmentDoc}`;
export type EditWebsiteScrapingInfoMutationFn = Apollo.MutationFunction<EditWebsiteScrapingInfoMutation, EditWebsiteScrapingInfoMutationVariables>;

/**
 * __useEditWebsiteScrapingInfoMutation__
 *
 * To run a mutation, you first call `useEditWebsiteScrapingInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditWebsiteScrapingInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editWebsiteScrapingInfoMutation, { data, loading, error }] = useEditWebsiteScrapingInfoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      websiteScrapingInfoId: // value for 'websiteScrapingInfoId'
 *      baseUrl: // value for 'baseUrl'
 *      scrapingStartUrl: // value for 'scrapingStartUrl'
 *      ignoreHashInUrl: // value for 'ignoreHashInUrl'
 *      ignoreQueryParams: // value for 'ignoreQueryParams'
 *   },
 * });
 */
export function useEditWebsiteScrapingInfoMutation(baseOptions?: Apollo.MutationHookOptions<EditWebsiteScrapingInfoMutation, EditWebsiteScrapingInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditWebsiteScrapingInfoMutation, EditWebsiteScrapingInfoMutationVariables>(EditWebsiteScrapingInfoDocument, options);
      }
export type EditWebsiteScrapingInfoMutationHookResult = ReturnType<typeof useEditWebsiteScrapingInfoMutation>;
export type EditWebsiteScrapingInfoMutationResult = Apollo.MutationResult<EditWebsiteScrapingInfoMutation>;
export type EditWebsiteScrapingInfoMutationOptions = Apollo.BaseMutationOptions<EditWebsiteScrapingInfoMutation, EditWebsiteScrapingInfoMutationVariables>;
export const TriggerSiteScrapingRunDocument = gql`
    mutation TriggerSiteScrapingRun($spaceId: String!, $websiteScrapingInfoId: String!) {
  triggerSiteScrapingRun(
    spaceId: $spaceId
    websiteScrapingInfoId: $websiteScrapingInfoId
  ) {
    ...SiteScrapingRunFragment
  }
}
    ${SiteScrapingRunFragmentFragmentDoc}`;
export type TriggerSiteScrapingRunMutationFn = Apollo.MutationFunction<TriggerSiteScrapingRunMutation, TriggerSiteScrapingRunMutationVariables>;

/**
 * __useTriggerSiteScrapingRunMutation__
 *
 * To run a mutation, you first call `useTriggerSiteScrapingRunMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTriggerSiteScrapingRunMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [triggerSiteScrapingRunMutation, { data, loading, error }] = useTriggerSiteScrapingRunMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      websiteScrapingInfoId: // value for 'websiteScrapingInfoId'
 *   },
 * });
 */
export function useTriggerSiteScrapingRunMutation(baseOptions?: Apollo.MutationHookOptions<TriggerSiteScrapingRunMutation, TriggerSiteScrapingRunMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TriggerSiteScrapingRunMutation, TriggerSiteScrapingRunMutationVariables>(TriggerSiteScrapingRunDocument, options);
      }
export type TriggerSiteScrapingRunMutationHookResult = ReturnType<typeof useTriggerSiteScrapingRunMutation>;
export type TriggerSiteScrapingRunMutationResult = Apollo.MutationResult<TriggerSiteScrapingRunMutation>;
export type TriggerSiteScrapingRunMutationOptions = Apollo.BaseMutationOptions<TriggerSiteScrapingRunMutation, TriggerSiteScrapingRunMutationVariables>;
export const CreateArticleIndexingInfoDocument = gql`
    mutation CreateArticleIndexingInfo($spaceId: String!, $articleUrl: String!) {
  createArticleIndexingInfo(spaceId: $spaceId, articleUrl: $articleUrl) {
    ...ArticleIndexingInfo
  }
}
    ${ArticleIndexingInfoFragmentDoc}`;
export type CreateArticleIndexingInfoMutationFn = Apollo.MutationFunction<CreateArticleIndexingInfoMutation, CreateArticleIndexingInfoMutationVariables>;

/**
 * __useCreateArticleIndexingInfoMutation__
 *
 * To run a mutation, you first call `useCreateArticleIndexingInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateArticleIndexingInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createArticleIndexingInfoMutation, { data, loading, error }] = useCreateArticleIndexingInfoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      articleUrl: // value for 'articleUrl'
 *   },
 * });
 */
export function useCreateArticleIndexingInfoMutation(baseOptions?: Apollo.MutationHookOptions<CreateArticleIndexingInfoMutation, CreateArticleIndexingInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateArticleIndexingInfoMutation, CreateArticleIndexingInfoMutationVariables>(CreateArticleIndexingInfoDocument, options);
      }
export type CreateArticleIndexingInfoMutationHookResult = ReturnType<typeof useCreateArticleIndexingInfoMutation>;
export type CreateArticleIndexingInfoMutationResult = Apollo.MutationResult<CreateArticleIndexingInfoMutation>;
export type CreateArticleIndexingInfoMutationOptions = Apollo.BaseMutationOptions<CreateArticleIndexingInfoMutation, CreateArticleIndexingInfoMutationVariables>;
export const EditArticleIndexingInfoDocument = gql`
    mutation EditArticleIndexingInfo($spaceId: String!, $articleIndexingInfoId: String!, $articleUrl: String!) {
  editArticleIndexingInfo(
    spaceId: $spaceId
    articleIndexingInfoId: $articleIndexingInfoId
    articleUrl: $articleUrl
  ) {
    ...ArticleIndexingInfo
  }
}
    ${ArticleIndexingInfoFragmentDoc}`;
export type EditArticleIndexingInfoMutationFn = Apollo.MutationFunction<EditArticleIndexingInfoMutation, EditArticleIndexingInfoMutationVariables>;

/**
 * __useEditArticleIndexingInfoMutation__
 *
 * To run a mutation, you first call `useEditArticleIndexingInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditArticleIndexingInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editArticleIndexingInfoMutation, { data, loading, error }] = useEditArticleIndexingInfoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      articleIndexingInfoId: // value for 'articleIndexingInfoId'
 *      articleUrl: // value for 'articleUrl'
 *   },
 * });
 */
export function useEditArticleIndexingInfoMutation(baseOptions?: Apollo.MutationHookOptions<EditArticleIndexingInfoMutation, EditArticleIndexingInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditArticleIndexingInfoMutation, EditArticleIndexingInfoMutationVariables>(EditArticleIndexingInfoDocument, options);
      }
export type EditArticleIndexingInfoMutationHookResult = ReturnType<typeof useEditArticleIndexingInfoMutation>;
export type EditArticleIndexingInfoMutationResult = Apollo.MutationResult<EditArticleIndexingInfoMutation>;
export type EditArticleIndexingInfoMutationOptions = Apollo.BaseMutationOptions<EditArticleIndexingInfoMutation, EditArticleIndexingInfoMutationVariables>;
export const AnnotateDiscoursePostDocument = gql`
    mutation AnnotateDiscoursePost($spaceId: String!, $input: AnnotateDiscoursePostInput!) {
  annotateDiscoursePost(spaceId: $spaceId, input: $input) {
    ...DiscoursePost
  }
}
    ${DiscoursePostFragmentDoc}`;
export type AnnotateDiscoursePostMutationFn = Apollo.MutationFunction<AnnotateDiscoursePostMutation, AnnotateDiscoursePostMutationVariables>;

/**
 * __useAnnotateDiscoursePostMutation__
 *
 * To run a mutation, you first call `useAnnotateDiscoursePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAnnotateDiscoursePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [annotateDiscoursePostMutation, { data, loading, error }] = useAnnotateDiscoursePostMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAnnotateDiscoursePostMutation(baseOptions?: Apollo.MutationHookOptions<AnnotateDiscoursePostMutation, AnnotateDiscoursePostMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AnnotateDiscoursePostMutation, AnnotateDiscoursePostMutationVariables>(AnnotateDiscoursePostDocument, options);
      }
export type AnnotateDiscoursePostMutationHookResult = ReturnType<typeof useAnnotateDiscoursePostMutation>;
export type AnnotateDiscoursePostMutationResult = Apollo.MutationResult<AnnotateDiscoursePostMutation>;
export type AnnotateDiscoursePostMutationOptions = Apollo.BaseMutationOptions<AnnotateDiscoursePostMutation, AnnotateDiscoursePostMutationVariables>;
export const UpsertSummaryOfDiscoursePostDocument = gql`
    mutation UpsertSummaryOfDiscoursePost($spaceId: String!, $input: UpsertSummaryOfDiscoursePostInput!) {
  upsertSummaryOfDiscoursePost(spaceId: $spaceId, input: $input) {
    ...DiscoursePost
  }
}
    ${DiscoursePostFragmentDoc}`;
export type UpsertSummaryOfDiscoursePostMutationFn = Apollo.MutationFunction<UpsertSummaryOfDiscoursePostMutation, UpsertSummaryOfDiscoursePostMutationVariables>;

/**
 * __useUpsertSummaryOfDiscoursePostMutation__
 *
 * To run a mutation, you first call `useUpsertSummaryOfDiscoursePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSummaryOfDiscoursePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSummaryOfDiscoursePostMutation, { data, loading, error }] = useUpsertSummaryOfDiscoursePostMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertSummaryOfDiscoursePostMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSummaryOfDiscoursePostMutation, UpsertSummaryOfDiscoursePostMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSummaryOfDiscoursePostMutation, UpsertSummaryOfDiscoursePostMutationVariables>(UpsertSummaryOfDiscoursePostDocument, options);
      }
export type UpsertSummaryOfDiscoursePostMutationHookResult = ReturnType<typeof useUpsertSummaryOfDiscoursePostMutation>;
export type UpsertSummaryOfDiscoursePostMutationResult = Apollo.MutationResult<UpsertSummaryOfDiscoursePostMutation>;
export type UpsertSummaryOfDiscoursePostMutationOptions = Apollo.BaseMutationOptions<UpsertSummaryOfDiscoursePostMutation, UpsertSummaryOfDiscoursePostMutationVariables>;
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
export const DropPineconeNamespaceDocument = gql`
    mutation DropPineconeNamespace($spaceId: String!) {
  dropPineconeNamespace(spaceId: $spaceId)
}
    `;
export type DropPineconeNamespaceMutationFn = Apollo.MutationFunction<DropPineconeNamespaceMutation, DropPineconeNamespaceMutationVariables>;

/**
 * __useDropPineconeNamespaceMutation__
 *
 * To run a mutation, you first call `useDropPineconeNamespaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDropPineconeNamespaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [dropPineconeNamespaceMutation, { data, loading, error }] = useDropPineconeNamespaceMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useDropPineconeNamespaceMutation(baseOptions?: Apollo.MutationHookOptions<DropPineconeNamespaceMutation, DropPineconeNamespaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DropPineconeNamespaceMutation, DropPineconeNamespaceMutationVariables>(DropPineconeNamespaceDocument, options);
      }
export type DropPineconeNamespaceMutationHookResult = ReturnType<typeof useDropPineconeNamespaceMutation>;
export type DropPineconeNamespaceMutationResult = Apollo.MutationResult<DropPineconeNamespaceMutation>;
export type DropPineconeNamespaceMutationOptions = Apollo.BaseMutationOptions<DropPineconeNamespaceMutation, DropPineconeNamespaceMutationVariables>;
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
export const ReloadAcademyRepoDocument = gql`
    mutation ReloadAcademyRepo($spaceId: String!) {
  reloadAcademyRepository(spaceId: $spaceId)
}
    `;
export type ReloadAcademyRepoMutationFn = Apollo.MutationFunction<ReloadAcademyRepoMutation, ReloadAcademyRepoMutationVariables>;

/**
 * __useReloadAcademyRepoMutation__
 *
 * To run a mutation, you first call `useReloadAcademyRepoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReloadAcademyRepoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reloadAcademyRepoMutation, { data, loading, error }] = useReloadAcademyRepoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useReloadAcademyRepoMutation(baseOptions?: Apollo.MutationHookOptions<ReloadAcademyRepoMutation, ReloadAcademyRepoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReloadAcademyRepoMutation, ReloadAcademyRepoMutationVariables>(ReloadAcademyRepoDocument, options);
      }
export type ReloadAcademyRepoMutationHookResult = ReturnType<typeof useReloadAcademyRepoMutation>;
export type ReloadAcademyRepoMutationResult = Apollo.MutationResult<ReloadAcademyRepoMutation>;
export type ReloadAcademyRepoMutationOptions = Apollo.BaseMutationOptions<ReloadAcademyRepoMutation, ReloadAcademyRepoMutationVariables>;
export const UpdateSpaceGuideSettingsDocument = gql`
    mutation UpdateSpaceGuideSettings($spaceId: String!, $input: GuideSettingsInput!) {
  payload: updateGuideSettings(spaceId: $spaceId, input: $input) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type UpdateSpaceGuideSettingsMutationFn = Apollo.MutationFunction<UpdateSpaceGuideSettingsMutation, UpdateSpaceGuideSettingsMutationVariables>;

/**
 * __useUpdateSpaceGuideSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceGuideSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceGuideSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceGuideSettingsMutation, { data, loading, error }] = useUpdateSpaceGuideSettingsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSpaceGuideSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSpaceGuideSettingsMutation, UpdateSpaceGuideSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSpaceGuideSettingsMutation, UpdateSpaceGuideSettingsMutationVariables>(UpdateSpaceGuideSettingsDocument, options);
      }
export type UpdateSpaceGuideSettingsMutationHookResult = ReturnType<typeof useUpdateSpaceGuideSettingsMutation>;
export type UpdateSpaceGuideSettingsMutationResult = Apollo.MutationResult<UpdateSpaceGuideSettingsMutation>;
export type UpdateSpaceGuideSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateSpaceGuideSettingsMutation, UpdateSpaceGuideSettingsMutationVariables>;
export const UpdateSpaceAuthSettingsDocument = gql`
    mutation UpdateSpaceAuthSettings($spaceId: String!, $input: AuthSettingsInput!) {
  payload: updateAuthSettings(spaceId: $spaceId, input: $input) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type UpdateSpaceAuthSettingsMutationFn = Apollo.MutationFunction<UpdateSpaceAuthSettingsMutation, UpdateSpaceAuthSettingsMutationVariables>;

/**
 * __useUpdateSpaceAuthSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceAuthSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceAuthSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceAuthSettingsMutation, { data, loading, error }] = useUpdateSpaceAuthSettingsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSpaceAuthSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSpaceAuthSettingsMutation, UpdateSpaceAuthSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSpaceAuthSettingsMutation, UpdateSpaceAuthSettingsMutationVariables>(UpdateSpaceAuthSettingsDocument, options);
      }
export type UpdateSpaceAuthSettingsMutationHookResult = ReturnType<typeof useUpdateSpaceAuthSettingsMutation>;
export type UpdateSpaceAuthSettingsMutationResult = Apollo.MutationResult<UpdateSpaceAuthSettingsMutation>;
export type UpdateSpaceAuthSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateSpaceAuthSettingsMutation, UpdateSpaceAuthSettingsMutationVariables>;
export const UpdateSpaceSocialSettingsDocument = gql`
    mutation UpdateSpaceSocialSettings($spaceId: String!, $input: SocialSettingsInput!) {
  payload: updateSocialSettings(spaceId: $spaceId, input: $input) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type UpdateSpaceSocialSettingsMutationFn = Apollo.MutationFunction<UpdateSpaceSocialSettingsMutation, UpdateSpaceSocialSettingsMutationVariables>;

/**
 * __useUpdateSpaceSocialSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceSocialSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceSocialSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceSocialSettingsMutation, { data, loading, error }] = useUpdateSpaceSocialSettingsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSpaceSocialSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSpaceSocialSettingsMutation, UpdateSpaceSocialSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSpaceSocialSettingsMutation, UpdateSpaceSocialSettingsMutationVariables>(UpdateSpaceSocialSettingsDocument, options);
      }
export type UpdateSpaceSocialSettingsMutationHookResult = ReturnType<typeof useUpdateSpaceSocialSettingsMutation>;
export type UpdateSpaceSocialSettingsMutationResult = Apollo.MutationResult<UpdateSpaceSocialSettingsMutation>;
export type UpdateSpaceSocialSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateSpaceSocialSettingsMutation, UpdateSpaceSocialSettingsMutationVariables>;
export const UpdateSpaceByteSettingsDocument = gql`
    mutation UpdateSpaceByteSettings($spaceId: String!, $input: ByteSettingsInput!) {
  payload: updateByteSettings(spaceId: $spaceId, input: $input) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type UpdateSpaceByteSettingsMutationFn = Apollo.MutationFunction<UpdateSpaceByteSettingsMutation, UpdateSpaceByteSettingsMutationVariables>;

/**
 * __useUpdateSpaceByteSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceByteSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceByteSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceByteSettingsMutation, { data, loading, error }] = useUpdateSpaceByteSettingsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSpaceByteSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSpaceByteSettingsMutation, UpdateSpaceByteSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSpaceByteSettingsMutation, UpdateSpaceByteSettingsMutationVariables>(UpdateSpaceByteSettingsDocument, options);
      }
export type UpdateSpaceByteSettingsMutationHookResult = ReturnType<typeof useUpdateSpaceByteSettingsMutation>;
export type UpdateSpaceByteSettingsMutationResult = Apollo.MutationResult<UpdateSpaceByteSettingsMutation>;
export type UpdateSpaceByteSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateSpaceByteSettingsMutation, UpdateSpaceByteSettingsMutationVariables>;
export const SendEmailDocument = gql`
    mutation SendEmail($input: SendEmailInput!) {
  payload: sendEmail(input: $input)
}
    `;
export type SendEmailMutationFn = Apollo.MutationFunction<SendEmailMutation, SendEmailMutationVariables>;

/**
 * __useSendEmailMutation__
 *
 * To run a mutation, you first call `useSendEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendEmailMutation, { data, loading, error }] = useSendEmailMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSendEmailMutation(baseOptions?: Apollo.MutationHookOptions<SendEmailMutation, SendEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendEmailMutation, SendEmailMutationVariables>(SendEmailDocument, options);
      }
export type SendEmailMutationHookResult = ReturnType<typeof useSendEmailMutation>;
export type SendEmailMutationResult = Apollo.MutationResult<SendEmailMutation>;
export type SendEmailMutationOptions = Apollo.BaseMutationOptions<SendEmailMutation, SendEmailMutationVariables>;
export const UpsertSpaceLoaderInfoDocument = gql`
    mutation UpsertSpaceLoaderInfo($spaceId: String!, $input: SpaceLoadersInfoInput!) {
  payload: upsertSpaceLoaderInfo(spaceId: $spaceId, input: $input) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type UpsertSpaceLoaderInfoMutationFn = Apollo.MutationFunction<UpsertSpaceLoaderInfoMutation, UpsertSpaceLoaderInfoMutationVariables>;

/**
 * __useUpsertSpaceLoaderInfoMutation__
 *
 * To run a mutation, you first call `useUpsertSpaceLoaderInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSpaceLoaderInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSpaceLoaderInfoMutation, { data, loading, error }] = useUpsertSpaceLoaderInfoMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertSpaceLoaderInfoMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSpaceLoaderInfoMutation, UpsertSpaceLoaderInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSpaceLoaderInfoMutation, UpsertSpaceLoaderInfoMutationVariables>(UpsertSpaceLoaderInfoDocument, options);
      }
export type UpsertSpaceLoaderInfoMutationHookResult = ReturnType<typeof useUpsertSpaceLoaderInfoMutation>;
export type UpsertSpaceLoaderInfoMutationResult = Apollo.MutationResult<UpsertSpaceLoaderInfoMutation>;
export type UpsertSpaceLoaderInfoMutationOptions = Apollo.BaseMutationOptions<UpsertSpaceLoaderInfoMutation, UpsertSpaceLoaderInfoMutationVariables>;
export const UpdateThemeColorsDocument = gql`
    mutation UpdateThemeColors($spaceId: ID!, $themeColors: ThemeColorsInput!) {
  payload: updateThemeColors(spaceId: $spaceId, themeColors: $themeColors) {
    ...SpaceWithIntegrations
  }
}
    ${SpaceWithIntegrationsFragmentDoc}`;
export type UpdateThemeColorsMutationFn = Apollo.MutationFunction<UpdateThemeColorsMutation, UpdateThemeColorsMutationVariables>;

/**
 * __useUpdateThemeColorsMutation__
 *
 * To run a mutation, you first call `useUpdateThemeColorsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateThemeColorsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateThemeColorsMutation, { data, loading, error }] = useUpdateThemeColorsMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      themeColors: // value for 'themeColors'
 *   },
 * });
 */
export function useUpdateThemeColorsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateThemeColorsMutation, UpdateThemeColorsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateThemeColorsMutation, UpdateThemeColorsMutationVariables>(UpdateThemeColorsDocument, options);
      }
export type UpdateThemeColorsMutationHookResult = ReturnType<typeof useUpdateThemeColorsMutation>;
export type UpdateThemeColorsMutationResult = Apollo.MutationResult<UpdateThemeColorsMutation>;
export type UpdateThemeColorsMutationOptions = Apollo.BaseMutationOptions<UpdateThemeColorsMutation, UpdateThemeColorsMutationVariables>;
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