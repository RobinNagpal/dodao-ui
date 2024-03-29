'use client';
import withSpace from '@/app/withSpace';
import RatingByteView from '@/components/bytes/View/RatingByteView';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

function ByteRatingPage(props: { space: SpaceWithIntegrationsFragment; params: { byteId: string } }) {
  const router = useRouter();

  function onClose() {
    router.push(`/tidbits`);
  }
  return (
    <FullScreenModal open={true} onClose={onClose} title={'Ratings'}>
      <div className="text-left">
        <RatingByteView byteId={props.params.byteId} space={props.space} />
      </div>
    </FullScreenModal>
  );
}

export default withSpace(ByteRatingPage);
