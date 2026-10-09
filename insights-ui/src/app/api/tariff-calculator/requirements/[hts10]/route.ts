import { DataFreshness, perUnitRequirements, PerUnitRequirement } from '@/utils/tariff-calculator/duty-engine';
import { loadCandidates, loadDataFreshness } from '@/utils/tariff-calculator/load-candidates';
import { parseHts10Param } from '@/utils/tariff-reports/tariff-input-validation';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// GET /api/tariff-calculator/requirements/<hts10>
//
// What the calculator form needs to ask for before the first calculation: the
// units any currently-effective per-unit duty on this HTS line is charged in
// (e.g. cattle 0102.29.40.54 "1¢/kg" -> KG), and how fresh the cached
// extra-duty data is. Much lighter than the full candidate-codes payload.

export interface CalculatorRequirementsResponse {
  hts10: string;
  perUnit: PerUnitRequirement[];
  dataFreshness: DataFreshness;
}

async function getHandler(_req: NextRequest, dynamic: { params: Promise<{ hts10: string }> }): Promise<CalculatorRequirementsResponse> {
  const hts10 = parseHts10Param((await dynamic.params).hts10);
  const { candidates, lastFetchedAt } = await loadCandidates(hts10);
  return {
    hts10,
    perUnit: perUnitRequirements(candidates, new Date()),
    dataFreshness: await loadDataFreshness(hts10, lastFetchedAt),
  };
}

export const GET = withErrorHandlingV2<CalculatorRequirementsResponse>(getHandler);
