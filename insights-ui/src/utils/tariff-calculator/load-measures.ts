import 'server-only';
import { getAppConfigValue } from '@/lib/appConfig/appConfig';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type {
  MeasureEngineLine,
  TariffMeasureConditions,
  TariffMeasureRateKind,
  TariffMeasureRecord,
  TariffMeasureSource,
} from '@/types/tariff-calculator-measures';
import { formatHts10, HtsLookupError } from '@/utils/tariff-calculator/load-candidates';

// Read-only loaders for the official-measures engine (issue #1785): the HTS line's own
// rates from `hts_codes` and the reviewed extra-duty measures from `tariff_measures`.

/** App Setting: comma-separated HTS chapter numbers priced by the official-measures engine (e.g. "1,30"). */
export const TARIFF_CALC_MEASURES_ENABLED_KEY = 'TARIFF_CALC_MEASURES_ENABLED';

/** Chapters the official-measures engine is switched on for. Empty = off everywhere. */
export async function getMeasuresEnabledChapters(): Promise<Set<number>> {
  const raw = (await getAppConfigValue(TARIFF_CALC_MEASURES_ENABLED_KEY)) ?? '';
  const chapters = raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 99);
  return new Set(chapters);
}

export function htsChapterNumber(hts10: string): number {
  return parseInt(hts10.slice(0, 2), 10);
}

export async function isMeasuresEngineEnabledFor(hts10: string): Promise<boolean> {
  return (await getMeasuresEnabledChapters()).has(htsChapterNumber(hts10));
}

function nonEmpty(s: string | null | undefined): s is string {
  return typeof s === 'string' && s.trim() !== '';
}

// Statistical-suffix (10-digit) rows usually leave the rate columns blank; the rates sit on
// the 8-digit (or higher) row above. Walk up the hierarchy to the nearest row with a
// general rate and take general/special/column 2 from that one row; units come from the
// nearest row that lists any.
const MAX_ANCESTORS = 8;

/** The HTS line's base rates and units. Throws HtsLookupError (404) for an unknown code. */
export async function loadMeasureEngineLine(hts10: string): Promise<MeasureEngineLine> {
  const select = { parentId: true, generalRateOfDuty: true, specialRateOfDuty: true, column2RateOfDuty: true, unitOfQuantity: true } as const;
  let row = await prisma.htsCode.findUnique({ where: { spaceId_htsCode10: { spaceId: KoalaGainsSpaceId, htsCode10: hts10 } }, select });
  if (!row) {
    throw new HtsLookupError(`We couldn't find HTS code ${formatHts10(hts10)} in the US tariff schedule. Double-check the 10-digit code and try again.`);
  }
  let units: string[] = row.unitOfQuantity;
  for (let i = 0; i < MAX_ANCESTORS && row && !nonEmpty(row.generalRateOfDuty) && row.parentId; i++) {
    row = await prisma.htsCode.findUnique({ where: { id: row.parentId }, select });
    if (row && units.length === 0) units = row.unitOfQuantity;
  }
  const general = row?.generalRateOfDuty;
  const special = row?.specialRateOfDuty;
  const column2 = row?.column2RateOfDuty;
  return {
    hts10,
    general: nonEmpty(general) ? general.trim() : null,
    special: nonEmpty(special) ? special.trim() : null,
    column2: nonEmpty(column2) ? column2.trim() : null,
    units,
  };
}

const RATE_KINDS: TariffMeasureRateKind[] = ['additive', 'inPlaceOfBase', 'floor', 'relief'];

export interface LoadedMeasures {
  measures: TariffMeasureRecord[];
  /** HTS edition the measures were reviewed against, e.g. "2026 Revision 21" (the most common one when mixed). */
  htsEdition: string | null;
  /** Latest date (YYYY-MM-DD) any measure was checked against its official sources. */
  reviewedAt: string | null;
}

/** Every reviewed measure (a few hundred rows at most; the engine filters by line and country). */
export async function loadMeasures(): Promise<LoadedMeasures> {
  const rows = await prisma.tariffMeasure.findMany({ where: { spaceId: KoalaGainsSpaceId }, orderBy: { measureKey: 'asc' } });
  const editions = new Map<string, number>();
  let reviewedMs = 0;
  const measures: TariffMeasureRecord[] = [];
  for (const r of rows) {
    editions.set(r.htsEdition, (editions.get(r.htsEdition) ?? 0) + 1);
    reviewedMs = Math.max(reviewedMs, r.reviewedAt.getTime());
    if (!RATE_KINDS.includes(r.rateKind as TariffMeasureRateKind)) {
      console.warn(`[tariff-calculator] measure ${r.measureKey} has unknown rateKind "${r.rateKind}" — skipped`);
      continue;
    }
    measures.push({
      measureKey: r.measureKey,
      program: r.program,
      ch99Code: r.ch99Code,
      rateKind: r.rateKind as TariffMeasureRateKind,
      ratePct: r.ratePct === null ? null : Number(r.ratePct),
      countriesInclude: r.countriesInclude,
      countriesExclude: r.countriesExclude,
      coverageInclude: r.coverageInclude,
      coverageExclude: r.coverageExclude,
      conditions: (r.conditions ?? {}) as TariffMeasureConditions,
      replacesCodes: r.replacesCodes,
      effectiveFrom: r.effectiveFrom.toISOString().slice(0, 10),
      effectiveTo: r.effectiveTo ? r.effectiveTo.toISOString().slice(0, 10) : null,
      sources: (Array.isArray(r.sources) ? r.sources : []) as unknown as TariffMeasureSource[],
      htsEdition: r.htsEdition,
      notes: r.notes ?? undefined,
      reviewedAt: r.reviewedAt.toISOString().slice(0, 10),
    });
  }
  const htsEdition = Array.from(editions).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return { measures, htsEdition, reviewedAt: reviewedMs > 0 ? new Date(reviewedMs).toISOString().slice(0, 10) : null };
}
