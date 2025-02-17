import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceAuthSettingsModal from '@/components/spaces/Edit/Auth/UpsertSpaceAuthSettingsModal';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DetailsHeader from '@dodao/web-core/components/core/details/DetailsHeader';
import DetailsRow from '@dodao/web-core/components/core/details/DetailsRow';
import DetailsSection from '@dodao/web-core/components/core/details/DetailsSection';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: SpaceWithIntegrationsDto;
  className?: string;
}

function getSpaceDetailsFields(space: SpaceWithIntegrationsDto): Array<{ label: string; value: string }> {
  return [
    {
      label: 'EnableLogin',
      value: (!!space.authSettings.enableLogin).toString(),
    },
    {
      label: 'Allowed Login',
      value: space.authSettings.loginOptions?.join(', ') || 'All',
    },
  ];
}

export default function SpaceAuthDetails(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const [showAuthSettingsModal, setShowAuthSettingsModal] = useState(false);

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowAuthSettingsModal(true);
    }
  };

  return (
    <>
      <DetailsSection className={`${props.className} shadow`}>
        <div className="flex w-full">
          <DetailsHeader header={'Auth Details'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} space={props.space} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getSpaceDetailsFields(props.space).map((field) => (
          <DetailsRow key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <UpsertSpaceAuthSettingsModal space={props.space} open={showAuthSettingsModal} onClose={() => setShowAuthSettingsModal(false)} />
    </>
  );
}
