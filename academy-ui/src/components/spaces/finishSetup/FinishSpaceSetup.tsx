'use client';

import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import WebCoreSpaceSetup from '@dodao/web-core/components/space/WebCoreSpaceSetup';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { User } from '@prisma/client';
import React from 'react';

interface FinishSpaceSetupProps {
  space: SpaceWithIntegrationsDto;
}

function FinishSetup({ space }: FinishSpaceSetupProps) {
  const { updateData: putData, loading } = useUpdateData<User, { spaceInput: SpaceWithIntegrationsDto }>(
    {},
    { successMessage: 'Space updated successfully!', errorMessage: 'Error while updating space', redirectPath: '/' },
    'PUT'
  );

  async function upsertSpace(updatedSpace: WebCoreSpace) {
    const spaceReq: SpaceWithIntegrationsDto = {
      ...space,
      name: updatedSpace.name,
      avatar: updatedSpace.avatar || null,
      adminUsernamesV1: updatedSpace.adminUsernamesV1,
      themeColors: updatedSpace.themeColors || null,
    };
    await putData(`${getBaseUrl()}/api/${space.id}/spaces`, {
      spaceInput: spaceReq,
    });
  }

  const uploadLogoToS3 = async (file: File) => {
    return '';
  };

  return <WebCoreSpaceSetup space={space} loading={loading} saveSpace={(webCoreSpace) => upsertSpace(webCoreSpace)} uploadLogoToS3={uploadLogoToS3} />;
}
export default FinishSetup;
