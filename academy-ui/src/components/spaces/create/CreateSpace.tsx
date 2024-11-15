'use client';

import { CreateSpaceRequest } from '@/types/request/CreateSpaceRequest';
import { CreateSpaceResponse } from '@/types/response/CreateSpaceResponse';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import CreateNewSpace from '@dodao/web-core/ui/auth/signup/components/CreateNewSpace';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import getSubdomainUrl from '@dodao/web-core/utils/api/getSubdomainUrl';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { useRouter } from 'next/navigation';

interface CreateSpaceProps {
  space: SpaceWithIntegrationsDto;
}

function CreateSpace({ space }: CreateSpaceProps) {
  const router = useRouter();
  const {
    loading: creatingSpace,
    data: createdSpace,
    postData: createSpace,
  } = usePostData<CreateSpaceResponse, CreateSpaceRequest>(
    {
      successMessage: 'Space created successfully',
      errorMessage: 'Failed to create space',
    },
    {}
  );

  const { postData: createToken } = usePostData<{ token: string }, void>(
    {
      errorMessage: 'Failed to login',
    },
    {}
  );

  const loginToCreatedSpace = async (space: WebCoreSpace) => {
    const spaceSubdomainUrl = getSubdomainUrl(space.id);

    const tokenResponse = await createToken(`${getBaseUrl()}/api/${space.id}/verification-tokens`);
    const tokenParam = new URLSearchParams({
      token: tokenResponse!.token,
    });
    router.push(`${spaceSubdomainUrl}/auth/email/verify?${tokenParam}&context=${Contexts.verifyToken}`);
  };

  const onSubmit = async (req: CreateSpaceRequest) => {
    await createSpace(`${getBaseUrl()}/api/${space.id}/actions/spaces/new-tidbit-space`, req);
  };

  return <CreateNewSpace onSubmit={onSubmit} upserting={creatingSpace} createdSpace={createdSpace?.space} loginToCreatedSpace={loginToCreatedSpace} />;
}

export default CreateSpace;
