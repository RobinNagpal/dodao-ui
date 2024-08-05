import { prisma } from '@/prisma';
import { ShortVideo } from '@prisma/client';

export async function getShort(spaceId: string, shortId: string): Promise<ShortVideo | undefined> {
  let shortVideo = await prisma.shortVideo.findUnique({
    where: {
      id: shortId,
    },
  });

  // If short video is still not found, throw an error or handle it appropriately
  if (!shortVideo) {
    throw new Error('short Video not found');
  }
  return shortVideo;
}
