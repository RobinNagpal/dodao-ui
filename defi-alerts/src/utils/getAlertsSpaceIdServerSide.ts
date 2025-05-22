import { prisma } from '@/prisma';
import { Space } from '@prisma/client';
import { headers } from 'next/headers';

export async function getAlertsSpaceIdServerSide(): Promise<string> {
  const reqHeaders = await headers();
  const host = reqHeaders.get('host')?.split(':')?.[0];

  if (host === 'localhost') {
    return 'compound';
  }

  if (host?.includes('defialerts-localhost.xyz')) {
    return host.split('.')[0];
  }

  if (host?.includes('defialerts.xyz') && host !== 'defialerts.xyz' && host !== 'www.defialerts.xyz') {
    return host.split('.')[0];
  }

  return 'compound';
}

export async function getAlertsSpaceServerSide(): Promise<Space> {
  const spaceId = await getAlertsSpaceIdServerSide();
  return prisma.space.findFirstOrThrow({
    where: { id: spaceId },
  });
}
