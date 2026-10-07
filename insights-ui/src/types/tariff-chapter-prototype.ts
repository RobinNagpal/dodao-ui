// Types for the Approach-2 tariff chapter prototype content files
// (`src/tariff-data/chapters/<slug>.json`).
//
// Approach 2 (issue #1770) makes each of a chapter's six pages a lookup tool
// rather than an essay. The overview page's job is "the complete, searchable
// rate table: general, FTA and Column 2 rates plus additional duties,
// filterable by product name".
//
// While we iterate on the shape of that content we keep it in JSON files
// instead of migrating the schema: the rate rows are a dump of what
// `hts_codes` already stores, the trade figures come from
// `tariff_trade_analytics`, and the prose blocks are authored. When the shape
// settles, the loader is swapped for a query that returns these same types and
// the renderers stay as they are.

/** One row of the chapter rate table — mirrors an `hts_codes` row. */
export interface TariffRateTableRow {
  id: string;
  /** Dotted HTS number, e.g. "0104.20.00.00". Null on grouping rows. */
  hts: string | null;
  /** 10-digit form with no separators; null for 4/6/8-digit and grouping rows. */
  htsCode10: string | null;
  /** HTSUS indent (0..6) — drives the display hierarchy. */
  indent: number;
  description: string;
  /** Grouping / heading row that exists only to nest the rows below it. */
  isHeaderRow: boolean;
  units: string[];

  /** Rates exactly as the schedule states them on this row (often blank). */
  general: string | null;
  special: string | null;
  column2: string | null;
  additionalDuties: string | null;
  quotaQuantity: string | null;

  // HTSUS states a duty once on the 8-digit line and leaves its 10-digit
  // statistical children blank. The effective* fields resolve each row to the
  // rate that actually applies to it; the *InheritedFrom fields name the
  // ancestor it came from (null when the row states its own rate), so the UI
  // can show inherited values as secondary.
  effectiveGeneral: string | null;
  effectiveSpecial: string | null;
  effectiveColumn2: string | null;
  generalInheritedFrom: string | null;
  specialInheritedFrom: string | null;
  column2InheritedFrom: string | null;

  /** Effective general rate costs money (i.e. not "Free" and not blank). */
  dutiable: boolean;
  /** Four-digit heading this row belongs to, e.g. "0104". */
  heading: string | null;
  /** Ancestor descriptions, outermost first — the row's breadcrumb. */
  ancestorPath: string[];
  /** Lowercased ancestor descriptions + own description + code, for filtering. */
  searchText: string;
}

/** A four-digit heading, used for the "jump to a product group" tiles. */
export interface TariffProductGroup {
  heading: string;
  label: string;
  blurb: string;
  /** Pre-computed rate summary, e.g. "Free · 1¢/kg". */
  rateSummary: string;
  lineCount: number;
  dutiableLineCount: number;
  /** Product words a reader might search for in this group. */
  searchExamples: string[];
}

export interface TariffStat {
  label: string;
  value: string;
}

/** Special Program Indicator → program name, per HTSUS General Note 3(c). */
export interface TariffSpiLegendEntry {
  code: string;
  name: string;
}

export interface TariffWorkedExample {
  title: string;
  /** HTS line the example is about. */
  line: string;
  /** Markdown. */
  body: string;
}

export interface TariffTradeSnapshotCountry {
  name: string;
  importsUsd: number;
}

export interface TariffTradeSnapshot {
  year: number;
  totalImportsUsd: number;
  totalDutyCollectedUsd: number;
  effectiveDutyRateNote: string;
  topCountries: TariffTradeSnapshotCountry[];
  biggestLines: { hts: string; label: string }[];
  source: string;
  /** What this snapshot does and does not cover — rendered as a caveat. */
  coverageNote: string;
}

export interface TariffChapterOverviewContent {
  h1: string;
  seo: { title: string; shortDescription: string; keywords: string[] };
  /** Markdown. */
  intro: string;
  stats: TariffStat[];
  productGroups: TariffProductGroup[];
  rateTable: {
    /** Explains the inherited-rate convention to the reader. */
    note: string;
    rowCount: number;
    rows: TariffRateTableRow[];
  };
  spiLegend: TariffSpiLegendEntry[];
  workedExamples: TariffWorkedExample[];
  tradeSnapshot: TariffTradeSnapshot;
  notes: { chapterNotes: string | null; additionalUsNotes: string | null };
}

/**
 * Approach-2 tariff-updates content: a two-snapshot comparison (an earlier
 * HTSUS edition vs the current one) plus the extra-duty measures in scope.
 * Not a full history log — see issue #1770.
 */
export interface TariffEditionRef {
  edition: string;
  released: string;
  inForceFrom: string;
  url: string;
}

