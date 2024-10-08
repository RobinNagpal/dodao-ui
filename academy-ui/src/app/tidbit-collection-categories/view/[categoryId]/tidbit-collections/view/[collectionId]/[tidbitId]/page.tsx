import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails(props: { params: { collectionId: string; tidbitId?: string; categoryId: string } }) {
  const space = (await getSpaceServerSide())!;

  return (
    <ViewByteModal
      space={space}
      byteCollectionId={props.params.collectionId}
      selectedByteId={props.params.tidbitId!}
      viewByteModalClosedUrl={`/tidbit-collection-categories/view/${props.params.categoryId}/tidbit-collections`}
      afterUpsertByteModalClosedUrl={`/tidbit-collection-categories/view/${props.params.categoryId}/tidbit-collections`}
    />
  );
}
