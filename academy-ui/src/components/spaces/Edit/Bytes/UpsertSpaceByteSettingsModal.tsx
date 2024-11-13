import { useEditSpaceByteSettings } from '@/components/spaces/Edit/Bytes/useEditSpaceByteSettings';
import { ByteViewMode } from '@/types/bytes/ByteDto';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import React from 'react';

export default function UpsertSpaceByteSettingsModal(props: {
  space: SpaceWithIntegrationsDto;
  open: boolean;
  onClose: () => void;
  onUpdateSettings: () => Promise<void>;
}) {
  const { byteSettings, setByteSettingsField, updateByteSettings, updating } = useEditSpaceByteSettings(props.space, props.onUpdateSettings);

  const byteViewModeSelect: StyledSelectItem[] = [
    {
      label: 'Card Stepper',
      id: ByteViewMode.CardStepper,
    },
    {
      label: 'Full Screen Swiper',
      id: ByteViewMode.FullScreenSwiper,
    },
  ];

  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Byte Settings">
      <div className="py-4 px-8">
        <div className="space-y-12 text-left">
          <div className="border-b pb-12">
            <ToggleWithIcon
              label={'Show ratings'}
              enabled={!!byteSettings.captureRating}
              setEnabled={(value) => setByteSettingsField('captureRating', value)}
            />

            <ToggleWithIcon
              label={'Ask for login to submit'}
              enabled={!!byteSettings.askForLoginToSubmit}
              setEnabled={(value) => setByteSettingsField('askForLoginToSubmit', value)}
            />

            <ToggleWithIcon
              label={'Show categories in sidebar'}
              enabled={!!byteSettings.showCategoriesInSidebar}
              setEnabled={(value) => setByteSettingsField('showCategoriesInSidebar', value)}
            />

            <StyledSelect
              label={'View Mode'}
              items={byteViewModeSelect}
              setSelectedItemId={(mode) => {
                setByteSettingsField('byteViewMode', mode);
              }}
              selectedItemId={byteSettings.byteViewMode || ByteViewMode.CardStepper}
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
              await updateByteSettings();
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
