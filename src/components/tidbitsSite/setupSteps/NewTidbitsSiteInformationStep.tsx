'use client';

import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import {
  useExtendedSpaceQuery,
  useGetSpaceFromCreatorQuery,
  useUpdateSpaceMutation,
  useUpdateSpaceNameAndAvatarMutation,
} from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { useEffect, useState } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { isEmpty } from 'lodash';
import useCreateSpace from '@/components/tidbitsSite/setupSteps/useNewSpace';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/core/loaders/LoadingSpinner';

interface NewSiteInformationProps {
  goToNextStep: () => void;
}

export default function NewTidbitsSiteInformationStep({ goToNextStep }: NewSiteInformationProps) {
  const createSpaceHelper = useCreateSpace();
  const { space, setSpaceField, createNewTidbitSpace, upserting } = createSpaceHelper;
  const { showNotification } = useNotificationContext();
  const { data: session } = useSession();
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Create');

  const [upsertSpace] = useUpdateSpaceNameAndAvatarMutation();

  const { data: spaceByUsername, loading } = useGetSpaceFromCreatorQuery({
    variables: {
      creatorUsername: session?.username!,
    },
    skip: !session?.username,
  });

  const { data: extendedSpaceData, loading: extendedSpaceLoading } = useExtendedSpaceQuery({
    variables: {
      spaceId: space.id,
    },
    skip: !space.id,
  });

  const handleCreateClick = async () => {
    if (extendedSpaceLoading) {
      showNotification({ type: 'info', message: 'Checking space ID availability...' });
      return;
    }
    if (extendedSpaceData && extendedSpaceData.space) {
      showNotification({ type: 'error', message: 'Space id already exists. Please try again!!' });
      return;
    }

    try {
      await createNewTidbitSpace();
      const spaceId = space.id;
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();

      const createUserResponse = await fetch('/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          spaceId: spaceId,
        }),
      });

      if (!createUserResponse.ok) {
        throw new Error('Failed to create user in space');
      }
      showNotification({ type: 'success', message: 'Space created and user added successfully!' });
    } catch (error) {
      console.error('Error:', error);
      showNotification({ type: 'error', message: 'Something went wrong' });
    }
  };

  const handleUpsertClick = async () => {
    await upsertSpace({
      variables: {
        spaceId: spaceByUsername?.getSpaceFromCreator?.id!,
        name: space.name,
        avatar: space.avatar,
      },
    });
    goToNextStep();
  };

  const handleButtonClick = async () => {
    const isEditing = !!spaceByUsername?.getSpaceFromCreator?.id;
    if (isEditing) {
      await handleUpsertClick();
    } else {
      await handleCreateClick();
    }
  };

  useEffect(() => {
    setIsLoading(loading);
    const isEditing = !!spaceByUsername?.getSpaceFromCreator?.id;
    if (isEditing) {
      const { name, id, avatar } = spaceByUsername.getSpaceFromCreator!;
      setSpaceField('name', name);
      setSpaceField('id', id);
      setSpaceField('avatar', avatar);
    } else {
      setSpaceField('name', '');
      setSpaceField('id', '');
      setSpaceField('avatar', '');
    }
  }, [spaceByUsername, loading]);

  if (isLoading || uploadThumbnailLoading || upserting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="sm:px-0 px-4">
      <div className="space-y-12 text-left mt-8">
        <div className="pb-12">
          <h2 className="text-lg font-bold leading-7">Create Tidbits Site</h2>
          <p className="mt-1 text-sm leading-6">Add the details of Tidbits Site</p>
          <Input
            label="Name"
            modelValue={space.name}
            onUpdate={(value) => {
              setSpaceField('name', value?.toString() || '');
              if (!spaceByUsername?.getSpaceFromCreator?.id) {
                const slugifiedValue = slugify(value?.toString() || '');
                setSpaceField('id', slugifiedValue);
              }
            }}
          />

          <Input label="Id" modelValue={space.id} disabled={true} />
          <UploadInput
            label="Logo"
            imageType="AcademyLogo"
            spaceId={'new-space'}
            modelValue={space.avatar}
            objectId={'new-space'}
            onInput={(value) => setSpaceField('avatar', value)}
            onLoading={setUploadThumbnailLoading}
          />
        </div>
      </div>

      <div className="flex items-center justify-start gap-x-6">
        <Button variant="contained" primary removeBorder={true} disabled={isEmpty(space.name) || isEmpty(space.avatar)} onClick={handleButtonClick}>
          Next
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </div>
    </div>
  );
}
