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
  const editSpaceHelper = useCreateSpace();
  const { space, setSpaceField, upsertSpace, upserting } = editSpaceHelper;
  const { showNotification } = useNotificationContext();
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);
  const { data: extendedSpaceData, loading: extendedSpaceLoading } = useExtendedSpaceQuery({
    variables: {
      spaceId: space.id,
    },
    skip: !space.id,
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

    await upsertSpace();
  };

  return (
    <>
      <div className="space-y-12 text-left mt-8">
        <div className="pb-12">
          <h2 className="text-lg font-bold leading-7">Create Tidbits Site</h2>
          <p className="mt-1 text-sm leading-6">Add the details of Tidbits Site</p>
          <Input
            label="Name"
            modelValue={space.name}
            onUpdate={(value) => {
              const slugifiedValue = slugify(value?.toString() || '');
              setSpaceField('name', value?.toString() || '');
              setSpaceField('id', slugifiedValue);
            }}
          />
          <Input label="Id" modelValue={space.id} disabled={true} />
          <UploadInput
            label="Logo"
            error={inputError('avatar')}
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
        <Button
          variant="contained"
          primary
          removeBorder={true}
          loading={upserting}
          disabled={uploadThumbnailLoading || upserting || isEmpty(space.name) || isEmpty(space.avatar)}
          onClick={handleCreateClick}
        >
          Create
        </Button>
      </div>
    </>
  );
}
