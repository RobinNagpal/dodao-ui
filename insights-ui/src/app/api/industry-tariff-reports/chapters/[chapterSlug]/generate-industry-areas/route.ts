import { chapterGenerateRoute } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getAndWriteIndustryAreaSectionToJsonFile } from '@/scripts/industry-tariff-reports/05-industry-areas';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<IndustryTariffReport>(chapterGenerateRoute((slug) => getAndWriteIndustryAreaSectionToJsonFile(slug)));
