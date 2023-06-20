import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import Checkboxes from '@/components/core/checkboxes/Checkboxes';
import Input from '@/components/core/input/Input';
import useEditSpace from '@/components/spaces/useEditSpace';
import { Space } from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { useEffect, useState } from 'react';

export interface UpsertSpaceProps {
  spaceId?: string;
}

export default function UpsertSpace(props: UpsertSpaceProps) {
  const { space, initialize, setInviteLinkField, setSpaceField, setSpaceIntegrationField, upsertSpace, upserting } = useEditSpace(props.spaceId);

  function inputError(avatar: string) {
    return null;
  }

  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  function updateSpaceField(field: keyof Space, newValue: string | number | undefined) {
    console.log(field, newValue);
  }

  useEffect(() => {
    initialize();
  }, [props.spaceId]);

  return (
    <form>
      <div className="space-y-12">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <Input label="Id" modelValue={space?.id} onUpdate={(value) => setSpaceField('id', value?.toString() || '')} />
          <Input label="Name" modelValue={space?.name} onUpdate={(value) => setSpaceField('name', value?.toString() || '')} />
          <UploadInput
            error={inputError('avatar')}
            onUpdate={(newValue) => updateSpaceField('avatar', newValue)}
            imageType="Simulation"
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
    </form>
  );
}
