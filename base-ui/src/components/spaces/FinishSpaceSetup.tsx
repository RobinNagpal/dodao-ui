'use client';

import useEditSpace from '@/components/spaces/useEditSpace';
import WebCoreSpaceSetup from '@dodao/web-core/components/space/WebCoreSpaceSetup';
import { BaseSpace } from '@prisma/client';
import React, { useEffect } from 'react';

interface FinishSpaceSetupProps {
  space: BaseSpace;
}

function FinishSpaceSetup({ space }: FinishSpaceSetupProps) {
  const editSpaceHelper = useEditSpace();

  const { space: subdomainSpace, setSpaceField, upsertSpace, upserting } = editSpaceHelper;

  useEffect(() => {
    editSpaceHelper.initialize();
  }, [subdomainSpace?.id]);

  const uploadFileToS3 = async (file: File) => {
    return '';
  };

  return <WebCoreSpaceSetup loading={upserting} saveSpace={upsertSpace} space={space} uploadLogoToS3={uploadFileToS3} />;
}
export default FinishSpaceSetup;
