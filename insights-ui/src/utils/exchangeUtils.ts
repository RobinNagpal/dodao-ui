import { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

/** ---------- Types ---------- */

export type ExchangeId = 'NASDAQ' | 'NYSE' | 'NYSEAMERICAN' | 'TSX' | 'TSXV' | 'BSE' | 'NSE' | 'LSE' | 'AIM';

/** ---------- Constants ---------- */

export const EXCHANGES: ReadonlyArray<ExchangeId> = ['NASDAQ', 'NYSE', 'NYSEAMERICAN', 'TSX', 'TSXV', 'BSE', 'NSE', 'LSE', 'AIM'] as const;

export const exchangeItems: StyledSelectItem[] = EXCHANGES.map((e) => ({ id: e, label: e }));

/** ---------- Utility Functions ---------- */

export const isExchangeId = (val: string): val is ExchangeId => {
  return (EXCHANGES as readonly string[]).includes(val);
};

export const toExchangeId = (val?: string | null): ExchangeId => {
  const normalized = (val ?? '').trim().toUpperCase();
  return isExchangeId(normalized) ? normalized : 'NASDAQ';
};
