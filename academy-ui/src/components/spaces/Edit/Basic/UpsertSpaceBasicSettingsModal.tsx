import UploadInput from '@/components/app/UploadInput';
import useEditSpace from '@/components/spaces/Edit/Basic/useEditSpace';
import { ImageType } from '@/graphql/generated/generated-types';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import UpsertBadgeInput from '@dodao/web-core/components/core/badge/UpsertBadgeInput';
import UpsertKeyValueBadgeInput from '@dodao/web-core/components/core/badge/UpsertKeyValueBadgeInput';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import union from 'lodash/union';
import React, { useEffect, useState } from 'react';

export default function UpsertSpaceBasicSettingsModal(props: { space?: SpaceWithIntegrationsDto; open: boolean; onClose: () => void }) {
  const editSpaceHelper = useEditSpace(props.space?.id);
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  const { space, setSpaceField, setSpaceIntegrationField, upsertSpace, upserting } = editSpaceHelper;

  function inputError(avatar: string) {
    return null;
  }

  useEffect(() => {
    editSpaceHelper.initialize();
  }, [space?.id]);

  const spaceTypes = [
    {
      label: 'TidbitsSite',
      id: SpaceTypes.TidbitsSite,
    },
    {
      label: 'AcademySite',
      id: SpaceTypes.AcademySite,
    },
  ];
  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Basic Space Settings">
      <div className="space-y-12 text-left p-6">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <Input label="Id" modelValue={space?.id} onUpdate={(value) => setSpaceField('id', value?.toString() || '')} />
          <Input label="Name" modelValue={space?.name} onUpdate={(value) => setSpaceField('name', value?.toString() || '')} />
          <UploadInput
            label="Logo"
            error={inputError('avatar')}
            imageType={ImageType.Space}
            spaceId={space?.id || 'new-space'}
            modelValue={space?.avatar}
            objectId={(space?.name && slugify(space?.name)) || space?.id || 'new-space'}
            onInput={(value) => setSpaceField('avatar', value)}
            onLoading={setUploadThumbnailLoading}
          />
          <Input
            label="Academy Repo"
            modelValue={space?.spaceIntegrations?.academyRepository}
            placeholder={'https://github.com/DoDAO-io/dodao-academy'}
            onUpdate={(value) => setSpaceIntegrationField('academyRepository', value?.toString() || '')}
          />
          <StyledSelect label="Space Type" selectedItemId={space.type} items={spaceTypes} setSelectedItemId={(value) => setSpaceField('type', value)} />
          <UpsertBadgeInput
            label={'Domains'}
            badges={space.domains.map((d) => ({ id: d, label: d }))}
            onAdd={(d) => {
              setSpaceField('domains', union(space.domains, [d]));
            }}
            onRemove={(d) => {
              setSpaceField(
                'domains',
                space.domains.filter((domain) => domain !== d)
              );
            }}
          />
          <UpsertBadgeInput
            label={'Bot Domains'}
            badges={(space.botDomains || []).map((d) => ({ id: d, label: d }))}
            onAdd={(d) => {
              setSpaceField('botDomains', union(space.botDomains || [], [d]));
            }}
            onRemove={(d) => {
              setSpaceField(
                'botDomains',
                (space.botDomains || []).filter((domain) => domain !== d)
              );
            }}
          />
          <UpsertBadgeInput
            label={'Admins By Usernames'}
            badges={space.adminUsernames.map((d) => ({ id: d, label: d }))}
            onAdd={(admin) => {
              setSpaceField('adminUsernames', union(space.adminUsernames, [admin]));
            }}
            onRemove={(d) => {
              setSpaceField(
                'adminUsernames',
                space.adminUsernames.filter((domain) => domain !== d)
              );
            }}
          />
          <UpsertKeyValueBadgeInput
            label={'Admins By Usernames & Names'}
            badges={space.adminUsernamesV1.map((d) => ({ key: d.username, value: d.nameOfTheUser }))}
            onAdd={(admin) => {
              const string = admin.split(',');
              const username = string[0].trim();
              const nameOfTheUser = string.length > 1 ? string[1].trim() : '';
              const newAdmin = { username, nameOfTheUser };
              setSpaceField('adminUsernamesV1', union(space.adminUsernamesV1, [newAdmin]));
            }}
            labelFn={(badge) => `${badge.key} - ${badge.value}`}
            onRemove={(d) => {
              setSpaceField(
                'adminUsernamesV1',
                space.adminUsernamesV1.filter((domain) => domain.username !== d)
              );
            }}
          />
        </div>
      </div>

      <div className="p-6 flex items-center justify-end gap-x-6">
        <Button
          variant="contained"
          primary
          loading={upserting}
          disabled={uploadThumbnailLoading || upserting}
          onClick={async () => {
            await upsertSpace();
            props.onClose();
          }}
        >
          Save
        </Button>
      </div>
    </FullPageModal>
  );
}
