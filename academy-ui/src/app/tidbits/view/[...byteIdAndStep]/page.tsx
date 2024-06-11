'use client';

import withSpace from '@dodao/web-core/ui/auth/withSpace';
import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

const ByteView = ({ params, space }: { params: { byteIdAndStep: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const { byteIdAndStep } = params;

  const byteId = Array.isArray(byteIdAndStep) ? byteIdAndStep[0] : (byteIdAndStep as string);

  return (
    <ViewByteModal
      space={space}
      byteCollectionType={'byteCollection'}
      selectedByteId={byteId}
      viewByteModalClosedUrl={`/tidbits`}
      afterUpsertByteModalClosedUrl={'/tidbits/view'}
    />
  );
};

export default withSpace(ByteView);
