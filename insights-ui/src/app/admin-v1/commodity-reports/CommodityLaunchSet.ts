import { CommodityUpsertPayload } from '@/app/api/[spaceId]/commodities-v1/commodities/route';

/**
 * The ~20-commodity launch universe (from `docs/insights-ui/tasks/commodities-report.md`).
 * Used by the admin "Seed launch commodities" action to populate the table with
 * one click. `priceSymbol` uses Yahoo Finance front-month tickers; `exchange` is
 * best-effort (most data sources don't list one).
 */
export const COMMODITY_LAUNCH_SET: CommodityUpsertPayload[] = [
  { slug: 'wti-crude-oil', name: 'Crude Oil (WTI)', commodityGroup: 'Energy', priceSymbol: 'CL=F', exchange: 'NYMEX', unit: 'barrel' },
  { slug: 'brent-crude-oil', name: 'Crude Oil (Brent)', commodityGroup: 'Energy', priceSymbol: 'BZ=F', exchange: 'ICE', unit: 'barrel' },
  { slug: 'natural-gas', name: 'Natural Gas', commodityGroup: 'Energy', priceSymbol: 'NG=F', exchange: 'NYMEX', unit: 'MMBtu' },
  { slug: 'gasoline', name: 'Gasoline (RBOB)', commodityGroup: 'Energy', priceSymbol: 'RB=F', exchange: 'NYMEX', unit: 'gallon' },
  { slug: 'gold', name: 'Gold', commodityGroup: 'Metals', priceSymbol: 'GC=F', exchange: 'COMEX', unit: 'troy ounce' },
  { slug: 'silver', name: 'Silver', commodityGroup: 'Metals', priceSymbol: 'SI=F', exchange: 'COMEX', unit: 'troy ounce' },
  { slug: 'platinum', name: 'Platinum', commodityGroup: 'Metals', priceSymbol: 'PL=F', exchange: 'NYMEX', unit: 'troy ounce' },
  { slug: 'palladium', name: 'Palladium', commodityGroup: 'Metals', priceSymbol: 'PA=F', exchange: 'NYMEX', unit: 'troy ounce' },
  { slug: 'copper', name: 'Copper', commodityGroup: 'Metals', priceSymbol: 'HG=F', exchange: 'COMEX', unit: 'pound' },
  { slug: 'aluminium', name: 'Aluminium', commodityGroup: 'Metals', priceSymbol: 'ALI=F', exchange: 'COMEX', unit: 'metric ton' },
  { slug: 'nickel', name: 'Nickel', commodityGroup: 'Metals', priceSymbol: null, exchange: 'LME', unit: 'metric ton' },
  { slug: 'zinc', name: 'Zinc', commodityGroup: 'Metals', priceSymbol: null, exchange: 'LME', unit: 'metric ton' },
  { slug: 'wheat', name: 'Wheat', commodityGroup: 'Agriculture', priceSymbol: 'ZW=F', exchange: 'CBOT', unit: 'bushel' },
  { slug: 'corn', name: 'Corn', commodityGroup: 'Agriculture', priceSymbol: 'ZC=F', exchange: 'CBOT', unit: 'bushel' },
  { slug: 'soybeans', name: 'Soybeans', commodityGroup: 'Agriculture', priceSymbol: 'ZS=F', exchange: 'CBOT', unit: 'bushel' },
  { slug: 'coffee', name: 'Coffee', commodityGroup: 'Agriculture', priceSymbol: 'KC=F', exchange: 'ICE', unit: 'pound' },
  { slug: 'sugar', name: 'Sugar', commodityGroup: 'Agriculture', priceSymbol: 'SB=F', exchange: 'ICE', unit: 'pound' },
  { slug: 'cotton', name: 'Cotton', commodityGroup: 'Agriculture', priceSymbol: 'CT=F', exchange: 'ICE', unit: 'pound' },
  { slug: 'cocoa', name: 'Cocoa', commodityGroup: 'Agriculture', priceSymbol: 'CC=F', exchange: 'ICE', unit: 'metric ton' },
  { slug: 'live-cattle', name: 'Live Cattle', commodityGroup: 'Livestock', priceSymbol: 'LE=F', exchange: 'CME', unit: 'pound' },
  { slug: 'lean-hogs', name: 'Lean Hogs', commodityGroup: 'Livestock', priceSymbol: 'HE=F', exchange: 'CME', unit: 'pound' },
];
