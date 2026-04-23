import { EtfMorPortfolioHoldingRow, EtfMorPortfolioHoldings } from '@/types/prismaTypes';

export type EtfHoldingColumnDef = { label: string; field: keyof EtfMorPortfolioHoldingRow };

export const HOLDING_FIELD_ORDER: Array<keyof EtfMorPortfolioHoldingRow> = [
  'portfolioWeightPct',
  'firstBought',
  'marketValue',
  'currency',
  'oneYearReturn',
  'forwardPE',
  'maturityDate',
  'couponRate',
  'sector',
];

export const HOLDING_FIELD_LABELS: Record<keyof EtfMorPortfolioHoldingRow, string> = {
  name: 'Name',
  portfolioWeightPct: 'Weight %',
  firstBought: 'First bought',
  marketValue: 'Market value',
  marketValueAsOfDate: 'Market value as of',
  currency: 'Currency',
  oneYearReturn: '1Y return',
  forwardPE: 'Fwd P/E',
  maturityDate: 'Maturity',
  couponRate: 'Coupon %',
  sector: 'Sector',
};

export function holdingHeaderToField(header: string): keyof EtfMorPortfolioHoldingRow | null {
  const h = header.toLowerCase().replace(/\s+/g, ' ').trim();
  if (h === 'holdings' || h === 'name') return 'name';
  if (h === '% portfolio weight' || h === 'portfolio weight' || h === 'weight %' || h === 'weight') return 'portfolioWeightPct';
  if (h === 'first bought') return 'firstBought';
  if (h.startsWith('market value')) return 'marketValue';
  if (h === 'cur' || h === 'currency') return 'currency';
  if (h === '1-year return' || h === '1 year return' || h === '1y return') return 'oneYearReturn';
  if (h === 'forward p/e' || h === 'fwd p/e') return 'forwardPE';
  if (h === 'maturity date' || h === 'maturity') return 'maturityDate';
  if (h === 'coupon rate' || h === 'coupon' || h === 'coupon %') return 'couponRate';
  if (h === 'sector') return 'sector';
  return null;
}

/**
 * Build the ordered list of columns to render for this ETF's holdings,
 * skipping any column whose rows are all empty. The optional `columns`
 * metadata on the payload preserves the source order when present.
 */
export function buildEtfHoldingColumnDefs(data: EtfMorPortfolioHoldings, rows: EtfMorPortfolioHoldingRow[]): EtfHoldingColumnDef[] {
  const hasValue = (field: keyof EtfMorPortfolioHoldingRow): boolean => rows.some((row) => row[field] != null && String(row[field]).trim() !== '');

  const defs: EtfHoldingColumnDef[] = [];
  const seen = new Set<keyof EtfMorPortfolioHoldingRow>();
  const push = (field: keyof EtfMorPortfolioHoldingRow, label?: string): void => {
    if (seen.has(field)) return;
    if (field !== 'name' && !hasValue(field)) return;
    seen.add(field);
    defs.push({ field, label: label ?? HOLDING_FIELD_LABELS[field] });
  };

  push('name');

  if (Array.isArray(data.columns) && data.columns.length > 0) {
    for (const header of data.columns) {
      const field = holdingHeaderToField(header);
      if (!field || field === 'name') continue;
      push(field, HOLDING_FIELD_LABELS[field]);
    }
  }

  for (const field of HOLDING_FIELD_ORDER) {
    push(field);
  }

  return defs;
}
