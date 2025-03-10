import { getCriteriaLookupList, getMatchingCriteriaLookupItem, updateCriteriaLookupListForCustomCriteria, uploadCustomCriteriaToS3 } from '@/lib/publicEquity';
import { IndustryGroupCriteria } from '@/types/public-equity/criteria-types';
import { UpsertCustomCriteriaRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const upsertCustomCriteria = async (req: NextRequest): Promise<IndustryGroupCriteria> => {
  const body = (await req.json()) as UpsertCustomCriteriaRequest;
  const { sectorId, industryGroupId, criteria } = body;
  console.log(`Creating Custom criteria for Sector ID: ${sectorId}, Industry Group ID: ${industryGroupId}`);
  if (!sectorId || !industryGroupId || !criteria) {
    throw new Error('Missing required parameters' + { sectorId, industryGroupId, criteria });
  }
  const customCriteriaList = await getCriteriaLookupList();
  const matchingCriteria = getMatchingCriteriaLookupItem(customCriteriaList, sectorId, industryGroupId);
  const finalData: IndustryGroupCriteria = {
    tickers: [],
    selectedSector: { id: matchingCriteria.sectorId, name: matchingCriteria.sectorName },
    selectedIndustryGroup: { id: matchingCriteria.industryGroupId, name: matchingCriteria.industryGroupName },
    criteria: criteria,
  };
  const customCriteriaUrl = await uploadCustomCriteriaToS3(matchingCriteria, finalData);
  await updateCriteriaLookupListForCustomCriteria(matchingCriteria, customCriteriaUrl);
  return finalData;
};
export const POST = withErrorHandlingV2<IndustryGroupCriteria>(upsertCustomCriteria);
