'use client';

import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import useCreateSpace from '@/components/newSpace/new/useNewSpace';
import { useExtendedSpaceQuery } from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { useState } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { isEmpty } from 'lodash';

export default function NewSiteInformation() {
  const createSpaceHelper = useCreateSpace();
  const { newSpace, setNewSpaceField, createSpace, upserting } = createSpaceHelper;
  const { showNotification } = useNotificationContext();
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  const { data: extendedSpaceData, loading: extendedSpaceLoading } = useExtendedSpaceQuery({
    variables: {
      spaceId: newSpace.id,
    },
    skip: !newSpace.id,
  });
  function inputError(avatar: string) {
    return null;
  }

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
      await createSpace();
      const spaceId = newSpace.id;
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

  return (
    <>
      <div className="space-y-12 text-left mt-8">
        <div className="pb-12">
          <h2 className="text-lg font-bold leading-7">Create Tidbits Site</h2>
          <p className="mt-1 text-sm leading-6">Add the details of Tidbits Site</p>
          <Input
            label="Name"
            modelValue={newSpace.name}
            onUpdate={(value) => {
              const slugifiedValue = slugify(value?.toString() || '');
              setNewSpaceField('name', value?.toString() || '');
              setNewSpaceField('id', slugifiedValue);
            }}
          />
          <Input label="Id" modelValue={newSpace.id} disabled={true} />
          <UploadInput
            label="Logo"
            error={inputError('avatar')}
            imageType="AcademyLogo"
            spaceId={'new-space'}
            modelValue={newSpace.avatar}
            objectId={'new-space'}
            onInput={(value) => setNewSpaceField('avatar', value)}
            onLoading={setUploadThumbnailLoading}
          />
        </div>
      </div>

      <div className="flex items-center justify-start gap-x-6">
        <Button
          variant="contained"
          primary
          removeBorder={true}
          loading={upserting}
          disabled={uploadThumbnailLoading || upserting || isEmpty(newSpace.name) || isEmpty(newSpace.avatar)}
          onClick={handleCreateClick}
        >
          Create
        </Button>
      </div>
    </>
  );
}
