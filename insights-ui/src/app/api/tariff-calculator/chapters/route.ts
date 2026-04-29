import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// Lightweight chapter list — used by `generateStaticParams` on the chapter
// detail route to enumerate every (chapter, slug) URL we want pre-rendered.

export interface TariffChapterListItem {
  number: number;
  title: string;
}

async function getHandler(): Promise<TariffChapterListItem[]> {
  return prisma.tariffChapter.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    orderBy: { number: 'asc' },
    select: { number: true, title: true },
  });
}

export const GET = withErrorHandlingV2<TariffChapterListItem[]>(getHandler);
