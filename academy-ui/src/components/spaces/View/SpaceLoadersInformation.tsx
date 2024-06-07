import DetailsRow from '@dodao/web-core/components/core/details/DetailsRow';
import DetailsHeader from '@dodao/web-core/components/core/details/DetailsHeader';
import DetailsSection from '@dodao/web-core/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceLoadersInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertSpaceLoadersInfoModal';
import {
  Space,
  SpaceLoadersInfoInput,
  SpaceWithIntegrationsFragment,
  useDiscordServerQuery,
  useUpsertSpaceLoaderInfoMutation,
} from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
}

function getLoaderInfoFields(space: SpaceWithIntegrationsFragment, discordServerName: string): Array<{ label: string; value: string }> {
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
  const { data: discordServer } = useDiscordServerQuery({
    skip: !discordServerId,
    variables: {
      id: discordServerId!,
      spaceId: props.space.id,
    },
  });
  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowUpsertSpaceLoadersInfoModal(true);
    }
  };

  const [upsertSpaceLoaderInfoMutation] = useUpsertSpaceLoaderInfoMutation({});

  useEffect(() => {
    if (discordServerId && discordServer) {
      setDiscordServerName(`${discordServer.discordServer.name} - ${discordServer.discordServer.id}`);
    } else {
      setDiscordServerName('Not Set');
    }
  }, [discordServer]);

  const upsert = async (loaderInfos: SpaceLoadersInfoInput) => {
    await upsertSpaceLoaderInfoMutation({
      variables: {
        spaceId: props.space.id,
        input: loaderInfos,
      },
      refetchQueries: ['ExtendedSpace', 'ExtendedSpaceByDomain'],
    });
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
