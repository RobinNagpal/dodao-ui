import { prisma } from '@/prisma';
import type {
  ExecutiveSummary,
  FinalConclusion,
  IndustryAreaSection,
  IndustryAreasWrapper,
  IndustryTariffReport,
  ReportCover,
  TariffReportSeoDetails,
  TariffUpdatesForIndustry,
  UnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_oldUrl: { spaceId: KoalaGainsSpaceId, oldUrl: industry } },
    select: {
      introduction: true,
      executiveSummary: true,
      tariffUpdates: true,
      understandIndustry: true,
      industryAreas: true,
      industryAreasSections: true,
      conclusion: true,
      seoDetails: true,
    },
  });

  if (!row) {
    return {};
  }

  return {
    reportCover: (row.introduction as ReportCover | null) ?? undefined,
    executiveSummary: (row.executiveSummary as ExecutiveSummary | null) ?? undefined,
    tariffUpdates: (row.tariffUpdates as TariffUpdatesForIndustry | null) ?? undefined,
    understandIndustry: (row.understandIndustry as UnderstandIndustry | null) ?? undefined,
    industryAreas: (row.industryAreas as IndustryAreasWrapper | null) ?? undefined,
    industryAreasSections: (row.industryAreasSections as IndustryAreaSection | null) ?? undefined,
    finalConclusion: (row.conclusion as FinalConclusion | null) ?? undefined,
    reportSeoDetails: (row.seoDetails as TariffReportSeoDetails | null) ?? undefined,
  };
}

export const GET = withErrorHandlingV2<IndustryTariffReport>(getHandler);
