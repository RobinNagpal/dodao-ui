import {
  ByteFeedback as ByteFeedbackType,
  ByteLinkedinPdfContent as ByteLinkedinPdfContentType,
  ByteStep as GraphqlByteStep,
  ChatbotSubcategory as ChatbotSubcategoryType,
  ClickableDemoStep as ClickableDemoStepType,
  CompletionScreen as CompletionScreenType,
  GuideFeedback as GuideFeedbackType,
  SEOMeta as SEOMetaType,
  TidbitsHomepage as TidbitsHomepageType,
  TimelineEvent as TimelineEventType,
  GuideStepSubmission as GuideStepSubmissionInterface,
} from '@/graphql/generated/generated-types';
import { TempTopicSubmissionModel as TempTopicSubmissionModelInterface } from '@/types/course/submission';
import { CourseTopic as CourseTopicInterface } from '@/types/course/topic';
import { GuideSubmissionResult as GuideSubmissionResultInterface } from '@/types/guide/GuideSubmissionResult';
import { GuidesGitRepository as GuidesGitRepositoryInterface } from '@/types/space/GuidesGitRepository';
import {
  AuthSettingsDto,
  GuideSettingsDto,
  InviteLinksDto,
  SocialSettingsDto,
  SpaceLoadersInfoDto,
  ThemeColorsDto,
  UsernameAndNameDto,
} from '@/types/space/SpaceDto';

declare global {
  namespace PrismaJson {
    // you can use classes, interfaces, types, etc.
    type GuidesGitRepository = GuidesGitRepositoryInterface;
    type GuideSubmissionResult = GuideSubmissionResultInterface;
    type SpaceInviteLinks = InviteLinksDto;
    type TempTopicSubmissionModel = TempTopicSubmissionModelInterface;
    type ByteStep = GraphqlByteStep;
    type AuthSettings = AuthSettingsDto;
    type GuideSettings = GuideSettingsDto;
    type SocialSettings = SocialSettingsDto;
    type ByteLinkedinPdfContent = ByteLinkedinPdfContentType;
    type ByteSettings = SpaceByteSettings;
    type GuideFeedback = GuideFeedbackType;
    type SpaceLoadersInfo = SpaceLoadersInfoDto;
    type GuideStepSubmissionArray = GuideStepSubmissionInterface[];
    type ChatbotSubcategory = ChatbotSubcategoryType;
    type ThemeColors = ThemeColorsDto;
    type UsernameAndName = UsernameAndNameDto;
    type SEOMeta = SEOMetaType;
    type CompletionScreen = CompletionScreenType;
    type TidbitsHomepage = TidbitsHomepageType;
    type ByteFeedback = ByteFeedbackType;
    type ClickableDemoStep = ClickableDemoStepType;
    type TimelineEvent = TimelineEventType;
    type CourseTopics = CourseTopicInterface;
    type SpaceApiKey = SpaceApiKeyType;
  }
}
