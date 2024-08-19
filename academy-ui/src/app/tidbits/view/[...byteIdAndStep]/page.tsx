'use client';

import withSpace from '@/contexts/withSpace';
import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { SpaceWithIntegrationsFragment, SpaceTypes } from '@/graphql/generated/generated-types';
import React from 'react';

const ByteView = ({ params, space }: { params: { byteIdAndStep: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const { byteIdAndStep } = params;

  const byteId = Array.isArray(byteIdAndStep) ? byteIdAndStep[0] : (byteIdAndStep as string);

  return (
    <ViewByteModal
      space={space}
      selectedByteId={byteId}
      viewByteModalClosedUrl={`${space.type === SpaceTypes.TidbitsSite ? '/' : '/tidbit-collections'}`}
      afterUpsertByteModalClosedUrl={'/tidbits/view'}
    />
  );
};

export default withSpace(ByteView);
