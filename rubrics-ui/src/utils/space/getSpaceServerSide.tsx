import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { RubricSpace } from '@prisma/client';
import { headers } from 'next/headers';

export async function getSpaceBasedOnHostHeader(reqHeaders: Headers) {
  const host = reqHeaders.get('host')?.split(':')?.[0];
  const spacesUrl = `${getBaseUrl() + '/api/spaces'}?domain=${host}`;
  const response = await fetch(spacesUrl);

  if (response.ok) {
    const spaceResponse = await response.json();

    const space = spaceResponse.space;
    if (!space) {
      console.log('Error fetching space ' + spacesUrl, 'No space found for domain - ' + host);
    }
    return space;
  }

  console.log('Error fetching space ' + spacesUrl, response.statusText);
  return null;
}

export async function getSpaceServerSide(): Promise<RubricSpace | null> {
  const reqHeaders = await headers();

  return await getSpaceBasedOnHostHeader(reqHeaders);
}
