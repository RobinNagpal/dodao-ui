'use client';

import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import WebCoreSpaceSetup from '@dodao/web-core/components/space/WebCoreSpaceSetup';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface FinishSpaceSetupProps {
  space: SpaceWithIntegrationsFragment;
}

function FinishSetup({ space }: FinishSpaceSetupProps) {
  const { showNotification } = useNotificationContext();
  const [upserting, setUpserting] = useState(false);
  const router = useRouter();

  async function upsertSpace(updatedSpace: WebCoreSpace) {
    setUpserting(true);
    try {
      const spaceReq: SpaceWithIntegrationsFragment = {
        ...space,
        avatar: updatedSpace.avatar,
        adminUsernamesV1: updatedSpace.adminUsernamesV1,
        themeColors: updatedSpace.themeColors,
      };
      const response = await fetch(`/api/spaces/update-space`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spaceInput: spaceReq }),
      });

      if (response?.ok) {
        showNotification({ type: 'success', message: 'Space upserted successfully' });
        router.push('/'); // Redirect to the Home page
      } else {
        showNotification({ type: 'error', message: 'Error while upserting space' });
      }
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: 'Error while upserting space' });
      setUpserting(false);
      throw error;
    }
    setUpserting(false);
  }

  const uploadLogoToS3 = async (file: File) => {
    return '';
  };

  return <WebCoreSpaceSetup space={space} loading={upserting} saveSpace={(webCoreSpace) => upsertSpace(webCoreSpace)} uploadLogoToS3={uploadLogoToS3} />;
}
export default FinishSetup;
