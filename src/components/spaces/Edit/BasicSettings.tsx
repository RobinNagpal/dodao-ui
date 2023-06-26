import UploadInput from '@/components/app/UploadInput';
import UpsertBadgeInput from '@/components/core/badge/UpsertBadgeInput';
import Button from '@/components/core/buttons/Button';
import Checkboxes from '@/components/core/checkboxes/Checkboxes';
import Input from '@/components/core/input/Input';
import { UseEditSpaceHelper } from '@/components/spaces/useEditSpace';
import { slugify } from '@/utils/auth/slugify';
import union from 'lodash/union';
import { useState } from 'react';

export default function BasicSettings(props: { editSpaceHelper: UseEditSpaceHelper }) {
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  const { space, setSpaceField, setSpaceIntegrationField, upsertSpace, upserting } = props.editSpaceHelper;

  function inputError(avatar: string) {
    return null;
  }

  return (
    <>
      <div className="space-y-12">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <Input label="Id" modelValue={space?.id} onUpdate={(value) => setSpaceField('id', value?.toString() || '')} />
          <Input label="Name" modelValue={space?.name} onUpdate={(value) => setSpaceField('name', value?.toString() || '')} />
          <UploadInput
            error={inputError('avatar')}
            onUpdate={(newValue) => setSpaceField('avatar', newValue)}
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
        </div>
        <div className="border-b pb-12">
          <div className="rounded-md">
            <Checkboxes
              label={'Space Features'}
              items={[
                {
                  id: 'feature1',
                  label: 'Feature 1',
                  name: 'feature1',
                },
                {
                  id: 'feature2',
                  label: 'Feature 2',
                  name: 'feature2',
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" primary loading={upserting} disabled={uploadThumbnailLoading || upserting} onClick={() => upsertSpace()}>
          Save
        </Button>
      </div>
    </>
  );
}
