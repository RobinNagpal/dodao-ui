// app/api/public-equity/copy-ai-criteria/route.ts
import { CriteriaLookupItem } from '@/types/public-equity/ticker-report';
import { CreateCriteriaRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import {
  getCriteriaLookupList,
  getMatchingCriteriaLookupItem,
  getAiCriteria,
  uploadCustomCriteriaToS3,
  updateCriteriaLookupListForCustomCriteria,
} from '@/lib/publicEquity';

const handler = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<CriteriaLookupItem> => {
  const body = (await req.json()) as CreateCriteriaRequest;
  console.log(`Copy AI criteria for: sectorId: ${body.sectorId}, industryGroupId: ${body.industryGroupId}`);
  const customCriteriaList = await getCriteriaLookupList();
  const criteriaLookupItem = getMatchingCriteriaLookupItem(customCriteriaList, body.sectorId, body.industryGroupId);
  const aiCriteriaData = await getAiCriteria(criteriaLookupItem);
  const customCriteriaUrl = await uploadCustomCriteriaToS3(criteriaLookupItem, aiCriteriaData);
  await updateCriteriaLookupListForCustomCriteria(criteriaLookupItem, customCriteriaUrl);
  return criteriaLookupItem;
};
export const POST = withErrorHandlingV2<CriteriaLookupItem>(handler);
