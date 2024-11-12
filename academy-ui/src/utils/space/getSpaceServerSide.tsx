import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { headers } from 'next/headers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { SpaceTags } from '../api/fetchTags';

export async function getSpaceBasedOnHostHeader(reqHeaders: Headers) {
  const host = reqHeaders.get('host')?.split(':')?.[0];
  const response = await fetch(`${getBaseUrl()}/api/spaces?domain=${host}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      tags: [SpaceTags.GET_SPACE.toString()],
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const space = data?.[0] as SpaceWithIntegrationsFragment;

  return space;
}

export async function getSpaceServerSide(): Promise<SpaceWithIntegrationsFragment | null> {
  const reqHeaders = await headers();
  return await getSpaceBasedOnHostHeader(reqHeaders);
}
