'use client';

import Block from '@dodao/web-core/components/app/Block';
import UpsertKeyValueBadgeInput from '@dodao/web-core/components/core/badge/UpsertKeyValueBadgeInput';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import UploadInput from '@dodao/web-core/components/core/uploadInput/UploadInput';
import { Session } from '@dodao/web-core/types/auth/Session';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import union from 'lodash/union';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface WebCoreSpaceSetupProps {
  space: WebCoreSpace;
  uploadLogoToS3: (file: File) => Promise<string>;
  saveSpace: (space: WebCoreSpace) => Promise<void>;
  loading: boolean;
}

function WebCoreSpaceSetup({ space, loading, saveSpace, uploadLogoToS3 }: WebCoreSpaceSetupProps) {
  const [updatedSpace, setUpdatedSpace] = useState<WebCoreSpace>(space);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;

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
            modelValue={updatedSpace?.avatar}
            onInput={(value) => setSpaceField('avatar', value)}
            uploadToS3={uploadFileToS3}
            loading={false}
          />
          <UpsertKeyValueBadgeInput
            label={'Admins By Usernames & Names'}
            inputPlaceholder="E.g. john@example.com , John"
            helpText="Current Space Admins <Username , Name>"
            badges={updatedSpace.adminUsernamesV1.map((d) => ({
              key: d.username,
              value: d.nameOfTheUser,
              readonly: d.username === session?.username || d.username === updatedSpace.creator,
            }))}
            onAdd={(admin) => {
              const string = admin.split(',');
              const username = string[0].trim();
              const nameOfTheUser = string.length > 1 ? string[1].trim() : '';
              const newAdmin = { username, nameOfTheUser };
              setSpaceField('adminUsernamesV1', union(updatedSpace.adminUsernamesV1, [newAdmin]));
            }}
            labelFn={(badge) => `${badge.key} , ${badge.value}`}
            onRemove={(d) => {
              setSpaceField(
                'adminUsernamesV1',
                updatedSpace.adminUsernamesV1.filter((domain) => domain.username !== d)
              );
            }}
          />
        </div>
        <div className="mt-10">
          <Button
            variant="contained"
            primary
            loading={uploadingLogo || loading}
            disabled={uploadingLogo || loading}
            onClick={async () => {
              await saveSpace(updatedSpace);
            }}
          >
            Save Space
          </Button>
        </div>
      </Block>
    </PageWrapper>
  );
}
export default WebCoreSpaceSetup;
