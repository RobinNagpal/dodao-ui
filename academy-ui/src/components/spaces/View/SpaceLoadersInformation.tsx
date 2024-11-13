import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceLoadersInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertSpaceLoadersInfoModal';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DetailsHeader from '@dodao/web-core/components/core/details/DetailsHeader';
import DetailsRow from '@dodao/web-core/components/core/details/DetailsRow';
import DetailsSection from '@dodao/web-core/components/core/details/DetailsSection';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: SpaceWithIntegrationsDto;
  className?: string;
}

function getLoaderInfoFields(space: SpaceWithIntegrationsDto, discordServerName: string): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Discourse Url',
      value: space.spaceIntegrations?.loadersInfo?.discourseUrl || 'Not Set',
    },
    {
      label: 'Discord Server',
      value: discordServerName,
    },
  ];
}

export default function SpaceLoadersInformation(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];

  const [showUpsertSpaceLoadersInfoModal, setShowUpsertSpaceLoadersInfoModal] = useState(false);

  const [discordServerName, setDiscordServerName] = useState('Not Set');
  const discordServerId = props.space.spaceIntegrations?.loadersInfo?.discordServerId;
  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowUpsertSpaceLoadersInfoModal(true);
    }
  };

  const upsert = async () => {
    setShowUpsertSpaceLoadersInfoModal(false);
  };

  return (
    <div>
      <DetailsSection className={props.className}>
        <div className="flex w-full">
          <DetailsHeader header={'Space Loaders Information'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getLoaderInfoFields(props.space, discordServerName).map((field) => (
          <DetailsRow key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <UpsertSpaceLoadersInfoModal
        onUpsert={upsert}
        open={showUpsertSpaceLoadersInfoModal}
        onClose={() => setShowUpsertSpaceLoadersInfoModal(false)}
        loadersInfo={props.space.spaceIntegrations?.loadersInfo || undefined}
      />
    </div>
  );
}
