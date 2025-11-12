import { AllExchanges } from '@/utils/countryExchangeUtils';

/** Shared, explicit types used across Add/Edit forms */
export interface TickerFieldsValue {
  exchange: AllExchanges;
  name: string;
  symbol: string;
  websiteUrl: string; // keep empty string if not provided
  stockAnalyzeUrl: string;
}

export interface EditableTickerEntry extends TickerFieldsValue {
  id: string;
}

export interface NewTickerEntry extends TickerFieldsValue {}

/** Utility key for maps/error lookups */
export function buildKey(symbol: string, exchange: AllExchanges): string {
  return `${symbol.toUpperCase()}|${exchange.toUpperCase()}`;
}
