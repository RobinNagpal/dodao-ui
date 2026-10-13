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

/**
 * What value an ad valorem measure is charged on (issue #1796). Omitted = the full customs value.
 * steel / aluminum / copper — only the value of that metal content (Section 232 derivatives, notes 16 / 19);
 * nonUsContent — the customs value minus the U.S.-content value (Section 232 autos/parts for USMCA-qualifying goods, note 33).
 */
export type TariffContentBasis = 'steel' | 'aluminum' | 'copper' | 'nonUsContent';

export type TariffProductType = 'patented' | 'generic' | 'specialty' | 'other';

/** A measure applies only when every condition it sets matches the shipment's claims. */
export interface TariffMeasureConditions {
  /** true = only for USMCA-qualifying goods (a USMCA claim, SPI "S"/"S+"); false = only when NOT claimed. */
  usmcaQualifying?: boolean;
  /** Only for these product types (e.g. Section 232 pharma: ['patented']). */
  productTypes?: TariffProductType[];
  /** Only when one of these SPI program codes is claimed. */
  spiClaimed?: string[];
  /**
   * Only when NONE of these SPI program codes is claimed (e.g. a duty that originating goods under a trade agreement
   * don't pay). The special value '*' = only when no SPI at all is claimed, i.e. the goods are entered at the column 1
   * general rate (U.S. note 29(a): Nicaragua's 9903.89.01 applies to "products of Nicaragua that are subject to the
   * rates of duty provided for in column 1-general"). Named codes next to '*' don't change the check; they tell the
   * calculator which claims to offer on lines whose general rate is Free (conditionProgramsForLine).
   */
  spiNotClaimed?: string[];
  /** Only when the importer confirms this end use (e.g. notes 52(e) / 50(a)(v): "for use in pharmaceutical applications"). */
  endUse?: TariffEndUse;
  /** Only when the importer confirms the product matches one of these described products (ids in note-product-descriptions.json). */
  productDescriptionIds?: string[];
  /** Only when the importer confirms the manufacturer is covered by this company program (self-declared; CBP may require proof). */
  companyProgram?: TariffCompanyProgram;
  /** Only when the importer confirms the active ingredient is of U.S. origin, made into dosage form abroad (9903.04.68). */
  usOriginIngredient?: boolean;
  /** Only when every listed fact (ids in confirmation-facts.json) is answered TRUE. */
  factsTrue?: string[];
  /** Only when every listed fact is answered FALSE (an unanswered fact uses its registry default; a must-answer fact makes the engine ask). */
  factsFalse?: string[];
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
  /** Answers to registry facts (confirmation-facts.json): true / false; omitted = not answered. */
  facts?: Record<string, boolean>;
}

/**
 * A yes/no fact about the shipment that some measures depend on (src/tariff-data/calculator/confirmation-facts.json).
 * Generic so new programs need data, not new types (issue #1796): e.g. "the article contains no aluminum, steel or
 * copper" (9903.82.01), "≥95% of the metal was melted in the UK" (note 16(d)), "logic IC within the note 39(b) thresholds".
 */
export interface TariffConfirmationFact {
  /** Stable id, camelCase, e.g. "noMetalContent". */
  id: string;
  /** Plain-language yes/no question shown to the importer. */
  prompt: string;
  /** Optional one-line help: what counts, what proof CBP may ask for. */
  help?: string;
  /**
   * What the engine assumes when the fact is not answered: true / false — or null = must be answered: if a measure in
   * scope depends on it, the engine returns an error asking for it (use when either default would be badly wrong).
   */
  defaultWhenUnanswered: boolean | null;
  /**
   * Short lowercase phrases for each answer ("car or light-truck part" / "not a car or light-truck part"), used as the
   * variant labels of chapter matrix cells ("25% car or light-truck part"); see utils/tariff-calculator/fact-labels.ts.
   */
  shortLabel?: { yes: string; no: string };
  sources: TariffMeasureSource[];
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
  kind: 'endUse' | 'productDescription' | 'companyProgram' | 'usOriginIngredient' | 'fact';
  /** For endUse / companyProgram: the value a "yes" sets; for productDescription: the description id. */
  value: string;
  /** Plain-language question shown to the user. */
  prompt: string;
  /** What changes if confirmed, e.g. "Exempt from the 12.5% Section 301 duty". */
  effect: string;
  /** Proof the importer may need, e.g. "CBP may ask for an end-use certification". */
  caveat?: string;
  sources: TariffMeasureSource[];
  /** kind 'fact' only: the fact has no default (defaultWhenUnanswered null) — the calculation needs an answer. */
  mustAnswer?: boolean;
  /** kind 'fact' only: what the engine assumes when the question is left unanswered. */
  defaultAnswer?: boolean;
}

