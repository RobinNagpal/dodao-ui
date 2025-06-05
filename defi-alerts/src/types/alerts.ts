export type ConditionType = 'APR_RISE_ABOVE' | 'APR_FALLS_BELOW' | 'APR_OUTSIDE_RANGE' | 'RATE_DIFF_ABOVE' | 'RATE_DIFF_BELOW';

export type SeverityLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export type NotificationFrequency =
  | 'ONCE_PER_ALERT'
  | 'AT_MOST_ONCE_PER_3_HOURS'
  | 'AT_MOST_ONCE_PER_6_HOURS'
  | 'AT_MOST_ONCE_PER_12_HOURS'
  | 'AT_MOST_ONCE_PER_DAY'
  | 'AT_MOST_ONCE_PER_WEEK';

export type DeliveryChannelType = 'EMAIL' | 'WEBHOOK';

export type AlertStatus = 'ACTIVE' | 'PAUSED';

export interface Channel {
  channelType: DeliveryChannelType;
  email?: string;
  webhookUrl?: string;
}

export interface Condition {
  conditionType: ConditionType;
  severity: SeverityLevel;
  thresholdValue?: string;
  thresholdLow?: string;
  thresholdHigh?: string;
}

export interface PrismaCondition {
  conditionType: ConditionType;
  severity: SeverityLevel;
  thresholdValue?: string;
  thresholdValueLow?: string;
  thresholdValueHigh?: string;
}

export interface SupplyRow {
  chain: string;
  market: string;
  rate: string;
  conditionType: ConditionType;
  severity: SeverityLevel;
  frequency: NotificationFrequency;
  threshold?: string;
  thresholdLow?: string;
  thresholdHigh?: string;
}

export interface BorrowRow extends SupplyRow {}

export interface GeneralComparisonRow {
  platform: string;
  chain: string;
  market: string;
  threshold: string;
  severity: SeverityLevel;
  frequency: NotificationFrequency;
}

export interface ComparisonRow {
  platform: string;
  chain: string;
  market: string;
  rate: string;
  threshold: string;
  severity: SeverityLevel;
  frequency: NotificationFrequency;
}

export const severityOptions: { label: string; value: SeverityLevel }[] = [
  { label: 'None', value: 'NONE' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];

export const frequencyOptions: {
  label: string;
  value: NotificationFrequency;
}[] = [
  { label: 'Once per alert condition', value: 'ONCE_PER_ALERT' },
  { label: 'Every 3 h', value: 'AT_MOST_ONCE_PER_3_HOURS' },
  { label: 'Every 6 h', value: 'AT_MOST_ONCE_PER_6_HOURS' },
  { label: 'Every 12 h', value: 'AT_MOST_ONCE_PER_12_HOURS' },
  { label: 'Daily', value: 'AT_MOST_ONCE_PER_DAY' },
  { label: 'Weekly', value: 'AT_MOST_ONCE_PER_WEEK' },
];

export interface Chain {
  chainId: number;
  name: string;
}

export interface Asset {
  chainId_address: string;
  chainId: number;
  symbol: string;
  address: string;
}

export interface Alert {
  id: string;
  category: 'GENERAL' | 'PERSONALIZED';
  actionType: 'SUPPLY' | 'BORROW';
  isComparison: boolean;
  walletAddress?: string | null;
  marketId?: string | null;
  selectedChains: Chain[];
  selectedAssets: Asset[];
  compareProtocols: string[];
  notificationFrequency: NotificationFrequency;
  status: AlertStatus;
  conditions: PrismaCondition[];
  deliveryChannels: Channel[];
  createdAt: string;
  updatedAt: string;
}
