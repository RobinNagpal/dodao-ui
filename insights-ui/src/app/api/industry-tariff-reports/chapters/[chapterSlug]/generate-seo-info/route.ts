import { chapterGenerateRoute } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { generateAndSaveAllSeoDetails } from '@/scripts/industry-tariff-reports/08-report-seo-info';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const maxDuration = 300;

export const POST = withErrorHandlingV2<IndustryTariffReport>(
  chapterGenerateRoute(async (slug) => {
    await generateAndSaveAllSeoDetails(slug);
  })
);
