import { Space } from '@prisma/client';
import axios from 'axios';
import { headers } from 'next/headers';

export async function getSpaceBasedOnHostHeader(reqHeaders: Headers) {
  const host = reqHeaders.get('host')?.split(':')?.[0];

  const response = await axios.get(process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/extended-space', {
    params: {
      domain: host!,
    },
  });

  const space = response?.data as Space;
  return response.status === 200 ? space : null;
}

export async function getSpaceServerSide(): Promise<Space | null> {
  const reqHeaders = headers();
  return await getSpaceBasedOnHostHeader(reqHeaders);
}
