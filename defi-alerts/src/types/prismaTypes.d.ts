export interface AuthSettingsDto {
  enableLogin?: boolean;
  loginOptions?: string[];
}

export interface ThemeColorsDto {
  bgColor: string;
  blockBg: string;
  borderColor: string;
  headingColor: string;
  linkColor: string;
  primaryColor: string;
  primaryTextColor: string; // Sometimes the body text can be white but the primary text color is black or vice versa
  textColor: string;
}

export interface UsernameAndNameDto {
  username: string;
  nameOfTheUser: string;
}

declare global {
  namespace PrismaJson {
    type AuthSettings = AuthSettingsDto;
    type ThemeColors = ThemeColorsDto;
    type UsernameAndName = UsernameAndNameDto;
  }
}
