// Types for a chapter's export-side content files
// (`src/tariff-data/chapters/exports/<slug>/{overview,tariff-updates,markets,rules,faq}.json`).
//
// The import side of a chapter report has six pages; the export side has five:
//   overview        how much of the chapter the U.S. sells, to whom, and what
//   tariff-updates  what other countries changed on U.S. goods, and what is coming
//   markets         what each destination charges on U.S. goods and needs to let them in
//   rules           what the U.S. requires to ship the goods out, and how to pay less abroad
//   faq             real search questions answered from the four pages above
// Only chapters with meaningful U.S. exports get them. The page-by-page content spec lives in
// docs/insights-ui/tariffs/export-pages/. Like the import prototype, the content lives in JSON
// while the shape settles; a query returning these same types can replace the loader later.

import type {
  TariffCitation,
  TariffEngineeringLever,
  TariffEngineeringRule,
  TariffFaq,
  TariffImportsByYear,
  TariffStat,
  TariffUpdateSource,
} from '@/types/tariff-chapter-prototype';

export type TariffExportMarketStatus = 'unchanged' | 'lowered' | 'raised' | 'raisedThenRemoved' | 'pending';

interface TariffExportPageBase {
  schemaVersion: number;
  direction: 'export';
  chapter: { number: number; padded: string; slug: string; title: string };
  page: {
    /** The page's CHAPTER_EXPORT_SECTIONS slug, e.g. "exports/markets". */
    slug: string;
    /** The page's URL path (chapterExportHref). */
    path: string;
    h1: string;
    seo: { title: string; shortDescription: string; keywords: string[] };
    lastCheckedAt: string;
  };
  /** Markdown. */
  intro: string;
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

/** One destination in the overview's "top buyers" table. */
export interface TariffExportTopMarket {
  countryCode: number;
  country: string;
  exportsUsd: number;
  priorExportsUsd: number;
  sharePct: number;
  changePct: number | null;
  /** Short — the full rate breakdown is on the markets page. */
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
  /** Six-digit HS code, dotted ("3002.15") — also the first six digits of the Schedule B number. */
  hs6: string;
  heading: string;
  description: string;
  exportsUsd: number;
  priorExportsUsd: number;
  changePct: number | null;
  sharePct: number;
}

/** Exports in the current year so far, against the same months a year earlier (monthly data). */
export interface TariffExportsYearToDate {
  year: number;
  /** Last month included, 1–12. */
  throughMonth: number;
  exportsUsd: number;
  priorExportsUsd: number;
  changePct: number | null;
  /** The largest buyers this year so far. */
  topBuyers: { countryCode: number; country: string; exportsUsd: number; priorExportsUsd: number; changePct: number | null }[];
  /** What the numbers are and where they come from. */
  note: string;
}

export interface TariffExportOverviewContent extends TariffExportPageBase {
  latestYear: number;
  priorYear: number;
  valueBasis: string;
  stats: TariffStat[];
  keyTakeaways: string[];
  byYear: TariffImportsByYear[];
  /** Names of the two buyers broken out in `byYear`. */
  byYearPartners: string[];
  byYearCaption: string;
  /** Null until monthly data for the current year is fetched. */
  yearToDate: TariffExportsYearToDate | null;
  topMarkets: TariffExportTopMarket[];
  othersExportsUsd: number;
  othersPriorExportsUsd: number;
  byHeading: TariffExportsByHeading[];
  byLine: TariffExportsByLine[];
  sources: TariffUpdateSource[];
  coverageNote: string;
}

// ---------------------------------------------------------------------------
// Tariff updates
// ---------------------------------------------------------------------------

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

/** A dated event ahead that could change what a buyer charges on U.S. goods in this chapter. */
export interface TariffExportUpcoming {
  id: string;
  /** ISO date the event is due. Must still be in the future — once it passes, record the outcome in `changes`. */
  expectedOn: string;
  /** What the date is: "Expires", "Review", "Deadline", "Takes effect". */
  dateLabel: string;
  countries: string[];
  title: string;
  /** What happens on that date, in plain words. */
  whatHappens: string;
  /** What it would mean for U.S. goods in this chapter. */
  impact: string;
  /** Where things stand today, e.g. "No extension announced". */
  status: string;
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
  /** Whether the measure reaches this chapter's goods; 'no' entries are shown apart, as context. */
  coversChapter: 'yes' | 'no' | 'partly';
  status: string;
  detail: string;
  sourceIds: string[];
}

export interface TariffExportUpdatesContent extends TariffExportPageBase {
  scope: string;
  stats: TariffStat[];
  upcoming: TariffExportUpcoming[];
  inEffect: TariffExportMeasureInEffect[];
  changes: TariffExportChange[];
  sources: TariffUpdateSource[];
}

// ---------------------------------------------------------------------------
// Markets
// ---------------------------------------------------------------------------

/** A destination's tariff on U.S. goods for one product group, next to what the U.S. shipped there. */
export interface TariffExportMarketCell {
  exportsUsd: number;
  /** What U.S.-origin goods pay today (after any trade-agreement rate and extra duty). */
  rate: string;
  /** The destination's normal (MFN) rate when it differs from `rate`, e.g. without the trade agreement. */
  normalRate: string | null;
  /** Which subheading / year / rule the rate comes from. */
  basis: string;
}

/** A member of a customs union shown as one market (e.g. an EU country). */
export interface TariffExportMarketMember {
  countryCode: number;
  country: string;
  exportsUsd: number;
  priorExportsUsd: number;
  changePct: number | null;
}

export interface TariffExportMarket {
  /** Country code, or the customs union's code (UN Comtrade's 97 for the EU). */
  countryCode: number;
  /** Country or customs union name, e.g. "European Union". */
  name: string;
  /** The rule behind the rates, e.g. "EU common external tariff (WTO pharmaceutical zero-for-zero)". */
  rule: string;
  /** The U.S. trade agreement with this market, or null. */
  usTradeAgreement: string | null;
  exportsUsd: number;
  priorExportsUsd: number;
  sharePct: number;
  changePct: number | null;
  status: TariffExportMarketStatus;
  /** Present when the market is a customs union: its members that buy the most. */
  members?: TariffExportMarketMember[];
  /** Keyed by four-digit heading. */
  cells: Record<string, TariffExportMarketCell>;
  profile: {
    /** One or two sentences: what matters for a U.S. exporter here. */
    headline: string;
    mainProducts: string;
    tariffNow: string;
    regulator: { name: string; url: string; requirement: string };
    /** The trade.gov Country Commercial Guide page on the market's import rules. */
    countryGuide: TariffCitation;
  };
}

export interface TariffExportMarketsContent extends TariffExportPageBase {
  tradeYear: number;
  tariffYear: number;
  valueBasis: string;
  groups: { heading: string; label: string; shortLabel: string }[];
  markets: TariffExportMarket[];
  /** The largest market × product lanes; the first one opens selected in the matrix. */
  biggestLanes: { market: string; heading: string; exportsUsd: number; rate: string }[];
  assumptions: string[];
  sources: TariffUpdateSource[];
  coverageNote: string;
}

// ---------------------------------------------------------------------------
// Export rules
// ---------------------------------------------------------------------------

/** One step every U.S. exporter goes through before goods leave (the same for every chapter, with chapter notes). */
export interface TariffExportStep {
  id: string;
  title: string;
  /** What to do, in plain words. */
  whatToDo: string;
  /** When it applies, e.g. "Shipments over $2,500 per Schedule B number". */
  when: string;
  /** What it means for this chapter's goods; null when nothing chapter-specific. */
  chapterNote: string | null;
  citations: TariffCitation[];
}

export interface TariffExportRulesContent extends TariffExportPageBase {
  /** Date the eCFR text used was current to. */
  regulationsAsOf: string;
  steps: TariffExportStep[];
  /** Agency rules that apply only to some of this chapter's goods. */
  rules: TariffEngineeringRule[];
  groups: { heading: string; label: string; ruleIds: string[]; note: string | null }[];
  /** Legal ways to pay less duty abroad or get U.S. duty back. */
  savings: TariffEngineeringLever[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export interface TariffExportFaqContent extends TariffExportPageBase {
  keyTakeaways: string[];
  /** Where the questions came from. */
  questionSource: string;
  /** `link` is an export page slug ("exports", "exports/markets", …). */
  faqs: TariffFaq[];
}

export interface TariffChapterExports {
  overview: TariffExportOverviewContent;
  tariffUpdates: TariffExportUpdatesContent;
  markets: TariffExportMarketsContent;
  rules: TariffExportRulesContent;
  faq: TariffExportFaqContent;
}

// ---------------------------------------------------------------------------
// Export library (`src/tariff-data/export-library/`)
// ---------------------------------------------------------------------------
//
// Facts that hold for every chapter, kept once and copied into a chapter's export pages by the
// export generator (`pnpm tariff:generate-exports`): the steps every U.S. exporter takes, the facts
// about each market that do not depend on the product, and the foreign tariff actions on U.S. goods
// (with, per chapter, whether each one reaches that chapter's goods). Update the library first, then
// regenerate or edit the chapters that use the changed entry.

/** `us-export-steps.json`: the steps and savings that apply to every chapter. */
export interface TariffExportStepsLibrary {
  lastCheckedAt: string;
  /** Date the eCFR text used was current to. */
  regulationsAsOf: string;
  /** Copied into `rules.steps`; the generator adds a `chapterNote` placeholder to each. */
  steps: Omit<TariffExportStep, 'chapterNote'>[];
  /** Copied into `rules.savings`. */
  savings: TariffEngineeringLever[];
  disclaimer: string;
}

/** One export market in `markets.json`: what holds for it whatever the product. */
export interface TariffExportMarketLibraryEntry {
  /** UN Comtrade partner codes that make up the market (every member, for a customs union). */
  countryCodes: number[];
  /** The market's own code when it is a customs union (UN Comtrade's 97 for the EU); else its one country code is used. */
  marketCode?: number;
  name: string;
  /** The U.S. trade agreement with this market, or null. */
  usTradeAgreement: string | null;
  countryGuide: TariffCitation;
}

export interface TariffExportMarketLibrary {
  lastCheckedAt: string;
  markets: TariffExportMarketLibraryEntry[];
}

/** Whether a foreign measure reaches a chapter's goods, keyed by the unpadded chapter number ("30"); a missing key = not checked yet. */
export type TariffChapterCoverage = Record<string, TariffExportChange['coversChapter']>;

/** A foreign tariff action on U.S. goods in `foreign-measures.json`. */
export interface TariffForeignMeasure extends Omit<TariffExportChange, 'coversChapter'> {
  /** True when it reaches every U.S. good (e.g. an extra tariff on all U.S. goods), so it covers every chapter. */
  allGoods: boolean;
  coverage: TariffChapterCoverage;
  /** In force today and charging U.S. goods more than in January 2025: becomes an `inEffect` entry where it covers the chapter. */
  inForce: boolean;
  /** For an in-force measure: the document that put the current rate in force (also in `sourceIds`). */
  effectiveSourceId?: string;
}

/** A dated event ahead in `foreign-measures.json`; the generator adds a chapter-specific `impact` placeholder. */
export interface TariffForeignUpcoming extends Omit<TariffExportUpcoming, 'impact'> {
  allGoods: boolean;
  coverage: TariffChapterCoverage;
}

export interface TariffForeignMeasuresLibrary {
  lastCheckedAt: string;
  /** Newest first, like a chapter's `changes`. */
  measures: TariffForeignMeasure[];
  /** Soonest first. */
  upcoming: TariffForeignUpcoming[];
  sources: TariffUpdateSource[];
}
