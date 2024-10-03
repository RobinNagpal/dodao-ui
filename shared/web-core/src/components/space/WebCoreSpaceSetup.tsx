'use client';

import Block from '@dodao/web-core/components/app/Block';
import UpsertKeyValueBadgeInput from '@dodao/web-core/components/core/badge/UpsertKeyValueBadgeInput';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import UploadInput from '@dodao/web-core/components/core/uploadInput/UploadInput';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import union from 'lodash/union';
import React, { useState } from 'react';

interface FinishSpaceSetupProps {
  space: WebCoreSpace;
  uploadLogoToS3: (file: File) => Promise<string>;
  saveSpace: (space: WebCoreSpace) => Promise<void>;
  loading: boolean;
}

function WebCoreSpaceSetup({ space, loading, saveSpace, uploadLogoToS3 }: FinishSpaceSetupProps) {
  const [updatedSpace, setUpdatedSpace] = useState<WebCoreSpace>(space);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const setSpaceField = (field: keyof WebCoreSpace, value: any) => {
    setUpdatedSpace({ ...updatedSpace, [field]: value });
  };

  const uploadFileToS3 = async (file: File) => {
    setUploadingLogo(true);
    const url = await uploadLogoToS3(file);
    setSpaceField('avatar', url);
    setUploadingLogo(false);
  };

  return (
    <PageWrapper>
      <Block title={'Space Setup'}>
        <div className="">
          <UploadInput
            label="Logo"
            spaceId={space.id!}
            modelValue={space?.avatar}
            onInput={(value) => setSpaceField('avatar', value)}
            uploadToS3={uploadFileToS3}
            loading={false}
          />
          <UpsertKeyValueBadgeInput
            label={'Admins By Usernames & Names'}
            inputPlaceholder="E.g. john@example.com , John"
            helpText="Current Space Admins <Username , Name>"
            badges={space.adminUsernamesV1.map((d) => ({ key: d.username, value: d.nameOfTheUser }))}
            onAdd={(admin) => {
              const string = admin.split(',');
              const username = string[0].trim();
              const nameOfTheUser = string.length > 1 ? string[1].trim() : '';
              const newAdmin = { username, nameOfTheUser };
              setSpaceField('adminUsernamesV1', union(space.adminUsernamesV1, [newAdmin]));
            }}
            labelFn={(badge) => `${badge.key} , ${badge.value}`}
            onRemove={(d) => {
              setSpaceField(
                'adminUsernamesV1',
                space.adminUsernamesV1.filter((domain) => domain.username !== d)
              );
            }}
          />
        </div>
        <div className="flex items-center justify-end gap-x-6">
          <Button
            variant="contained"
            primary
            loading={uploadingLogo || loading}
            disabled={uploadingLogo || loading}
            onClick={async () => {
              await saveSpace(updatedSpace);
            }}
          >
            Save
          </Button>
        </div>
      </Block>
    </PageWrapper>
  );
}
export default WebCoreSpaceSetup;
