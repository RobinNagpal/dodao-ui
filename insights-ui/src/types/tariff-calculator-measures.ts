// Official-source extra-duty data for the tariff calculator (issue #1785).
//
// Source of truth = committed, reviewed files:
//   src/tariff-data/calculator/ch99-headings.json  — generated from the USITC HTS JSON (every Chapter 99 heading)
//   src/tariff-data/calculator/measures.json       — curated measures (coverage from the Chapter 99 U.S. notes,
//                                                    dates/conditions from the Federal Register / CBP CSMS)
// A generator turns them into reviewed SQL (prisma/data-sql/tariff-calculator/*.sql) that replaces the
// `tariff_chapter99_headings` / `tariff_measures` tables; the calculator reads the tables at runtime.

/** An official document behind a measure (same shape as the chapter content files' sources). */
export interface TariffMeasureSource {
  citation: string;
  url: string;
  /** ISO date. */
  published: string;
}

/** Every Chapter 99 heading, parsed from the HTS JSON. Mirrors the `TariffChapter99Heading` model. */
export interface Ch99HeadingRecord {
  code: string;
  description: string;
  generalRate: string | null;
  rateKind: 'additive' | 'flat' | 'relief' | 'unknown';
  ratePct: number | null;
  countries: string[];
  exceptCodes: string[];
  noteRefs: string[];
}

export interface Ch99HeadingsFile {
  htsEdition: string;
  /** usitc.gov URL of the HTS JSON the rows were read from. */
  sourceUrl: string;
  generatedAt: string;
  headings: Ch99HeadingRecord[];
}

export type TariffMeasureRateKind = 'additive' | 'inPlaceOfBase' | 'floor' | 'relief';

export type TariffProductType = 'patented' | 'generic' | 'specialty' | 'other';

/** A measure applies only when every condition it sets matches the shipment's claims. */
export interface TariffMeasureConditions {
  /** true = only for USMCA-qualifying goods (a USMCA claim, SPI "S"/"S+"); false = only when NOT claimed. */
  usmcaQualifying?: boolean;
  /** Only for these product types (e.g. Section 232 pharma: ['patented']). */
  productTypes?: TariffProductType[];
  /** Only when one of these SPI program codes is claimed. */
  spiClaimed?: string[];
}

/** One reviewed measure. Mirrors the `TariffMeasure` model. */
export interface TariffMeasureRecord {
  measureKey: string;
  program: string;
  ch99Code: string;
  rateKind: TariffMeasureRateKind;
  /** Percent, e.g. 12.5. Null for relief. */
  ratePct: number | null;
  countriesInclude: string[];
  countriesExclude: string[];
  /** HTS digit prefixes without dots ("3005", "30061001"); empty include = every line. */
  coverageInclude: string[];
  coverageExclude: string[];
  conditions: TariffMeasureConditions;
  /** Chapter 99 codes this measure displaces when it applies. */
  replacesCodes: string[];
  /** ISO dates. */
  effectiveFrom: string;
  effectiveTo: string | null;
  sources: TariffMeasureSource[];
  htsEdition: string;
  /** ISO date this measure was last checked against its official sources (defaults to the file's reviewedAt). */
  reviewedAt?: string;
  notes?: string;
}

export interface TariffMeasuresFile {
  htsEdition: string;
  /** ISO date the measures were last reviewed against the official sources. */
  reviewedAt: string;
  measures: TariffMeasureRecord[];
}

/** The base line, as the HTS states it (from `hts_codes`). */
export interface MeasureEngineLine {
  hts10: string;
  general: string | null;
  /** e.g. "Free (A+,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)". */
  special: string | null;
  /**
   * Column 2 rate (e.g. "20%"). Charged instead of `general` for goods of the column 2
   * countries (Cuba, North Korea, Russia, Belarus). Optional; without it those countries
   * get the general rate.
   */
  column2?: string | null;
  units: string[];
}

export interface MeasureEngineInput {
  hts10: string;
  /** ISO 3166-1 alpha-2. */
  countryOfOrigin: string;
  customsValueUsd: number;
  /**
   * Quantity per unit of measure, e.g. { KG: 21000, NO: 60 }. Keys are the calculator's
   * normalized HTS unit codes (the ones duty-engine's RATE_UNIT_PATTERNS / describeUom use):
   * KG, CKG, G, T, L, PF.L, NO (number / head / each), DOZ, DPR, PRS, GROSS, M, M2, M3, THS.
   * Raw HTS spellings ("No.", "kg", "liters", "doz.", "PFL", "thousands") are accepted too:
   * the engine normalizes every key with `normalizeUom()` from
   * src/utils/tariff-calculator/measures-engine.ts (exported so callers can use the same one).
   */
  quantities: Record<string, number>;
  /** SPI program code claimed for the base line (e.g. "S" for USMCA), if any. */
  claimedSpi?: string;
  productType?: TariffProductType;
  /** ISO date. */
  entryDate: string;
}

export interface MeasureEngineDutyLine {
  /** "base" or the Chapter 99 code. */
  code: string;
  label: string;
  rateText: string;
  amountUsd: number;
  sources: TariffMeasureSource[];
}

export interface MeasureEngineResult {
  lines: MeasureEngineDutyLine[];
  totalDutyUsd: number;
  /** Measures that were in scope but skipped, and why (e.g. "USMCA claimed"). */
  skipped: { ch99Code: string; reason: string }[];
  /** Set when the result cannot be computed (missing quantity, unparseable rate…). */
  error?: string;
}

/**
 * Engine contract (implemented in src/utils/tariff-calculator/measures-engine.ts):
 *   calculateWithMeasures(input: MeasureEngineInput, line: MeasureEngineLine, measures: TariffMeasureRecord[]): MeasureEngineResult
 * Pure (no DB) so it runs in the golden-scenario tests.
 */
export type CalculateWithMeasures = (input: MeasureEngineInput, line: MeasureEngineLine, measures: TariffMeasureRecord[]) => MeasureEngineResult;
