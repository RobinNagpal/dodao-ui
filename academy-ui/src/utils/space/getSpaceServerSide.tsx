import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import axios from 'axios';
import { headers } from 'next/headers';

export async function getSpaceBasedOnHostHeader(reqHeaders: Headers) {
  const host = reqHeaders.get('host')?.split(':')?.[0];

  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '';
  const response = await axios.get(baseUrl + '/api/spaces', {
    params: {
      domain: host!,
    },
  });

  const space = response?.data.body[0] as SpaceWithIntegrationsFragment;
  return response.status === 200 ? space : null;
}

export async function getSpaceServerSide(): Promise<SpaceWithIntegrationsFragment | null> {
  const reqHeaders = headers();
  return await getSpaceBasedOnHostHeader(reqHeaders);
}
