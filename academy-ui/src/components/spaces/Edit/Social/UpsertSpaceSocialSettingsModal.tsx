import UploadInput from '@/components/app/UploadInput';
import { useEditSpaceSocialSettings } from '@/components/spaces/Edit/Social/useEditSpaceSocialSettings';
import { ImageType } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React, { useState } from 'react';

export default function UpsertSpaceSocialSettingsModal(props: { space: SpaceWithIntegrationsDto; open: boolean; onClose: () => void }) {
  const { socialSettings, setSocialSettingsField, updateSocialSettings, updating } = useEditSpaceSocialSettings(props.space);
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  function inputError(avatar: string) {
    return null;
  }

  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Social Settings">
      <div className="p-8">
        <div className="space-y-12 text-left">
          <div className="border-b pb-12">
            <UploadInput
              label="Linked Share PDF Background Image"
              error={inputError('avatar')}
              imageType={ImageType.Tidbits}
              spaceId={props.space.id}
              modelValue={socialSettings.linkedSharePdfBackgroundImage}
              objectId={'linkedSharePdfBackgroundImage'}
              onInput={(value) => setSocialSettingsField('linkedSharePdfBackgroundImage', value)}
              onLoading={setUploadThumbnailLoading}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            variant="contained"
            primary
            loading={updating}
            disabled={uploadThumbnailLoading || updating}
            onClick={async () => {
              await updateSocialSettings();
              props.onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
