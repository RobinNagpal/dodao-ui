import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { useRouter } from 'next/navigation';
import React from 'react';

export default async function ByteCollections() {
  const space = (await getSpaceServerSide())!;
  const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space, 'byte-collections');
  const router = useRouter();

  const onViewByteModalClosed = () => {
    const byteCollectionsViewUrl = `/tidbit-collections`;
    router.push(byteCollectionsViewUrl);
  };

  return (
    <PageWrapper>
      <ByteCollectionsGrid
        byteCollections={byteCollections}
        space={space}
        byteCollectionType={'byteCollection'}
        onViewByteModalClosed={onViewByteModalClosed}
      />
    </PageWrapper>
  );
}
