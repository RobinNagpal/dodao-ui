import { prisma } from '@/prisma';
import type { ExecutiveSummary, TariffReportSeoDetails, TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface IndustrySeoResponse {
  seoDetails: TariffReportSeoDetails | null;
  industryName: string | null;
  countryNames: string[];
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustrySeoResponse> {
  const { industry } = await params;
  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_oldUrl: { spaceId: KoalaGainsSpaceId, oldUrl: industry } },
    select: { seoDetails: true, executiveSummary: true, tariffUpdates: true },
  });
  const executiveSummary = row?.executiveSummary as ExecutiveSummary | null | undefined;
  const tariffUpdates = row?.tariffUpdates as TariffUpdatesForIndustry | null | undefined;
  return {
    seoDetails: (row?.seoDetails as TariffReportSeoDetails | null) ?? null,
    industryName: executiveSummary?.title ?? null,
    countryNames: tariffUpdates?.countryNames ?? [],
  };
}

export const GET = withErrorHandlingV2<IndustrySeoResponse>(getHandler);
