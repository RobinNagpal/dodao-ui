import DetailsRow from '@dodao/web-core/components/core/details/DetailsRow';
import DetailsHeader from '@dodao/web-core/components/core/details/DetailsHeader';
import DetailsSection from '@dodao/web-core/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceBasicSettingsModal from '@/components/spaces/Edit/Basic/UpsertSpaceBasicSettingsModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { Space, SpaceWithIntegrationsFragment, useReloadAcademyRepoMutation } from '@/graphql/generated/generated-types';
import React from 'react';

export interface SpaceBasicDetailsProps {
  space: Space;
  className?: string;
}

function getSpaceDetailsFields(space: SpaceWithIntegrationsFragment): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Id',
      value: space.id!,
    },
    {
      label: 'Name',
      value: space.name!,
    },
    {
      label: 'Theme',
      value: space.skin!,
    },
    {
      label: 'Logo',
      value: space.avatar!,
    },
    {
      label: 'Academy Repo',
      value: space.spaceIntegrations?.academyRepository!,
    },
    {
      label: 'Domains',
      value: space.domains!.join(', ') || 'None',
    },
    {
      label: 'Bot Domains',
      value: space.botDomains!.join(', ') || 'None',
    },
    {
      label: 'Admins',
      value: space.admins!.join(', ') || 'None',
    },
    {
      label: 'Admins By Username',
      value: space.adminUsernames!.join(', ') || 'None',
    },
    {
      label: 'Admins By Username & Names',
      value:
        space.adminUsernamesV1 && space.adminUsernamesV1.length > 0
          ? space.adminUsernamesV1.map((admin) => `(${admin.username} , ${admin.nameOfTheUser})`).join(' , ')
          : 'None',
    },
  ];
}

export default function SpaceBasicDetails(props: SpaceBasicDetailsProps) {
  const [showBasicSettingsModal, setShowBasicSettingsModal] = React.useState(false);

  const threeDotItems = [
    { label: 'Reload Repo', key: 'reloadRepo' },
    { label: 'Edit', key: 'edit' },
  ];
  const { showNotification } = useNotificationContext();

  const [reloadAcademyRepoMutation] = useReloadAcademyRepoMutation();

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'reloadRepo') {
      const response = await reloadAcademyRepoMutation({
        variables: {
          spaceId: props.space.id,
        },
      });
      if (response.data?.reloadAcademyRepository) {
        showNotification({ type: 'success', message: 'Repo reloaded' });
      } else {
        showNotification({ type: 'error', message: 'Error reloading repo' });
      }
    }

    if (e === 'edit') {
      setShowBasicSettingsModal(true);
    }
  };

  return (
    <>
      <DetailsSection className={`${props.className} shadow`}>
        <div className="flex w-full">
          <DetailsHeader header={'Basic Details'} subheader={'Basic information about your space'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getSpaceDetailsFields(props.space).map((field) => (
          <DetailsRow key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <UpsertSpaceBasicSettingsModal space={props.space} open={showBasicSettingsModal} onClose={() => setShowBasicSettingsModal(false)} />
    </>
  );
}
