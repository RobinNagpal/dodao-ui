export type ConditionType =
  | "APR_RISE_ABOVE"
  | "APR_FALLS_BELOW"
  | "APR_OUTSIDE_RANGE"
  | "RATE_DIFF_ABOVE"
  | "RATE_DIFF_BELOW";

export type SeverityLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type NotificationFrequency =
  | "IMMEDIATE"
  | "AT_MOST_ONCE_PER_6_HOURS"
  | "AT_MOST_ONCE_PER_12_HOURS"
  | "AT_MOST_ONCE_PER_DAY";

export type DeliveryChannelType = "EMAIL" | "WEBHOOK";

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

export interface ComparisonRow {
  platform: string;
  chain: string;
  market: string;
  threshold: string;
  severity: SeverityLevel;
  frequency: NotificationFrequency;
}

export const severityOptions: { label: string; value: SeverityLevel }[] = [
  { label: "None", value: "NONE" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

export const frequencyOptions: {
  label: string;
  value: NotificationFrequency;
}[] = [
  { label: "Immediate", value: "IMMEDIATE" },
  { label: "Every 6 h", value: "AT_MOST_ONCE_PER_6_HOURS" },
  { label: "Every 12 h", value: "AT_MOST_ONCE_PER_12_HOURS" },
  { label: "Daily", value: "AT_MOST_ONCE_PER_DAY" },
];
