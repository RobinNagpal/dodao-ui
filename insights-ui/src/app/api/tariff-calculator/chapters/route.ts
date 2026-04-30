import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// Lightweight chapter list — used by `generateStaticParams` on the chapter
// detail route to enumerate every (section, chapter) URL we want pre-rendered.

export interface TariffChapterListItem {
  number: number;
  title: string;
  sectionNumber: number;
}

async function getHandler(): Promise<TariffChapterListItem[]> {
  const chapters = await prisma.tariffChapter.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    orderBy: { number: 'asc' },
    select: {
      number: true,
      title: true,
      section: { select: { number: true } },
    },
  });
  return chapters.map((c) => ({ number: c.number, title: c.title, sectionNumber: c.section.number }));
}

export const GET = withErrorHandlingV2<TariffChapterListItem[]>(getHandler);
