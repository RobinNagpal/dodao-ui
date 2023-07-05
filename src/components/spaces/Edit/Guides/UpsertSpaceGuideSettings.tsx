import Button from '@/components/core/buttons/Button';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { useEditSpaceGuideSettings } from '@/components/spaces/Edit/Guides/useEditSpaceGuideSettings';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export default function UpsertSpaceGuideSettings(props: { space: SpaceWithIntegrationsFragment }) {
  const { guideSettings, setGuideSettingsField, updateGuideSettings, updating } = useEditSpaceGuideSettings(props.space);
  return (
    <>
      <div className="space-y-12">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <ToggleWithIcon
            label={'Show ratings'}
            enabled={!!guideSettings.captureBeforeAndAfterRating}
            setEnabled={(value) => setGuideSettingsField('captureBeforeAndAfterRating', value)}
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
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" primary loading={updating} disabled={updating} onClick={updateGuideSettings}>
          Save
        </Button>
      </div>
    </>
  );
}
