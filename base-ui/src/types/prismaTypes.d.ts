import {
  AuthSettings as SpaceAuthSettings,
  SocialSettings as SpaceSocialSettings,
  ThemeColors as SpaceThemeColors,
  UsernameAndName as UsernameAndNameType,
  SpaceInviteLinks as SpaceInviteLinksInterface,
} from '@dodao/web-core/types/space';

declare global {
  namespace PrismaJson {
    // you can use classes, interfaces, types, etc.
    type SpaceInviteLinks = SpaceInviteLinksInterface;
    type AuthSettings = SpaceAuthSettings;
    type SocialSettings = SpaceSocialSettings;
    type ThemeColors = SpaceThemeColors;
    type UsernameAndName = UsernameAndNameType;
  }
}
