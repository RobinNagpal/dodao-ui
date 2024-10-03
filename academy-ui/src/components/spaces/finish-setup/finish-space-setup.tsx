'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import UploadInput from '@/components/app/UploadInput';
import UpsertKeyValueBadgeInput from '@dodao/web-core/components/core/badge/UpsertKeyValueBadgeInput';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import React, { useEffect, useState } from 'react';
import { ImageType, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import useEditSpace from '@/components/spaces/Edit/Basic/useEditSpace';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { CssTheme } from '@dodao/web-core/src/components/app/themes';
import { themeSelect } from '@dodao/web-core/utils/ui/statuses';
import union from 'lodash/union';

interface FinishSpaceSetupProps {
  space: SpaceWithIntegrationsFragment;
}

function FinishSetup({ space }: FinishSpaceSetupProps) {
  const editSpaceHelper = useEditSpace(space.id);

  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);
  const { space: subdomainSpace, setSpaceField, upsertSpace, upserting } = editSpaceHelper;

  useEffect(() => {
    editSpaceHelper.initialize();
  }, [subdomainSpace?.id]);

  return (
    <div className="p-6">
      <div className="space-y-12 text-left p-6">
        <div className="">
          <div className="flex items-center justify-center">
            <h2 className="font-semibold leading-7 text-3xl">Space Setup</h2>
          </div>

          <UploadInput
            label="Logo"
            imageType={ImageType.Space}
            spaceId={subdomainSpace.id!}
            modelValue={subdomainSpace?.avatar}
            objectId={(subdomainSpace?.name && slugify(subdomainSpace?.name)) || subdomainSpace.id!}
            onInput={(value) => setSpaceField('avatar', value)}
            onLoading={setUploadThumbnailLoading}
          />
          <StyledSelect
            label="Theme"
            selectedItemId={Object.keys(CssTheme).includes(subdomainSpace?.skin || '') ? subdomainSpace.skin : CssTheme.GlobalTheme}
            items={themeSelect}
            setSelectedItemId={(value) => setSpaceField('skin', value)}
          />
          <UpsertKeyValueBadgeInput
            label={'Admins By Usernames & Names'}
            inputPlaceholder="E.g. john@example.com , John"
            helpText="Current Space Admins <Username , Name>"
            badges={subdomainSpace.adminUsernamesV1.map((d) => ({ key: d.username, value: d.nameOfTheUser }))}
            onAdd={(admin) => {
              const string = admin.split(',');
              const username = string[0].trim();
              const nameOfTheUser = string.length > 1 ? string[1].trim() : '';
              const newAdmin = { username, nameOfTheUser };
              setSpaceField('adminUsernamesV1', union(subdomainSpace.adminUsernamesV1, [newAdmin]));
            }}
            labelFn={(badge) => `${badge.key} , ${badge.value}`}
            onRemove={(d) => {
              setSpaceField(
                'adminUsernamesV1',
                subdomainSpace.adminUsernamesV1.filter((domain) => domain.username !== d)
              );
            }}
          />
        </div>
        <div className="flex items-center justify-end gap-x-6">
          <Button
            variant="contained"
            primary
            loading={upserting}
            disabled={uploadThumbnailLoading || upserting}
            onClick={async () => {
              await upsertSpace();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
export default FinishSetup;
