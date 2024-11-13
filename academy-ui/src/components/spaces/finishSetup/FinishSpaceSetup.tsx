'use client';

import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import WebCoreSpaceSetup from '@dodao/web-core/components/space/WebCoreSpaceSetup';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { User } from '@prisma/client';
import React, { useState } from 'react';

interface FinishSpaceSetupProps {
  space: SpaceWithIntegrationsDto;
}

function FinishSetup({ space }: FinishSpaceSetupProps) {
  const { putData } = useFetchUtils();
  const [upserting, setUpserting] = useState(false);

  async function upsertSpace(updatedSpace: WebCoreSpace) {
    setUpserting(true);
    const spaceReq: SpaceWithIntegrationsDto = {
      ...space,
      avatar: updatedSpace.avatar || null,
      adminUsernamesV1: updatedSpace.adminUsernamesV1,
      themeColors: updatedSpace.themeColors || null,
    };
    await putData<User, { spaceInput: SpaceWithIntegrationsDto }>(
      `${getBaseUrl()}/api/${space.id}/spaces`,
      {
        spaceInput: spaceReq,
      },
      { successMessage: 'Space updated successfully', errorMessage: 'Error while updating space', redirectPath: '/' }
    );
    setUpserting(false);
  }

  const uploadLogoToS3 = async (file: File) => {
    return '';
  };

  return <WebCoreSpaceSetup space={space} loading={upserting} saveSpace={(webCoreSpace) => upsertSpace(webCoreSpace)} uploadLogoToS3={uploadLogoToS3} />;
}
export default FinishSetup;
