import { AuthSettings as SpaceAuthSettings, ThemeColors as SpaceThemeColors, UsernameAndName as UsernameAndNameTypeArray } from '@dodao/web-core/types/space';

declare global {
  namespace PrismaJson {
    // you can use classes, interfaces, types, etc.
    type AuthSettings = SpaceAuthSettings;
    type ThemeColors = SpaceThemeColors;
    type UsernameAndName = UsernameAndNameTypeArray;
  }
}
