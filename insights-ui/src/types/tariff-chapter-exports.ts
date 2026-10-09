// Types for a chapter's export-side content files
// (`src/tariff-data/chapters/exports/<slug>/{overview,tariff-updates,markets}.json`).
//
// The import side of a chapter report has six pages; the export side has
// three: an overview, the foreign tariff changes on U.S. goods, and the
// destination markets. Only chapters with meaningful U.S. exports get them.
// Like the import prototype, the content lives in JSON while the shape
// settles; a query returning these same types can replace the loader later.

import type { TariffImportsByYear, TariffStat, TariffUpdateSource } from '@/types/tariff-chapter-prototype';

export type TariffExportMarketStatus = 'unchanged' | 'lowered' | 'raised' | 'raisedThenRemoved' | 'pending';

interface TariffExportPageBase {
  schemaVersion: number;
  direction: 'export';
  chapter: { number: number; padded: string; slug: string; title: string };
  page: {
    slug: string;
    path: string;
    h1: string;
    seo: { title: string; shortDescription: string; keywords: string[] };
    lastCheckedAt: string;
  };
  nav: { slug: string; label: string; path: string }[];
  /** Markdown. */
  intro: string;
}

/** One destination in the overview's "top buyers" table. */
export interface TariffExportTopMarket {
  countryCode: number;
  country: string;
  exportsUsd: number;
  priorExportsUsd: number;
  sharePct: number;
  changePct: number | null;
  mainProducts: string;
  tariffNow: string;
  status: TariffExportMarketStatus;
}

export interface TariffExportsByHeading {
  heading: string;
  label: string;
  exportsUsd: number;
  priorExportsUsd: number;
  changePct: number | null;
  sharePct: number;
}

export interface TariffExportsByLine {
  /** Six-digit HS code, dotted ("3002.15"). */
  hs6: string;
  heading: string;
  description: string;
  exportsUsd: number;
  priorExportsUsd: number;
  changePct: number | null;
  sharePct: number;
}

export interface TariffExportOverviewContent extends TariffExportPageBase {
  latestYear: number;
  priorYear: number;
  valueBasis: string;
  stats: TariffStat[];
  byYear: TariffImportsByYear[];
  /** Names of the two buyers broken out in `byYear`. */
  byYearPartners: string[];
  byYearCaption: string;
  topMarkets: TariffExportTopMarket[];
  othersExportsUsd: number;
  othersPriorExportsUsd: number;
  byHeading: TariffExportsByHeading[];
  byLine: TariffExportsByLine[];
  keyTakeaways: string[];
  /** Markdown — why the HTS import rates don't apply to exports. */
  classificationNote: string;
  sources: TariffUpdateSource[];
  coverageNote: string;
}

/** A foreign measure in force today that charges U.S. goods in this chapter more. */
export interface TariffExportMeasureInEffect {
  id: string;
  country: string;
  measure: string;
  before: string;
  now: string;
  appliesTo: string;
  whatItMeans: string;
  /** ISO date the rate shown in `now` took effect (for a duty raised or cut later, the date of that latest change). */
  effectiveFrom: string;
  /** The official document that put the current rate in force; must also be listed in `sourceIds`. */
  effectiveSourceId: string;
  sourceIds: string[];
}

export type TariffExportChangeType = 'retaliation' | 'tradeDeal' | 'reference';

/** One dated foreign tariff action touching U.S. goods since January 2025. */
export interface TariffExportChange {
  id: string;
  date: string;
  type: TariffExportChangeType;
  countries: string[];
  title: string;
  before: string | null;
  now: string | null;
  /** Whether the measure reaches this chapter's goods, as opposed to other U.S. goods. */
  coversChapter: 'yes' | 'no' | 'partly';
  status: string;
  detail: string;
  sourceIds: string[];
}

export interface TariffExportCountryStatus {
  country: string;
  tariffBefore: string;
  tariffNow: string;
  status: TariffExportMarketStatus;
  headline: string;
}

export interface TariffExportUpdatesContent extends TariffExportPageBase {
  scope: string;
  stats: TariffStat[];
  inEffect: TariffExportMeasureInEffect[];
  changes: TariffExportChange[];
  byCountry: TariffExportCountryStatus[];
  sources: TariffUpdateSource[];
}

/** A destination's tariff on U.S. goods for one product group, next to what the U.S. shipped there. */
export interface TariffExportMarketCell {
  exportsUsd: number;
  rate: string;
  /** Which subheading / year / rule the rate comes from. */
  basis: string;
}

export interface TariffExportMarketCountry {
  countryCode: number;
  country: string;
  /** Customs territory whose schedule applies, e.g. "EU". */
  tariffArea: string;
  rule: string;
  exportsUsd: number;
  priorExportsUsd: number;
  sharePct: number;
  changePct: number | null;
  status: TariffExportMarketStatus;
  /** Keyed by four-digit heading. */
  cells: Record<string, TariffExportMarketCell>;
  profile: {
    headline: string;
    mainProducts: string;
    tariffNow: string;
    regulator: { name: string; url: string; requirement: string };
  };
}

export interface TariffExportMarketsContent extends TariffExportPageBase {
  tradeYear: number;
  tariffYear: number;
  valueBasis: string;
  groups: { heading: string; label: string; shortLabel: string }[];
  countries: TariffExportMarketCountry[];
  biggestLanes: { country: string; heading: string; exportsUsd: number; rate: string }[];
  /** Markdown. */
  why: string;
  assumptions: string[];
  sources: TariffUpdateSource[];
}

export interface TariffChapterExports {
  overview: TariffExportOverviewContent;
  tariffUpdates: TariffExportUpdatesContent;
  markets: TariffExportMarketsContent;
}
