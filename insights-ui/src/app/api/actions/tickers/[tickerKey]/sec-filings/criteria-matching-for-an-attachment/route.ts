import { CriterionMatchResponse, GetSingleCriteriaMatchingRequest } from '@/types/public-equity/ticker-request-response';
import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const getCriteriaMatchingForAttachment = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ tickerKey: string }> }
): Promise<CriterionMatchResponse> => {
  const { tickerKey } = await params;
  const body = (await req.json()) as GetSingleCriteriaMatchingRequest;
  if (!body.sequenceNumber) {
    throw new Error('sequenceNumber is required in the request body.');
  }

  const url = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/criteria-matching-for-an-attachment';
  const payload = { ticker: tickerKey, sequence_no: body.sequenceNumber };
  const criteriaMatchResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const criteriaMatch = (await criteriaMatchResponse.json()) as CriterionMatchResponse & { message?: string };

  if ('message' in criteriaMatch && criteriaMatch.message) {
    throw new Error(criteriaMatch.message);
  }
  return criteriaMatch as CriterionMatchResponse;
};

export const POST = withAdminOrToken<CriterionMatchResponse>(getCriteriaMatchingForAttachment);
