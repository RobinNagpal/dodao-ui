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
  /** Only when the importer confirms this end use (e.g. notes 52(e) / 50(a)(v): "for use in pharmaceutical applications"). */
  endUse?: TariffEndUse;
  /** Only when the importer confirms the product matches one of these described products (ids in note-product-descriptions.json). */
  productDescriptionIds?: string[];
  /** Only when the importer confirms the manufacturer is covered by this company program (self-declared; CBP may require proof). */
  companyProgram?: TariffCompanyProgram;
  /** Only when the importer confirms the active ingredient is of U.S. origin, made into dosage form abroad (9903.04.68). */
  usOriginIngredient?: boolean;
}

/**
 * pharmaceutical — notes 52(e) / 50(a)(v): "for use in pharmaceutical applications".
 * research — 9903.04.70: solely for clinical trials, research and development, or other non-commercial use.
 */
export type TariffEndUse = 'pharmaceutical' | 'research';

/**
 * Section 232 pharmaceutical company programs (Proclamation 11020):
 * onshoring — Commerce-approved onshoring plan (9903.04.64);
 * mfnPricing — Annex II companies with onshoring + most-favored-nation pricing agreements (9903.04.65, 0%);
 * annexCompany — companies named in Annex III, which paid the Section 232 duty from July 31, 2026.
 */
export type TariffCompanyProgram = 'onshoring' | 'mfnPricing' | 'annexCompany';

/** Facts the importer confirms about the shipment that the HTS line alone can't tell (issue #1790). */
export interface TariffShipmentConfirmations {
  endUse?: TariffEndUse;
  /** Ids of named-product descriptions the product matches. */
  productDescriptionIds?: string[];
  companyProgram?: TariffCompanyProgram;
  /** The active ingredient is of U.S. origin (made into dosage form abroad). */
  usOriginIngredient?: boolean;
}

/** A named-product exemption description extracted from the Chapter 99 notes (note-product-descriptions.json). */
export interface TariffProductDescription {
  /** Stable id, e.g. "52c-8471.30.01-1". */
  id: string;
  /** HTS digit prefix without dots. */
  codePrefix: string;
  /** Description text exactly as the note states it. */
  description: string;
  /** Note subdivision, e.g. "52(c)". */
  note: string;
}

/** A question the calculator asks for a line because a measure in scope depends on the answer. */
export interface TariffConfirmationQuestion {
  kind: 'endUse' | 'productDescription' | 'companyProgram' | 'usOriginIngredient';
  /** For endUse / companyProgram: the value a "yes" sets; for productDescription: the description id. */
  value: string;
  /** Plain-language question shown to the user. */
  prompt: string;
  /** What changes if confirmed, e.g. "Exempt from the 12.5% Section 301 duty". */
  effect: string;
  /** Proof the importer may need, e.g. "CBP may ask for an end-use certification". */
  caveat?: string;
  sources: TariffMeasureSource[];
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
  /** Facts the importer confirmed (end use, named product, company program). Missing = not confirmed. */
  confirmations?: TariffShipmentConfirmations;
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
