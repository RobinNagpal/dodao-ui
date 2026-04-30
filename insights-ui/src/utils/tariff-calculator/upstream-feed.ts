// Thin wrapper around the upstream public candidate-codes feed. The endpoint
// is treated as a vendor-agnostic data source so the rest of the codebase can
// reason about "candidate codes" without naming the upstream provider; the
// host is overridable via TARIFF_CANDIDATE_CODES_BASE_URL when we eventually
// proxy or replace it.

import { TariffApplicabilityConditionKind, TariffCandidateCodeType, TariffCountryScopeType, TariffRelatedCodeKind } from '@prisma/client';

const DEFAULT_BASE_URL = 'https://tariffs.flexport.com';
const USER_AGENT = 'Mozilla/5.0 (compatible; KoalaGains-TariffCalculator/1.0; +https://koalagains.com)';

export interface UpstreamCodeVariant {
  code: string;
  variant: string | null;
}

export interface UpstreamRateInfo {
  primaryRate: string;
  secondaryRate: string;
  otherRate: string;
  penaltyRate: string;
  computationCode: string;
}

export type UpstreamCountryScope = { __typename: 'all' } | { __typename: 'only'; countries: string[] } | { __typename: 'allExcept'; excluded: string[] };

export type UpstreamApplicabilityCondition =
  | { __typename: 'CustomsTariffEquals'; fieldKey: string; fieldShouldEqual: string }
  | { __typename: 'CustomsTariffGreater'; fieldKey: string; threshold: string; includingThreshold: boolean }
  | { __typename: 'CustomsTariffLess'; fieldKey: string; threshold: string; includingThreshold: boolean }
  | { __typename: 'CustomsTariffSomeSpiApplied'; fieldKey: string; programCodes: string[] };

export interface UpstreamLineSplitCondition {
  __typename: 'CustomsTariffGreater' | 'CustomsTariffLess';
  fieldKey: string;
  threshold: string;
  includingThreshold: boolean;
}

export interface UpstreamSpecialRate {
  spi: string;
  rateDescription: string;
  rateInfo: UpstreamRateInfo;
}

export interface UpstreamImportProgram {
  importProgram: {
    programName: string;
    programIndicator: string;
    generalNote: string;
    countriesOfOrigin: string[];
    customsTariffSpi: {
      specialProgramIndicator: string;
      agreementName: string;
      generalNote: string;
      countriesOfOrigin: string[];
      excludeMpf: boolean;
    };
  };
  customsValue: number;
  calculatedDuty: number;
  dutyRate: number;
  percentOfLineValue: number;
}

export interface UpstreamTradeAnalytic {
  analyticsLevel: string;
  countryOfOrigin: { countryName: string; usCustomsCountryCode: string };
  htsCode: string;
  date: string;
  totalCustomsValue: number;
  totalCalculatedDuty: number;
  totalDutyRate: number;
  importPrograms: UpstreamImportProgram[];
}

export interface UpstreamCandidateCode {
  type: 'COMMODITY_CODE' | 'SPECIAL_CODE';
  codeVariant: UpstreamCodeVariant;
  lineDescription: string;
  fullDescription: string;
  effectiveFrom: string;
  effectiveTo: string;
  rateDescription: string;
  rateInfo: UpstreamRateInfo;
  unitsOfMeasure: string[];
  flagsForAntiDumping: boolean;
  flagsForCountervailing: boolean;
  priority: number;
  requiresUserChoice: boolean;
  countryScope: UpstreamCountryScope;
  label: string;
  category: string | null;
  tags: string[];
  pgaFlags: string[];
  feeFlags: string[];
  parentCodes: string[];
  lineSplitField: string | null;
  lineSplitConditions: UpstreamLineSplitCondition[] | null;
  relatesToCodesDigits: { code: string; variant: string | null }[] | null;
  excludedByCodes: UpstreamCodeVariant[];
  replacesCodes: UpstreamCodeVariant[];
  relatedCodes: UpstreamCodeVariant[];
  specialRates: UpstreamSpecialRate[];
  applicabilityConditions: UpstreamApplicabilityCondition[];
  tradeAnalytics: UpstreamTradeAnalytic[];
}

