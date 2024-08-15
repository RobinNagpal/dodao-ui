import { Space } from '@prisma/client';
import { headers } from 'next/headers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
export async function getSpaceBasedOnHostHeader(reqHeaders: Headers) {
  const host = reqHeaders.get('host')?.split(':')?.[0];
  let response = await fetch(getBaseUrl() + '/api/space', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      domain: host!,
    }),
  });

  if (response.ok) {
    const spaceResponse = await response.json();

    return spaceResponse.space;
  }
  return null;
}

export async function getSpaceServerSide(): Promise<Space | null> {
  const reqHeaders = headers();

  return await getSpaceBasedOnHostHeader(reqHeaders);
}
