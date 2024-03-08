import TidbitsSiteHome from '@/components/home/TidbitsSite/TidbitsSiteHome';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

export default async function EmbeddedTidbitsPage() {
  const space = await getSpaceServerSide();
  const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space!, 'byte-collections');
  return <TidbitsSiteHome byteCollections={byteCollections} space={space!} />;
}
