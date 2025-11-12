import { USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, PakistanExchanges } from '@/utils/countryExchangeUtils';

/** Shared, explicit types used across Add/Edit forms */
export interface TickerFieldsValue {
  exchange: USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges;
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
export function buildKey(symbol: string, exchange: USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges): string {
  return `${symbol.toUpperCase()}|${exchange.toUpperCase()}`;
}
