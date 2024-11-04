'use client';

import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { CreateSpaceRequest } from '@/types/request/CreateSpaceRequest';
import CreateNewSpace from '@dodao/web-core/ui/auth/signup/components/CreateNewSpace';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

interface CreateSpaceProps {
  space: SpaceWithIntegrationsFragment;
}

function CreateSpace({ space }: CreateSpaceProps) {
  const [isSpaceCreated, setIsSpaceCreated] = useState(false);
  const { loading, postData } = usePostData(
    {
      successMessage: 'Space created successfully',
      errorMessage: 'Failed to create space',
    },
    {}
  );

  const onSubmit = async (req: CreateSpaceRequest) => {
    await postData(`${getBaseUrl()}/api/${space.id}/actions/spaces/new-tidbit-space`, req);
    setIsSpaceCreated(true);
  };

  return <CreateNewSpace onSubmit={onSubmit} upserting={loading} createdSpace={isSpaceCreated ? space : undefined} />;
}

export default CreateSpace;