/**
 * An import ban (issue #1796): goods matching it may not be imported at all — not a duty, so not a measure and not in
 * `tariff_measures`. Bundled data in src/tariff-data/calculator/import-bans.json, generated by
 * src/scripts/tariff-calculator/build-import-bans.py (e.g. Section 338 bans on products of Canada, Proclamations 11061–11063).
 */
export interface TariffImportBan {
  /** Stable id, e.g. "ca-338-11063-motorcycles". */
  id: string;
  /** ISO2 countries of origin the ban covers. */
  countries: string[];
  /** HTS digit prefixes without dots ("871150", "2208306020"). */
  coveragePrefixes: string[];
  /** ISO date: goods imported on or after this date are banned. */
  effectiveFrom: string;
  /** ISO date, inclusive; omitted / null = open-ended. */
  effectiveTo?: string | null;
  /** Fact conditions (ids in confirmation-facts.json), same semantics as measure conditions. */
  conditions?: Pick<TariffMeasureConditions, 'factsTrue' | 'factsFalse'>;
  /** Plain-language description of what is banned. */
  description: string;
  sources: TariffMeasureSource[];
}

export interface TariffImportBansFile {
  generatedAt?: string;
  bans: TariffImportBan[];
}

/** An import ban that matches a shipment (returned by the calculate and requirements routes). */
export interface TariffImportProhibition {
  banId: string;
  /** Plain-language reason, e.g. "Products of Canada under 8711.50.00 … are excluded from importation". */
  reason: string;
  sources: TariffMeasureSource[];
  /** ISO date the ban starts. */
  effectiveFrom: string;
  /**
   * Set when the ban depends on a must-answer fact that hasn't been answered: the goods are banned only if the answer is
   * as stated here (e.g. "packaged in direct-to-consumption containers").
   */
  unconfirmed?: { factId: string; prompt: string; bannedWhen: boolean }[];
  /** Set by the calculate route next to a computed duty: the duty applies only to goods imported before the ban but entered later. */
  dutyNote?: string;
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
  /** Charge the rate on this content value instead of the full customs value (see TariffContentBasis). */
  contentBasis?: TariffContentBasis;
  /**
   * With contentBasis 'nonUsContent': the U.S.-content deduction is capped at this % of the customs value
   * (e.g. 40 for note 16(j) / 9903.82.20: duty on non-U.S. content plus U.S. content above 40% of value).
   * Omitted = no cap (the whole U.S.-content value is deducted).
   */
  usContentDeductionCapPct?: number;
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
  /**
   * Content values in USD the importer declares (issue #1796): metal content for Section 232 derivatives, and the
   * U.S.-content value for USMCA-qualifying autos/parts. A content-based measure whose content value is missing makes
   * the engine return an error asking for it (never silently charge the full value or nothing).
   */
  contentValuesUsd?: Partial<Record<'steel' | 'aluminum' | 'copper' | 'usContent', number>>;
  /**
   * Sugar polarity in degrees (above 0, at most 100) for a base rate graded by polarity (raw cane / beet sugar of heading
   * 1701: "3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees …"). Missing = priced at 100°, the rate's
   * highest amount, and the base line's notes say so.
   */
  polarityDegrees?: number;
  /**
   * Declared values in USD of the parts a base rate is charged on (issue #1812): "2.5% on the value of the lead content"
   * → { "lead content": 9000 }; "4.7% on the value of the rifle + 20% on the value of the telescopic sight, if any" →
   * { rifle: 800, "telescopic sight": 200 }. Keys are the component as the rate names it (lower case). A missing value
   * is an engine error ("Value required"), never a silent $0.
   */
  componentValuesUsd?: Record<string, number>;
  /**
   * The other HTS lines a base rate refers to (issue #1812): "The rate applicable to the article of which it is a part
   * or accessory" (one line), "… to each garment in the ensemble if separately entered" (one per garment, each with its
   * value), embroidery in the piece "not less than the rate … if not embroidered" (one line). The caller loads each
   * line's rates (the API route from `hts_codes`; golden scenarios state them).
   */
  referencedLines?: MeasureEngineReferencedLine[];
  /** ISO date. */
  entryDate: string;
}

