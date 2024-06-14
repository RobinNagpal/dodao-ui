'use client';

import withSpace from '@/contexts/withSpace';
import EditByteView from '@/components/bytes/Edit/EditByteView';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

function EditByte(props: { space: SpaceWithIntegrationsFragment; params: { byteId?: string[] } }) {
  const { space, params } = props;
  const byteId = params.byteId ? params.byteId[0] : null;

  const router = useRouter();
  function onClose() {
    router.push(`/tidbits`);
  }

  return (
    <FullScreenModal open={true} onClose={onClose} title={'Create Tidbit'}>
      <div className="text-left">
        <EditByteView
          space={space}
          byteId={byteId || undefined}
          onUpsert={async (byteId) => {
            router.push(`/tidbits/view/${byteId}`);
          }}
        />
      </div>
    </FullScreenModal>
  );
}

export default withSpace(EditByte);
