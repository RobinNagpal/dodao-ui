import { GetSingleCriteriaMatchingRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const getCriteriaMatchingForAttachment = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<string> => {
  const { tickerKey } = await params;
  const body = (await req.json()) as GetSingleCriteriaMatchingRequest;
  if (!body.criterionKey || !body.sequenceNumber) {
    throw new Error('sequenceNumber and criterionKey are required in the request body.');
  }

  const url = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/single-criteria-matching';
  const payload = { ticker: tickerKey, sequenceNo: body.sequenceNumber, criterionKey: body.criterionKey };
  const criteriaMatchResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const criteriaMatch = await criteriaMatchResponse.json();

  return criteriaMatch.data ?? criteriaMatch.message;
};

export const POST = withErrorHandlingV2<string>(getCriteriaMatchingForAttachment);
