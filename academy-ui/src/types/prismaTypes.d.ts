import {
  ByteStep as GraphqlByteStep,
  AuthSettings as SpaceAuthSettings,
  GuideSettings as SpaceGuideSettings,
  SocialSettings as SpaceSocialSettings,
  ByteSettings as SpaceByteSettings,
  GuideFeedback as GuideFeedbackType,
  SpaceLoadersInfo as SpaceLoadersInfoType,
  ChatbotSubcategory as ChatbotSubcategoryType,
  ThemeColors as SpaceThemeColors,
  UsernameAndName as UsernameAndNameType,
  SEOMeta as SEOMetaType,
  CompletionScreen as CompletionScreenType,
  TidbitsHomepage as TidbitsHomepageType,
  ByteFeedback as ByteFeedbackType,
  ClickableDemoStep as ClickableDemoStepType,
} from '@/graphql/generated/graphql';
import { ByteLinkedinPdfContent as ByteLinkedinPdfContentType } from '@/graphql/generated/graphql';
import { TempTopicSubmissionModel as TempTopicSubmissionModelInterface } from '@/types/course/submission';
import { GuideSubmissionResult as GuideSubmissionResultInterface } from '@/types/guide/GuideSubmissionResult';
import { GuidesGitRepository as GuidesGitRepositoryInterface } from '@/types/space/GuidesGitRepository';
import { SpaceInviteLinks as SpaceInviteLinksInterface } from '@/types/space/SpaceInviteLinks';
import { GuideStepSubmission as GuideStepSubmissionInterface } from '@/types/space/SpaceInviteLinks';

declare global {
  namespace PrismaJson {
    // you can use classes, interfaces, types, etc.
    type GuidesGitRepository = GuidesGitRepositoryInterface;
    type GuideSubmissionResult = GuideSubmissionResultInterface;
    type SpaceInviteLinks = SpaceInviteLinksInterface;
    type TempTopicSubmissionModel = TempTopicSubmissionModelInterface;
    type ByteStep = GraphqlByteStep;
    type AuthSettings = SpaceAuthSettings;
    type GuideSettings = SpaceGuideSettings;
    type SocialSettings = SpaceSocialSettings;
    type ByteLinkedinPdfContent = ByteLinkedinPdfContentType;
    type ByteSettings = SpaceByteSettings;
    type GuideFeedback = GuideFeedbackType;
    type SpaceLoadersInfo = SpaceLoadersInfoType;
    type GuideStepSubmissionArray = GuideStepSubmissionInterface[];
    type ChatbotSubcategory = ChatbotSubcategoryType;
    type ThemeColors = SpaceThemeColors;
    type UsernameAndName = UsernameAndNameType;
    type SEOMeta = SEOMetaType;
    type CompletionScreen = CompletionScreenType;
    type TidbitsHomepage = TidbitsHomepageType;
    type ByteFeedback = ByteFeedbackType;
    type ClickableDemoStep = ClickableDemoStepType;
  }
}