/** A line another line's base rate refers to, with its HTS rates and — for article-by-article sets — its share of the shipment. */
export interface MeasureEngineReferencedLine {
  hts10: string;
  general: string | null;
  special: string | null;
  column2?: string | null;
  /** Ensembles / sets priced article by article: the value of the articles entered under this line (the values add up to the customs value). */
  valueUsd?: number;
  /** Quantities for this line's per-unit rate; default (whole / floor / cap references) = the shipment's quantities. */
  quantities?: Record<string, number>;
}

export interface MeasureEngineDutyLine {
  /** "base" or the Chapter 99 code. */
  code: string;
  label: string;
  rateText: string;
  amountUsd: number;
  sources: TariffMeasureSource[];
  /** Plain-language notes on how the line was priced (e.g. which FTA quota heading the claim was entered under). */
  notes?: string[];
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

// ---------------------------------------------------------------------------
// FTA quota headings (Chapter 98 subchapters XXII / XXIII, Chapter 99 subchapters VIII, XVIII, XIX, XXI)
// ---------------------------------------------------------------------------

/**
 * How a Chapter 98/99 FTA heading is charged relative to its trade agreement's quota:
 *   inQuota       — "Subject to the quantitative limits specified in U.S. note …" (the in-quota rate)
 *   safeguard     — a safeguard rate that applies above the quota when the note's trigger is met (AU beef, note 8(c))
 *   overQuota     — "Other" / "Goods provided for in note N(b)(2)" (above the quota)
 *   unconditional — no quota or safeguard (e.g. goods of Mexico under USMCA, 9823.xx.01)
 *   notModelled   — a heading whose rate the calculator can't price (`reason` says why)
 */
export type FtaQuotaHeadingKind = 'inQuota' | 'safeguard' | 'overQuota' | 'unconditional' | 'notModelled';

/** One Chapter 98/99 heading that an HTS line's special column points to ("See 9822.04.01-9822.04.03 (AU)"). */
export interface FtaQuotaHeading {
  /** "9822.04.01". */
  code: string;
  /** SPI symbol the heading's rate is listed for ("AU", "S+", "P+"). */
  spi: string;
  /** Rate text without the SPI symbol ("Free", "17.1%", "77.2¢/liter"). */
  rateText: string;
  kind: FtaQuotaHeadingKind;
  /** U.S. note to the heading's subchapter that sets the quota / safeguard, e.g. "8(b)", "1(b)(2)"; null when none is cited. */
  noteRef: string | null;
  /** "98" or "99". */
  chapter: string;
  /** Roman numeral of the subchapter, e.g. "XXII". */
  subchapter: string;
  /** ISO2 countries whose goods the heading is for (USMCA: MX for note N(a), CA for note N(b)). */
  countries: string[];
  /** 8-digit subheadings the heading's own description limits it to; empty = every line that points to it. */
  subheadings: string[];
  /** The heading's own description and the indented text above it (nearest first), as the HTS states them. */
  description: string;
  context: string[];
  /** Last day (ISO) the subchapter's note says its provisions apply; absent = open-ended. */
  effectiveTo?: string;
  /** notModelled only: why the calculator does not price it. */
  reason?: string;
}

export interface FtaQuotaHeadingsFile {
  htsEdition: string;
  /** usitc.gov URL of the HTS JSON the rows were read from. */
  sourceUrl: string;
  generatedAt: string;
  /** Chapter 98 / 99 PDFs of the same edition (the U.S. notes the headings cite). */
  noteSources: TariffMeasureSource[];
  headings: FtaQuotaHeading[];
}
