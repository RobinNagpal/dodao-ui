export interface ThemeColors {
  primaryColor: string;
  bgColor: string;
  textColor: string;
  linkColor: string;
  headingColor: string;
  borderColor: string;
  blockBg: string;
}

export interface AuthSettings {
  loginOptions?: Array<string> | null;
  enableLogin?: boolean | null;
}

export type UsernameAndName = {
  username: string;
  nameOfTheUser: string;
};

export type WebCoreSpace = {
  id: string;
  creator: string;
  features: string[];
  name: string;
  avatar?: string | null;
  domains: string[];
  adminUsernamesV1: UsernameAndName[];
  authSettings: AuthSettings;
  themeColors?: ThemeColors | null;
};
