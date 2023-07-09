import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { useEditSpaceSocialSettings } from '@/components/spaces/Edit/Social/useEditSpaceSocialSettings';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export default function UpsertSpaceSocialSettingsModal(props: { space: SpaceWithIntegrationsFragment; open: boolean; onClose: () => void }) {
  const { socialSettings, setSocialSettingsField, updateSocialSettings, updating } = useEditSpaceSocialSettings(props.space);
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  function inputError(avatar: string) {
    return null;
  }

  return (
    <FullScreenModal open={props.open} onClose={props.onClose} title="Social Settings">
      <div className="space-y-12 text-left">
        <div className="border-b pb-12">
          <UploadInput
            label="Linked Share PDF Background Image"
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
    </FullScreenModal>
  );
}
