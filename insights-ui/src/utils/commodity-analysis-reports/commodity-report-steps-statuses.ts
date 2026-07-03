import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { CommodityGenerationRequest } from '@prisma/client';

/** A regenerate flag paired with the step it enables. */
const STEP_FLAGS: Array<{ step: CommodityReportType; flag: keyof CommodityGenerationRequest }> = [
  { step: CommodityReportType.SUPPLY_AND_DEMAND, flag: 'regenerateSupplyAndDemand' },
  { step: CommodityReportType.PRICE_AND_VALUE, flag: 'regeneratePriceAndValue' },
  { step: CommodityReportType.VOLATILITY_AND_RISK, flag: 'regenerateVolatilityAndRisk' },
  { step: CommodityReportType.FUTURE_OUTLOOK, flag: 'regenerateFutureOutlook' },
  { step: CommodityReportType.KEY_FACTS, flag: 'regenerateKeyFacts' },
  { step: CommodityReportType.FINAL_SUMMARY, flag: 'regenerateFinalSummary' },
];

export function calculateCommodityPendingSteps(request: CommodityGenerationRequest): CommodityReportType[] {
  return STEP_FLAGS.filter(({ step, flag }) => request[flag] === true && !request.completedSteps.includes(step) && !request.failedSteps.includes(step)).map(
    ({ step }) => step
  );
}
