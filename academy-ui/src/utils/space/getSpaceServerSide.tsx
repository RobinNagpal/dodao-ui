import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import axios from 'axios';
import { headers } from 'next/headers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export async function getSpaceBasedOnHostHeader(reqHeaders: Headers) {
  const host = reqHeaders.get('host')?.split(':')?.[0];
  const response = await axios.get(getBaseUrl() + '/api/spaces', {
    params: {
      domain: host!,
    },
  });

  const space = response?.data?.[0] as SpaceWithIntegrationsFragment;
  return response.status === 200 ? space : null;
}

export async function getSpaceServerSide(): Promise<SpaceWithIntegrationsFragment | null> {
  const reqHeaders = headers();
  return await getSpaceBasedOnHostHeader(reqHeaders);
}
