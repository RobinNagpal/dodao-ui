import { generateAiCriteria, getCriteriaLookupList, getMatchingCriteriaLookupItem, updateCriteriaLookupList, uploadAiCriteriaToS3 } from '@/lib/publicEquity';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { CreateCriteriaRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const upsertAiCriteria = async (req: NextRequest): Promise<IndustryGroupCriteriaDefinition> => {
  const body = (await req.json()) as CreateCriteriaRequest;
  console.log(`Creating AI criteria for: sectorId: ${body.sectorId}, industryGroupId: ${body.industryGroupId}`);
  const customCriteriaList = await getCriteriaLookupList();
  const criteriaLookupItem = getMatchingCriteriaLookupItem(customCriteriaList, body.sectorId, body.industryGroupId);
  const aiCriteriaResponse = await generateAiCriteria(criteriaLookupItem);
  const aiCriteriaUrl = await uploadAiCriteriaToS3(criteriaLookupItem, aiCriteriaResponse);
  await updateCriteriaLookupList(criteriaLookupItem, aiCriteriaUrl);

  return aiCriteriaResponse;
};
export const POST = withErrorHandlingV2<IndustryGroupCriteriaDefinition>(upsertAiCriteria);
