import { useEditSpaceGuideSettings } from '@/components/spaces/Edit/Guides/useEditSpaceGuideSettings';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import React from 'react';

export default function UpsertSpaceGuideSettingsModal(props: { space: SpaceWithIntegrationsDto; open: boolean; onClose: () => void }) {
  const { guideSettings, setGuideSettingsField, updateGuideSettings, updating } = useEditSpaceGuideSettings(props.space);
  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Guide Settings">
      <div className="py-4 px-8">
        <div className="space-y-12 text-left">
          <div className="border-b pb-12">
            <ToggleWithIcon
              label={'Capture ratings'}
              enabled={!!guideSettings.captureRating}
              setEnabled={(value) => setGuideSettingsField('captureRating', value)}
            />

            <ToggleWithIcon
              label={'Ask for login to submit'}
              enabled={!!guideSettings.askForLoginToSubmit}
              setEnabled={(value) => setGuideSettingsField('askForLoginToSubmit', value)}
            />

            <ToggleWithIcon
              label={'Show categories in sidebar'}
              enabled={!!guideSettings.showCategoriesInSidebar}
              setEnabled={(value) => setGuideSettingsField('showCategoriesInSidebar', value)}
            />

            <ToggleWithIcon
              label={'Show incorrect after each step'}
              enabled={!!guideSettings.showIncorrectAfterEachStep}
              setEnabled={(value) => setGuideSettingsField('showIncorrectAfterEachStep', value)}
            />

            <ToggleWithIcon
              label={'Show incorrect on completion'}
              enabled={!!guideSettings.showIncorrectOnCompletion}
              setEnabled={(value) => setGuideSettingsField('showIncorrectOnCompletion', value)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            variant="contained"
            primary
            loading={updating}
            disabled={updating}
            onClick={async () => {
              await updateGuideSettings();
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
