import {
  CreateCriteriaRequest,
  generateAiCriteria,
  getCriteriaLookupList,
  getMatchingCriteriaLookupItem,
  IndustryGroupCriteria,
  updateCriteriaLookupList,
  uploadAiCriteriaToS3,
} from '@/lib/publicEquity';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const upsertAiCriteria = async (req: NextRequest): Promise<IndustryGroupCriteria> => {
  const body = (await req.json()) as CreateCriteriaRequest;
  console.log(`Creating AI criteria for: sectorId: ${body.sectorId}, industryGroupId: ${body.industryGroupId}`);
  const customCriteriaList = await getCriteriaLookupList();
  const criteriaLookupItem = getMatchingCriteriaLookupItem(customCriteriaList, body.sectorId, body.industryGroupId);
  const aiCriteriaResponse = await generateAiCriteria(criteriaLookupItem);
  const aiCriteriaUrl = await uploadAiCriteriaToS3(criteriaLookupItem, aiCriteriaResponse);
  await updateCriteriaLookupList(criteriaLookupItem, aiCriteriaUrl);

  return aiCriteriaResponse;
};
export const POST = withErrorHandlingV2<IndustryGroupCriteria>(upsertAiCriteria);