export interface TariffUpdateSource {
  id: string;
  publisher: string;
  /** e.g. "90 FR 9117" or "HTSUS 2026 Revision 20". */
  citation: string;
  document: string;
  title: string;
  signed: string | null;
  published: string;
  url: string;
}

/** An extra duty (Chapter 99 measure) in the current schedule that reaches this chapter. */
export interface TariffExtraDutyInEffect {
  id: string;
  country: string;
  measure: string;
  ch99Code: string;
  before: string;
  now: string;
  exemption: string;
  whatItMeans: string;
  sourceIds: string[];
}

export type TariffChangeType = 'baseRate' | 'extraDuty' | 'reference' | 'pending';

/** One dated entry in the change log. */
export interface TariffChangeEntry {
  id: string;
  type: TariffChangeType;
  date: string;
  /** What the date is: "Signed", "Effective", "Checked". */
  dateLabel: string;
  title: string;
  detail: string;
  before: string | null;
  now: string | null;
  countries: string | null;
  sourceIds: string[];
}

/** Base-rate status of one 10-digit line between the two editions. */
export interface TariffLineStatus {
  hts: string;
  description: string;
  ancestorPath: string[];
  searchText: string;
  generalBefore: string | null;
  generalNow: string | null;
  status: 'unchanged' | 'changed' | 'new';
  /** "≤ 2025-01-01": unchanged at least since the earlier edition came into force. */
  unchangedSince: string | null;
}

export interface TariffUpdatesContent {
  h1: string;
  seo: { title: string; shortDescription: string; keywords: string[] };
  /** Markdown. */
  intro: string;
  /** Which countries / measures the page covers. */
  scope: string;
  before: TariffEditionRef;
  now: TariffEditionRef;
  lastCheckedAt: string;
  stats: TariffStat[];
  inEffect: TariffExtraDutyInEffect[];
  changes: TariffChangeEntry[];
  lines: TariffLineStatus[];
  sources: TariffUpdateSource[];
}

/**
 * Approach-2 understand-industry content: import statistics by country, by
 * product and over time, plus the effective duty rate. Values come from UN
 * Comtrade; `dutyPaidUsd` fields are null until filled from production's
 * `tariff_trade_analytics`.
 */
export interface TariffImportsByYear {
  year: number;
  totalUsd: number;
  canadaUsd: number;
  mexicoUsd: number;
  restUsd: number;
}

export interface TariffImportsByCountry {
  countryCode: number;
  country: string;
  importsUsd: number;
  priorImportsUsd: number;
  changePct: number | null;
  sharePct: number;
  mainHeading: string | null;
  mainHeadingLabel: string | null;
  dutyPaidUsd: number | null;
}

export interface TariffImportsByLine {
  /** Six-digit HS code, dotted ("0102.29"). */
  hs6: string;
  heading: string;
  description: string;
  importsUsd: number;
  priorImportsUsd: number;
  changePct: number | null;
  sharePct: number | null;
  dutyPaidUsd: number | null;
  searchText: string;
}

/** Imports for one heading from one country — feeds the industry-areas matrix. */
export interface TariffImportsByHeadingCountry {
  heading: string;
  countryCode: number;
  country: string;
  importsUsd: number;
}

export interface TariffUnderstandIndustryContent {
  h1: string;
  seo: { title: string; shortDescription: string; keywords: string[] };
  latestYear: number;
  priorYear: number;
  /** What the dollar values measure (e.g. CIF as reported to UN Comtrade). */
  valueBasis: string;
  lastCheckedAt: string;
  stats: TariffStat[];
  byYear: TariffImportsByYear[];
  byCountry: TariffImportsByCountry[];
  othersImportsUsd: number;
  othersPriorImportsUsd: number;
  byLine: TariffImportsByLine[];
  byHeadingCountry: TariffImportsByHeadingCountry[];
  effectiveDuty: { year: number; dutyPaidUsd: number; note: string };
  /** Markdown — explains the numbers above. */
  why: string;
  sources: { label: string; url?: string }[];
  coverageNote: string;
}

/**
 * Approach-2 industry-areas content: a country x product-group matrix of the
 * total rate (base rate + extra duty - preferences), from the current schedule.
 */
export interface TariffCountryRule {
  kind: 'usmca' | 'eu15' | 'additive';
  extraPct: number;
  ch99Code: string;
  /** Chapter 99 heading that exempts USMCA-qualifying goods (Canada/Mexico). */
  usmcaCode?: string;
  /** True for the "any other country" floor — listed countries may pay more. */
  atLeast?: boolean;
  label: string;
  sourceIds: string[];
}

