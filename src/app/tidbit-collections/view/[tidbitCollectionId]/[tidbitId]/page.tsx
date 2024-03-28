import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails(props: { params: { tidbitCollectionId?: string; tidbitId?: string } }) {
  const space = (await getSpaceServerSide())!;

  return (
    <ViewByteModal space={space} byteCollectionType={'byteCollection'} selectedByteId={props.params.tidbitId!} onByteModalCloseUrl={`/tidbit-collections`} />
  );
}
