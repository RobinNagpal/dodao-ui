import { BaseSpace } from '@prisma/client';
import { headers } from 'next/headers';

export async function getSpaceBasedOnHostHeader(reqHeaders: Headers) {
  const host = reqHeaders.get('host')?.split(':')?.[0];
  let response = await fetch(process.env.BASE_UI_URL + '/api/space', {
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

export async function getSpaceServerSide(): Promise<BaseSpace | null> {
  const reqHeaders = await headers();
  return await getSpaceBasedOnHostHeader(reqHeaders);
}
