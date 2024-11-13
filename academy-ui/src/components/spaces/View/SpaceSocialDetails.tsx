import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceSocialSettingsModal from '@/components/spaces/Edit/Social/UpsertSpaceSocialSettingsModal';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DetailsHeader from '@dodao/web-core/components/core/details/DetailsHeader';
import DetailsRow from '@dodao/web-core/components/core/details/DetailsRow';
import DetailsSection from '@dodao/web-core/components/core/details/DetailsSection';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: SpaceWithIntegrationsDto;
  className?: string;
}

function getSpaceSocialFields(space: SpaceWithIntegrationsDto): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Link Share PDF Background Image',
      value: space.socialSettings.linkedSharePdfBackgroundImage || 'Not Set',
    },
  ];
}

export default function SpaceSocialDetails(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const [showSocialSettingsModal, setShowSocialSettingsModal] = useState(false);

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowSocialSettingsModal(true);
    }
  };

  return (
    <>
      <DetailsSection className={`${props.className} shadow`}>
        <div className="flex w-full">
          <DetailsHeader header={'Social Details'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getSpaceSocialFields(props.space).map((field) => (
          <DetailsRow key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <UpsertSpaceSocialSettingsModal space={props.space} open={showSocialSettingsModal} onClose={() => setShowSocialSettingsModal(false)} />
    </>
  );
}
