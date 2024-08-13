import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import React from 'react';

/**
 * @param props
 * @param space
 * @param session
 */
export async function getTidbitsSiteHomepageContents(space: SpaceWithIntegrationsFragment, session?: Session) {
  const response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collections`, {
    params: {
      spaceId: space.id,
    },
  });
  const byteCollections: ByteCollectionSummary[] = response.data.byteCollections;

  return (
    <ByteCollectionsGrid
      byteCollections={byteCollections}
      space={space}
      byteCollectionsBaseUrl={`/tidbit-collections`}
      isAdmin={session?.isAdminOfSpace || session?.isSuperAdminOfDoDAO}
    />
  );
}
