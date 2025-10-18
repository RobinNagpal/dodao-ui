import type { ExchangeId } from '@/utils/exchangeUtils';

/** Shared, explicit types used across Add/Edit forms */

export interface TickerFieldsValue {
  exchange: ExchangeId;
  name: string;
  symbol: string;
  websiteUrl: string; // keep empty string if not provided
  stockAnalyzeUrl: string;
}

export interface EditableTickerEntry extends TickerFieldsValue {
  id: string;
}

export interface NewTickerEntry extends TickerFieldsValue {
  stockAnalyzeUrl: string; // keep empty string if not provided
}

/** Utility key for maps/error lookups */
export function buildKey(symbol: string, exchange: string): string {
  return `${symbol.toUpperCase()}|${exchange}`;
}
