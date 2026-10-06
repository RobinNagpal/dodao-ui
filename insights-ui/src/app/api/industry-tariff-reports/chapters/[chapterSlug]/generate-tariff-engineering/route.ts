import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getAndWriteTariffEngineeringJson } from '@/scripts/industry-tariff-reports/06-tariff-engineering';

export const POST = withAdminOnly<ChapterGenerateResponse>(chapterGenerateRoute('tariffEngineering', (slug) => getAndWriteTariffEngineeringJson(slug)));
