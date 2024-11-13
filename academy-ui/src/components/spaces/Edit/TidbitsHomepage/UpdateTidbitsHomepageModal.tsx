import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';
import { useEditTidbitsHomepage } from './useEditTidbitsHomepage';

export default function UpdateTidbitsHomepageModal(props: { space: SpaceWithIntegrationsDto; open: boolean; onClose: () => void }) {
  const { tidbitsHomepage, updateHeading, updateShortDescription, updateTidbitsHomepage, updating, tidbitsHomepageErrors, validateTidbitsHomepage } =
    useEditTidbitsHomepage(props.space);

  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Tidbits Homepage">
      <div className="p-8">
        <div className="space-y-12 text-left">
          <div className="border-b pb-12">
            <Input
              label="Heading"
              error={tidbitsHomepageErrors['heading'] ? 'Heading is required' : false}
              modelValue={tidbitsHomepage.heading}
              onUpdate={(value) => updateHeading(value?.toString() || '')}
            />

            <Input
              label="Short Description"
              error={tidbitsHomepageErrors['shortDescription'] ? 'Short Description is required' : false}
              modelValue={tidbitsHomepage.shortDescription}
              onUpdate={(value) => updateShortDescription(value?.toString() || '')}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            variant="contained"
            primary
            loading={updating}
            disabled={tidbitsHomepage?.heading?.length === 0 || tidbitsHomepage?.shortDescription?.length === 0}
            onClick={async () => {
              const bool = await updateTidbitsHomepage();
              if (bool) props.onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
