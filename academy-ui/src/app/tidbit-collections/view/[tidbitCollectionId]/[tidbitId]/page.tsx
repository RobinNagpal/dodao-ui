import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails(props: { params: { tidbitCollectionId?: string; tidbitId?: string } }) {
  const space = (await getSpaceServerSide())!;

  return (
    <ViewByteModal
      space={space}
      selectedByteId={props.params.tidbitId!}
      viewByteModalClosedUrl={`/tidbit-collections`}
      afterUpsertByteModalClosedUrl={`/tidbit-collections/view/${props.params?.tidbitCollectionId}`}
    />
  );
}