function baseUrl(): string {
  return process.env.TARIFF_CANDIDATE_CODES_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_BASE_URL;
}

// The upstream sometimes sends `null` where the schema declares an array
// (e.g. specialRates, applicabilityConditions, excludedByCodes, tradeAnalytics).
// Normalize at the boundary so consumers can treat these fields as always-array.
function arr<T>(v: T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : [];
}

function normalizeCandidate(raw: UpstreamCandidateCode): UpstreamCandidateCode {
  return {
    ...raw,
    unitsOfMeasure: arr(raw.unitsOfMeasure),
    tags: arr(raw.tags),
    pgaFlags: arr(raw.pgaFlags),
    feeFlags: arr(raw.feeFlags),
    parentCodes: arr(raw.parentCodes),
    excludedByCodes: arr(raw.excludedByCodes),
    replacesCodes: arr(raw.replacesCodes),
    relatedCodes: arr(raw.relatedCodes),
    specialRates: arr(raw.specialRates),
    applicabilityConditions: arr(raw.applicabilityConditions),
    tradeAnalytics: arr(raw.tradeAnalytics).map((ta) => ({
      ...ta,
      importPrograms: arr(ta.importPrograms).map((p) => ({
        ...p,
        importProgram: {
          ...p.importProgram,
          countriesOfOrigin: arr(p.importProgram.countriesOfOrigin),
          customsTariffSpi: {
            ...p.importProgram.customsTariffSpi,
            countriesOfOrigin: arr(p.importProgram.customsTariffSpi.countriesOfOrigin),
          },
        },
      })),
    })),
  };
}

// `hts10` is the 10-digit HTSUS code with no separators. The upstream
// endpoint returns 404 for non-existent codes; we throw so callers can map
// that to a 404 response.
export async function fetchCandidateCodes(hts10: string): Promise<UpstreamCandidateCode[]> {
  if (!/^\d{10}$/.test(hts10)) {
    throw new Error(`Invalid HTS 10-digit code: ${hts10}`);
  }
  const url = `${baseUrl()}/api/public/v1/candidate-codes/${hts10}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Upstream candidate-codes fetch failed for ${hts10}: HTTP ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  if (!Array.isArray(json)) {
    throw new Error(`Upstream candidate-codes response for ${hts10} is not an array`);
  }
  return (json as UpstreamCandidateCode[]).map(normalizeCandidate);
}

// Conversion helpers that translate upstream discriminated unions into the
// flattened (kind + sparse columns) shape the schema uses.

export function mapCodeType(t: 'COMMODITY_CODE' | 'SPECIAL_CODE'): TariffCandidateCodeType {
  return t === 'COMMODITY_CODE' ? TariffCandidateCodeType.COMMODITY_CODE : TariffCandidateCodeType.SPECIAL_CODE;
}

export function mapCountryScope(scope: UpstreamCountryScope): { type: TariffCountryScopeType; countries: string[] } {
  switch (scope.__typename) {
    case 'all':
      return { type: TariffCountryScopeType.ALL, countries: [] };
    case 'only':
      return { type: TariffCountryScopeType.ONLY, countries: scope.countries };
    case 'allExcept':
      return { type: TariffCountryScopeType.ALL_EXCEPT, countries: scope.excluded };
  }
}

export function mapApplicabilityKind(typename: UpstreamApplicabilityCondition['__typename']): TariffApplicabilityConditionKind {
  switch (typename) {
    case 'CustomsTariffEquals':
      return TariffApplicabilityConditionKind.EQUALS;
    case 'CustomsTariffGreater':
      return TariffApplicabilityConditionKind.GREATER;
    case 'CustomsTariffLess':
      return TariffApplicabilityConditionKind.LESS;
    case 'CustomsTariffSomeSpiApplied':
      return TariffApplicabilityConditionKind.SOME_SPI_APPLIED;
  }
}

export const RELATED_KIND_BY_FIELD: Record<'excludedByCodes' | 'replacesCodes' | 'relatedCodes', TariffRelatedCodeKind> = {
  excludedByCodes: TariffRelatedCodeKind.EXCLUDED_BY,
  replacesCodes: TariffRelatedCodeKind.REPLACES,
  relatedCodes: TariffRelatedCodeKind.RELATED,
};
