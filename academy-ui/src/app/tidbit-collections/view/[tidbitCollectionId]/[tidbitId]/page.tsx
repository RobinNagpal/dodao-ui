import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { SpaceTypes } from '@/graphql/generated/generated-types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails(props: { params: { tidbitCollectionId: string; tidbitId?: string } }) {
  const space = (await getSpaceServerSide())!;

  return (
    <ViewByteModal
      space={space}
      byteCollectionId={props.params.tidbitCollectionId}
      selectedByteId={props.params.tidbitId!}
      viewByteModalClosedUrl={space.type === SpaceTypes.TidbitsSite ? '/' : '/tidbit-collections'}
      afterUpsertByteModalClosedUrl={space.type === SpaceTypes.TidbitsSite ? '/' : `/tidbit-collections/view/${props.params?.tidbitCollectionId}`}
    />
  );
}
