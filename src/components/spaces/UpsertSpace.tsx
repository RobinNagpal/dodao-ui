import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import { Space, useExtendedSpaceQuery } from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { useState } from 'react';

export interface UpsertSpaceProps {
  spaceId?: string;
}

export default function UpsertSpace(props: UpsertSpaceProps) {
  const { data } = useExtendedSpaceQuery({
    variables: {
      spaceId: props.spaceId!,
    },
    skip: !props.spaceId,
  });

  const space = data?.space;

  function inputError(avatar: string) {
    return null;
  }
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  function updateSpaceField(field: keyof Space, newValue: string | number | undefined) {
    console.log(field, newValue);
  }

  return (
    <form>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <Input label="Id" modelValue={space?.id} />
          <Input label="Name" modelValue={space?.name} />
          <UploadInput
            error={inputError('avatar')}
            onUpdate={(newValue) => updateSpaceField('avatar', newValue)}
            imageType="Simulation"
            spaceId={space?.id || 'new-space'}
            modelValue={space?.avatar}
            objectId={(space?.name && slugify(space?.name)) || space?.id || 'new-space'}
            onInput={setThumbnailUrl}
            onLoading={setUploadThumbnailLoading}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" primary>
          Save
        </Button>
      </div>
    </form>
  );
}
