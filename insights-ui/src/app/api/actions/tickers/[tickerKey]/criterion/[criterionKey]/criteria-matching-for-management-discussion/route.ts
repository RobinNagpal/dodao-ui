import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const getCriteriaMatchingForManagementDiscussion = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }
): Promise<string> => {
  const { tickerKey, criterionKey } = await params;

  const url = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/criteria-matching-for-management-discussion';
  const payload = { ticker: tickerKey, criterion_key: criterionKey };
  const managementDiscussionResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const managementDiscussion = (await managementDiscussionResponse.json()) as { message?: string; data: string };

  if ('message' in managementDiscussion && managementDiscussion.message) {
    throw new Error(managementDiscussion.message);
  }
  return managementDiscussion.data;
};

export const POST = withErrorHandlingV2<string>(getCriteriaMatchingForManagementDiscussion);
