import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import UpsertSpaceLoadersInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertSpaceLoadersInfoModal';
import UpsertWebsiteScrapingInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertWebsiteScrapingInfoModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  Space,
  SpaceLoadersInfoInput,
  SpaceWithIntegrationsFragment,
  useDiscordServerQuery,
  useTriggerSiteScrapingRunMutation,
  useUpsertSpaceLoaderInfoMutation,
  useWebsiteScrapingInfosQuery,
  WebsiteScrapingInfoFragmentFragment,
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
  const websiteScrappingThreeDotItems = [{ label: 'Add', key: 'add' }];

  const [showUpsertSpaceLoadersInfoModal, setShowUpsertSpaceLoadersInfoModal] = useState(false);
  const [showAddWebsiteScrappingInfoModal, setShowAddWebsiteScrappingInfoModal] = useState(false);

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

  const selectFromScrapingThreedotDropdown = async (e: string) => {
    if (e === 'add') {
      setShowAddWebsiteScrappingInfoModal(true);
    }
  };
  const [upsertSpaceLoaderInfoMutation] = useUpsertSpaceLoaderInfoMutation({});
  const [triggerSiteScrapingRunMutation] = useTriggerSiteScrapingRunMutation();
  const { showNotification } = useNotificationContext();

  const { data: websiteInfos } = useWebsiteScrapingInfosQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

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

  function getWebsiteScrapingInfoTable(discoursePosts: WebsiteScrapingInfoFragmentFragment[]): TableRow[] {
    return discoursePosts.map((post: WebsiteScrapingInfoFragmentFragment): TableRow => {
      return {
        id: post.id,
        columns: [post.id.substring(0, 6), post.host, post.scrapingStartUrl, post.ignoreHashInUrl.toString()],
        item: post,
      };
    });
  }

  const actionItems: EllipsisDropdownItem[] = [
    {
      key: 'delete',
      label: 'Delete',
    },
    {
      key: 'index',
      label: 'Index',
    },
  ];

  return (
    <div>
      <DetailsSection className={props.className}>
        <div className="flex w-full">
          <DetailsHeader header={'Space Loaders Information'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={websiteScrappingThreeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getLoaderInfoFields(props.space, discordServerName).map((field) => (
          <DetailsField key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <div className="mt-16">
        <div className="flex justify-between">
          <div className="text-xl">Website Scraping Infos</div>
          <PrivateEllipsisDropdown items={websiteScrappingThreeDotItems} onSelect={selectFromScrapingThreedotDropdown} />
        </div>
        <Table
          data={getWebsiteScrapingInfoTable(websiteInfos?.websiteScrapingInfos || [])}
          columnsHeadings={['Id', 'Host', 'Scraping Start Url', 'Ignore Hash']}
          columnsWidthPercents={[5, 25, 20, 20, 20]}
          actions={{
            items: actionItems,
            onSelect: async (key: string, item: { id: string }) => {
              if (key === 'delete') {
              } else if (key === 'index') {
                await triggerSiteScrapingRunMutation({
                  variables: {
                    spaceId: props.space.id,
                    websiteScrapingInfoId: item.id,
                  },
                });
                showNotification({ message: 'Triggered Indexing of the site', type: 'success' });
              }
            },
          }}
        />
      </div>
      <UpsertWebsiteScrapingInfoModal
        open={showAddWebsiteScrappingInfoModal}
        onClose={() => setShowAddWebsiteScrappingInfoModal(false)}
        websiteScrapingInfo={undefined}
        spaceId={props.space.id}
      />
      <UpsertSpaceLoadersInfoModal
        onUpsert={upsert}
        open={showUpsertSpaceLoadersInfoModal}
        onClose={() => setShowUpsertSpaceLoadersInfoModal(false)}
        loadersInfo={props.space.spaceIntegrations?.loadersInfo || undefined}
      />
    </div>
  );
}
