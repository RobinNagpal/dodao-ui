import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails(props: { params: { collectionId?: string; tidbitId?: string; categoryId: string } }) {
  const space = (await getSpaceServerSide())!;
  const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space, 'byte-collections');

  return (
    <PageWrapper>
      <ByteCollectionsGrid
        space={space}
        byteCollections={byteCollections}
        byteCollectionType={'byteCollection'}
        selectedByteId={props.params.tidbitId}
        selectedByteCollectionId={props.params.collectionId}
        byteCollectionsPageUrl={`/tidbit-collection-categories/view/${props.params.categoryId}/tidbit-collections`}
      />
    </PageWrapper>
  );
}