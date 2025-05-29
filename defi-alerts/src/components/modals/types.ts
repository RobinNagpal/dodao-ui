import { type ConditionType, type NotificationFrequency, type SeverityLevel } from '@/types/alerts';

export type ActionType = 'SUPPLY' | 'BORROW';

export interface BasePosition {
  id: string;
  walletAddress: string;
  chain: string;
  market: string;
  rate: string;
  actionType: ActionType;
  notificationFrequency: NotificationFrequency;
  conditions: Array<{
    id: string;
    conditionType: ConditionType;
    severity: SeverityLevel;
    thresholdValue?: string;
    thresholdLow?: string;
    thresholdHigh?: string;
  }>;
}

export interface WalletPosition extends BasePosition {}

export interface WalletComparisonPosition extends BasePosition {
  platform: string;
}
