import { ConditionType, NotificationFrequency } from '@prisma/client';
import { SeverityLevel } from '.prisma/client';

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

export interface AlertTriggerValuesInterface {
  chainId?: number;
  chainName: string;
  assetSymbol?: string;
  asset: string;
  assetAddress?: string;
  isComparison?: boolean;
  protocol?: string;
  compoundRate?: number;
  protocolRate?: number;
  diff?: number;
  notificationFrequency: NotificationFrequency;
  currentRate?: number;
  severity?: SeverityLevel;
  condition: {
    type: ConditionType;
    threshold:
      | number
      | {
          low: number;
          high: number;
        };
    alertConditionId: string;
  };
}

declare global {
  namespace PrismaJson {
    type AuthSettings = AuthSettingsDto;
    type ThemeColors = ThemeColorsDto;
    type UsernameAndName = UsernameAndNameDto;
    type AlertTriggerValues = Array<AlertTriggerValuesInterface>;
  }
}
