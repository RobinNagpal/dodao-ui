// Shared types + mapping helpers for "candidate codes" ingestion.

import { TariffApplicabilityConditionKind, TariffCandidateCodeType, TariffCountryScopeType, TariffRelatedCodeKind } from '@prisma/client';

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

// The upstream occasionally introduces new applicabilityCondition `__typename`
// values that aren't yet mapped to our enum (e.g. `CustomsTariffHasExistingHtsCodes`
// observed when fetching with browser-shaped headers). Callers MUST filter
// unknown conditions via `isKnownApplicabilityCondition` before calling this —
// otherwise we previously emitted `'undefined'::"TariffApplicabilityConditionKind"`
// into generated SQL and got a 22P02 enum-cast error at runtime.
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
    default:
      throw new Error(`Unknown applicabilityCondition __typename: ${String(typename)}. Filter via isKnownApplicabilityCondition() first.`);
  }
}

const KNOWN_APPLICABILITY_TYPENAMES = new Set<string>(['CustomsTariffEquals', 'CustomsTariffGreater', 'CustomsTariffLess', 'CustomsTariffSomeSpiApplied']);

export function isKnownApplicabilityCondition(cond: { __typename?: string }): cond is UpstreamApplicabilityCondition {
  return typeof cond.__typename === 'string' && KNOWN_APPLICABILITY_TYPENAMES.has(cond.__typename);
}

export const RELATED_KIND_BY_FIELD: Record<'excludedByCodes' | 'replacesCodes' | 'relatedCodes', TariffRelatedCodeKind> = {
  excludedByCodes: TariffRelatedCodeKind.EXCLUDED_BY,
  replacesCodes: TariffRelatedCodeKind.REPLACES,
  relatedCodes: TariffRelatedCodeKind.RELATED,
};
