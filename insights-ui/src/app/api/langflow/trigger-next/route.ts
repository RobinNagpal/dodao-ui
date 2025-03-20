// app/api/public-equity/next-criterion-report/route.ts
import { NextCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const triggerNext = async (req: NextRequest) => {
  const body = (await req.json()) as NextCriterionReportRequest;
};
export const POST = withErrorHandlingV2(triggerNext);
