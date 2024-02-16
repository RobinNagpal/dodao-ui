'use client';

import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import useCreateSpace from '@/components/newSpace/new/useNewSpace';
import { useState } from 'react';

export default function NewSiteInformation() {
  const editSpaceHelper = useCreateSpace();
  const { space, setSpaceField, setSpaceIntegrationField, upsertSpace, upserting } = editSpaceHelper;
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);
  function inputError(avatar: string) {
    return null;
  }
  return (
    <>
      <div className="space-y-12 text-left mt-8">
        <div className="pb-12">
          <h2 className="text-lg font-bold leading-7">Create Tidbits Site</h2>
          <p className="mt-1 text-sm leading-6">Add the details of Tidbits Site</p>

          <Input label="Name" modelValue={space.name} onUpdate={(value) => setSpaceField('name', value?.toString() || '')} />
          <Input label="Id" modelValue={space.id} onUpdate={(value) => setSpaceField('id', value?.toString() || '')} disabled={true} />
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
          disabled={uploadThumbnailLoading || upserting}
          onClick={async () => {
            await upsertSpace();
          }}
        >
          Create
        </Button>
      </div>
    </>
  );
}
