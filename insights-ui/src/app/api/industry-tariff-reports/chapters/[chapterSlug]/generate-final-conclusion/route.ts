import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getFinalConclusionAndSaveToFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';

export const POST = withAdminOnly<ChapterGenerateResponse>(chapterGenerateRoute('conclusion', (slug) => getFinalConclusionAndSaveToFile(slug)));
