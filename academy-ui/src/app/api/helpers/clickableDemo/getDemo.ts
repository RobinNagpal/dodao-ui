import { prisma } from '@/prisma';
import { ClickableDemos } from '@prisma/client';

export async function getDemo(spaceId: string, demoId: string): Promise<ClickableDemos | undefined> {
  let clickableDemo = await prisma.clickableDemos.findUnique({
    where: {
      id: demoId,
    },
  });

  // If byte is still not found, throw an error or handle it appropriately
  if (!clickableDemo) {
    throw new Error('Clickable Demo not found');
  }
  return clickableDemo;
}
