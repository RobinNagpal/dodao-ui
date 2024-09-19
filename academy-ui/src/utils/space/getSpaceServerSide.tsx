import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import axios from 'axios';
import { headers } from 'next/headers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export async function getSpaceBasedOnHostHeader(reqHeaders: Headers) {
  const host = reqHeaders.get('host')?.split(':')?.[0];
  const spaceUrl = getBaseUrl() + '/api/spaces?domain=' + host;
  const response = await axios.get(spaceUrl);

  const space = response?.data?.[0] as SpaceWithIntegrationsFragment;
  return response.status === 200 ? space : null;
}

export async function getSpaceServerSide(): Promise<SpaceWithIntegrationsFragment | null> {
  const reqHeaders = headers();
  return await getSpaceBasedOnHostHeader(reqHeaders);
}
