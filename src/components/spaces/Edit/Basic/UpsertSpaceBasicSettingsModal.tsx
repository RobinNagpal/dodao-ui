import { CssTheme } from '@/app/themes';
import UploadInput from '@/components/app/UploadInput';
import UpsertBadgeInput from '@/components/core/badge/UpsertBadgeInput';
import UpsertKeyValueBadgeInput from '@/components/core/badge/UpsertKeyValueBadgeInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullPageModal from '@/components/core/modals/FullPageModal';
import StyledSelect from '@/components/core/select/StyledSelect';
import useEditSpace from '@/components/spaces/Edit/Basic/useEditSpace';
import { Space } from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { themeSelect } from '@/utils/ui/statuses';
import union from 'lodash/union';
import React, { useEffect, useState } from 'react';

export default function UpsertSpaceBasicSettingsModal(props: { space?: Space; open: boolean; onClose: () => void }) {
  const editSpaceHelper = useEditSpace(props.space?.id);
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  const { space, setSpaceField, setSpaceIntegrationField, upsertSpace, upserting } = editSpaceHelper;

  function inputError(avatar: string) {
    return null;
  }

  useEffect(() => {
    editSpaceHelper.initialize();
  }, [space?.id]);

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
            imageType="AcademyLogo"
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
          <StyledSelect
            label="Theme"
            selectedItemId={Object.keys(CssTheme).includes(space?.skin || '') ? space.skin : CssTheme.GlobalTheme}
            items={themeSelect}
            setSelectedItemId={(value) => setSpaceField('skin', value)}
          />
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
