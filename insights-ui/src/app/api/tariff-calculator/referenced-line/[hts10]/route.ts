import type { PerUnitRequirement } from '@/utils/tariff-calculator/duty-engine';
import { loadMeasureEngineLine } from '@/utils/tariff-calculator/load-measures';
import { rateQuantityRequirements } from '@/utils/tariff-calculator/measures-engine';
import { parseHts10Param } from '@/utils/tariff-reports/tariff-input-validation';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// GET /api/tariff-calculator/referenced-line/<hts10>
//
// The HTS rates of a line another line's base rate refers to (issue #1812): the garment of an ensemble ("The rate
// applicable to each garment in the ensemble if separately entered"), the article a part or accessory belongs to, the
// complete movement of a movement set, the fabric of embroidery in the piece. The calculator form shows the rate as
// the importer types the code, and asks the quantities its per-unit rates need. Read-only; an unknown code is a 404.

export interface ReferencedLineResponse {
  hts10: string;
  general: string | null;
  column2: string | null;
  /** Quantities the general or column 2 rate is charged per. */
  perUnit: PerUnitRequirement[];
}

async function getHandler(_req: NextRequest, dynamic: { params: Promise<{ hts10: string }> }): Promise<ReferencedLineResponse> {
  const hts10 = parseHts10Param((await dynamic.params).hts10);
  const line = await loadMeasureEngineLine(hts10);
  const perUnit: PerUnitRequirement[] = [];
  for (const r of [...rateQuantityRequirements(line.general), ...rateQuantityRequirements(line.column2)]) {
    if (!perUnit.some((p) => p.uom === r.uom)) perUnit.push(r);
  }
  return { hts10, general: line.general, column2: line.column2 ?? null, perUnit };
}

export const GET = withErrorHandlingV2<ReferencedLineResponse>(getHandler);