export interface TariffRateBreakdownRow {
  base: string;
  lines: string[];
  lineCount: number;
  extra: string;
  preference: string;
  total: string;
}

export interface TariffMatrixCellRates {
  /** Distinct totals in the group, most lines first. */
  totals: string[];
  breakdown: TariffRateBreakdownRow[];
}

export interface TariffMatrixCell {
  importsUsd: number;
  withUsmca: TariffMatrixCellRates;
  withoutUsmca: TariffMatrixCellRates;
}

export interface TariffMatrixCountry {
  country: string;
  rule: TariffCountryRule;
  importsUsd: number;
  /** Keyed by four-digit heading. */
  cells: Record<string, TariffMatrixCell>;
}

export interface TariffIndustryAreasContent {
  h1: string;
  seo: { title: string; shortDescription: string; keywords: string[] };
  /** Markdown. */
  intro: string;
  scheduleEdition: string;
  tradeYear: number;
  lastCheckedAt: string;
  /** `shortLabel` fits a matrix column header; `label` is the full name. */
  groups: { heading: string; label: string; shortLabel: string; baseRates: string[] }[];
  countries: TariffMatrixCountry[];
  biggestLanes: { country: string; heading: string; importsUsd: number; totals: string[] }[];
  assumptions: string[];
  /** What was checked to establish that no exemption list covers the chapter. */
  exemptionCheck: string;
  sources: TariffUpdateSource[];
}

/**
 * Approach-2 tariff-engineering content: the documents and rules required,
 * per line, and the legal levers that lower the duty. Every rule and lever
 * carries its regulation / schedule citation.
 */
export interface TariffCitation {
  label: string;
  url: string;
}

export interface TariffEngineeringLever {
  id: string;
  title: string;
  /** What it saves, in plain words. */
  saves: string;
  appliesTo: string;
  /** The document that unlocks it. */
  document: string;
  caveat: string;
  /** Chapter 98 provisions, when the lever is "use a Chapter 98 provision". */
  provisions?: { code: string; rate: string; text: string }[];
  citations: TariffCitation[];
}

export interface TariffEngineeringRule {
  id: string;
  agency: string;
  title: string;
  citations: TariffCitation[];
}

export interface TariffEngineeringLine {
  hts: string;
  description: string;
  ancestorPath: string[];
  searchText: string;
  heading: string;
  general: string | null;
  ruleIds: string[];
  leverIds: string[];
}

export interface TariffEngineeringContent {
  h1: string;
  seo: { title: string; shortDescription: string; keywords: string[] };
  /** Markdown. */
  intro: string;
  lastCheckedAt: string;
  /** Date the eCFR text used was current to. */
  regulationsAsOf: string;
  levers: TariffEngineeringLever[];
  rules: TariffEngineeringRule[];
  groups: { heading: string; label: string; ruleIds: string[]; note: string | null }[];
  lines: TariffEngineeringLine[];
  disclaimer: string;
}

/**
 * Approach-2 final-conclusion content: an FAQ built from real search
 * questions, answered from the facts on the chapter's other pages.
 */
export interface TariffFaq {
  id: string;
  question: string;
  /** The real search suggestions this question answers. */
  searchedAs: string[];
  /** Plain text — also emitted verbatim in the FAQPage structured data. */
  answer: string;
  /** Section slug with the detail ('' = the chapter overview). */
  link: string;
}

export interface TariffFinalConclusionContent {
  h1: string;
  seo: { title: string; shortDescription: string; keywords: string[] };
  intro: string;
  keyTakeaways: string[];
  lastCheckedAt: string;
  /** Where the questions came from. */
  questionSource: string;
  faqs: TariffFaq[];
}

export interface TariffChapterPrototype {
  schemaVersion: number;
  approach: number;
  generatedBy: string;
  /** ISO date the content was compiled — rendered as the page's "as of". */
  asOf: string;
  chapter: {
    number: number;
    padded: string;
    slug: string;
    title: string;
    sectionNumber: number;
    sectionRoman: string;
    sectionTitle: string;
  };
  sources: { label: string; url?: string; note?: string }[];
  overview: TariffChapterOverviewContent;
  /** Present once the chapter's tariff-updates page has been built. */
  tariffUpdates?: TariffUpdatesContent;
  /** Present once the chapter's understand-industry page has been built. */
  understandIndustry?: TariffUnderstandIndustryContent;
  /** Present once the chapter's industry-areas page has been built. */
  industryAreas?: TariffIndustryAreasContent;
  /** Present once the chapter's tariff-engineering page has been built. */
  tariffEngineering?: TariffEngineeringContent;
  /** Present once the chapter's final-conclusion (FAQ) page has been built. */
  finalConclusion?: TariffFinalConclusionContent;
}
