import type { TariffProductType } from '@/types/tariff-calculator-measures';
import { CalculatorEngine, DataFreshness, perUnitRequirements, PerUnitRequirement } from '@/utils/tariff-calculator/duty-engine';
import { loadCandidates, loadDataFreshness } from '@/utils/tariff-calculator/load-candidates';
import { isMeasuresEngineEnabledFor, loadMeasureEngineLine, loadMeasures } from '@/utils/tariff-calculator/load-measures';
import {
  claimablePrograms,
  COLUMN2_COUNTRIES,
  conditionProgramsForLine,
  productTypesForLine,
  rateQuantityRequirements,
} from '@/utils/tariff-calculator/measures-engine';
import { parseHts10Param } from '@/utils/tariff-reports/tariff-input-validation';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// GET /api/tariff-calculator/requirements/<hts10>
//
// What the calculator form needs to ask for before the first calculation: the
// units any currently-effective per-unit duty on this HTS line is charged in
// (e.g. cattle 0102.29.40.54 "1¢/kg" -> KG), and how fresh the cached
// extra-duty data is. Much lighter than the full candidate-codes payload.
//
// For chapters on the official-measures engine (TARIFF_CALC_MEASURES_ENABLED) it
// also returns the trade deals the line offers (for the "Claim a trade deal"
// select) and the product types its extra duties depend on (for "Product type").

/** A trade deal (SPI program) the line's special column offers. */
export interface ClaimableTradeDeal {
  /** Program code(s) sharing one plain name, e.g. ["S", "S+"] for USMCA. The first is sent as `claimedSpi`. */
  codes: string[];
  name: string;
  /** Rate under the deal, e.g. "Free". */
  rateText: string;
  /** Countries the deal can be claimed for; empty = any. */
  countries: string[];
  /** Per-unit quantities the deal's rate needs. */
  perUnit: PerUnitRequirement[];
}

export interface OfficialMeasuresRequirements {
  tradeDeals: ClaimableTradeDeal[];
  /** Product types some in-scope extra duty is conditioned on; empty = don't ask. */
  productTypes: TariffProductType[];
  /** Countries charged the column 2 rate, and the quantities that rate needs. */
  column2Countries: string[];
  column2PerUnit: PerUnitRequirement[];
}

export interface CalculatorRequirementsResponse {
  hts10: string;
  /** Quantities the line's own (general) rate needs, or the cached candidate codes' units. */
  perUnit: PerUnitRequirement[];
  dataFreshness: DataFreshness;
  engine?: CalculatorEngine;
  officialMeasures?: OfficialMeasuresRequirements;
}

async function officialMeasuresRequirements(hts10: string): Promise<CalculatorRequirementsResponse> {
  const [line, loaded] = await Promise.all([loadMeasureEngineLine(hts10), loadMeasures()]);
  // One choice per plain name (USMCA lists both "S" and "S+").
  const deals = new Map<string, ClaimableTradeDeal>();
  for (const p of claimablePrograms(line, conditionProgramsForLine(hts10, loaded.measures))) {
    const key = `${p.name}|${p.rateText}`;
    const existing = deals.get(key);
    if (existing) existing.codes.push(p.code);
    else deals.set(key, { codes: [p.code], name: p.name, rateText: p.rateText, countries: p.countries, perUnit: rateQuantityRequirements(p.rateText) });
  }
  const freshness = await loadDataFreshness(hts10, loaded.reviewedAt);
  return {
    hts10,
    perUnit: rateQuantityRequirements(line.general),
    dataFreshness: { ...freshness, engine: 'official-measures', htsEdition: loaded.htsEdition },
    engine: 'official-measures',
    officialMeasures: {
      tradeDeals: Array.from(deals.values()),
      productTypes: productTypesForLine(hts10, loaded.measures),
      column2Countries: line.column2 ? COLUMN2_COUNTRIES : [],
      column2PerUnit: rateQuantityRequirements(line.column2),
    },
  };
}

async function getHandler(_req: NextRequest, dynamic: { params: Promise<{ hts10: string }> }): Promise<CalculatorRequirementsResponse> {
  const hts10 = parseHts10Param((await dynamic.params).hts10);
  if (await isMeasuresEngineEnabledFor(hts10)) return officialMeasuresRequirements(hts10);
  const { candidates, lastFetchedAt } = await loadCandidates(hts10);
  return {
    hts10,
    perUnit: perUnitRequirements(candidates, new Date()),
    dataFreshness: await loadDataFreshness(hts10, lastFetchedAt),
    engine: 'candidate-codes',
  };
}

export const GET = withErrorHandlingV2<CalculatorRequirementsResponse>(getHandler);
