import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import PageLoading from '@/components/core/loaders/PageLoading';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { SpaceWithIntegrationsFragment, useExtendedSpaceQuery, useReloadAcademyRepoMutation } from '@/graphql/generated/generated-types';

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
      label: 'Skin',
      value: space.skin!,
    },
  ];
}

interface SpaceDetailsProps {
  spaceId: string;
  editLink: string;
}
export default function SpaceDetails(props: SpaceDetailsProps) {
  const { showNotification } = useNotificationContext();

  const [reloadAcademyRepoMutation] = useReloadAcademyRepoMutation();
  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'reloadRepo') {
      const response = await reloadAcademyRepoMutation({
        variables: {
          spaceId: props.spaceId,
        },
      });
      if (response.data?.reloadAcademyRepository) {
        showNotification({ type: 'success', message: 'Repo reloaded' });
      } else {
        showNotification({ type: 'error', message: 'Error reloading repo' });
      }
    }
  };

  const threeDotItems = [{ label: 'Reload Repo', key: 'reloadRepo' }];

  const { data } = useExtendedSpaceQuery({
    variables: {
      spaceId: props.spaceId,
    },
  });

  return data?.space ? (
    <DetailsSection>
      <div className="flex w-full">
        <DetailsHeader header={'Space Details'} subheader={'Information about your space'} editLink={props.editLink} className="grow-1 w-full" />
        <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
      </div>
      {getSpaceDetailsFields(data.space).map((field) => (
        <DetailsField key={field.label} label={field.label} value={field.value} />
      ))}
    </DetailsSection>
  ) : (
    <PageLoading />
  );
}
