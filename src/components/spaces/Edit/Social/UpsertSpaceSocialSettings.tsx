import UploadInput from '@/components/app/UploadInput';
import UpsertBadgeInput from '@/components/core/badge/UpsertBadgeInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import StyledSelect from '@/components/core/select/StyledSelect';
import { UseEditSpaceHelper } from '@/components/spaces/Edit/Basic/useEditSpace';
import { useEditSpaceSocialSettings } from '@/components/spaces/Edit/Social/useEditSpaceSocialSettings';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Themes } from '@/types/deprecated/models/enums';
import { slugify } from '@/utils/auth/slugify';
import { themeSelect } from '@/utils/ui/statuses';
import union from 'lodash/union';
import React, { useState } from 'react';

export default function UpsertSpaceSocialSettings(props: { space: SpaceWithIntegrationsFragment }) {
  const { socialSettings, setSocialSettingsField, updateSocialSettings, updating } = useEditSpaceSocialSettings(props.space);
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  function inputError(avatar: string) {
    return null;
  }

  return (
    <>
      <div className="space-y-12">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <UploadInput
            error={inputError('avatar')}
            onUpdate={(newValue) => setSocialSettingsField('linkedSharePdfBackgroundImage', newValue)}
            imageType="Social/PdfBackground"
            spaceId={props.space.id}
            modelValue={socialSettings.linkedSharePdfBackgroundImage}
            objectId={'linkedSharePdfBackgroundImage'}
            onInput={(value) => setSocialSettingsField('linkedSharePdfBackgroundImage', value)}
            onLoading={setUploadThumbnailLoading}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" primary loading={updating} disabled={uploadThumbnailLoading || updating} onClick={() => updateSocialSettings()}>
          Save
        </Button>
      </div>
    </>
  );
}
