import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableActions, TableRow } from '@/components/core/table/Table';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  DiscordChannel,
  SpaceWithIntegrationsFragment,
  useDiscordChannelsQuery,
  useReFetchDiscordChannelsMutation,
  useUpdateIndexingOfDiscordChannelMutation,
} from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

function getChannelRows(discordRuns: DiscordChannel[]): TableRow[] {
  return discordRuns.map((channel: DiscordChannel): TableRow => {
    return {
      id: channel.id,
      columns: [channel.id.substring(0, 6), channel.name, channel.shouldIndex ? 'Yes' : 'No', channel.status],
      item: channel,
    };
  });
}

export default function DiscordChannels(props: { space: SpaceWithIntegrationsFragment }) {
  const { data, loading } = useDiscordChannelsQuery({
    variables: {
      spaceId: props.space.id,
      serverId: props.space.spaceIntegrations?.loadersInfo?.discordServerId || '',
    },
  });
  const { showNotification } = useNotificationContext();

  const [reFetchDiscordChannelsMutation] = useReFetchDiscordChannelsMutation();
  const [updateIndexingOfDiscordChannelMutation] = useUpdateIndexingOfDiscordChannelMutation();

  const router = useRouter();

  const tableActions: TableActions = useMemo(() => {
    return {
      items: (channel: DiscordChannel) => {
        return channel.shouldIndex
          ? [
              {
                key: 'viewMessages',
                label: 'View Messages',
              },
              { key: 'unindex', label: 'Unindex' },
            ]
          : [{ key: 'index', label: 'Index Message' }];
      },
      onSelect: async (key: string, item: DiscordChannel) => {
        if (key === 'viewMessages') {
          router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/discord/messages/' + item.id);
          return;
        }

        if (key === 'index') {
          await updateIndexingOfDiscordChannelMutation({
            variables: {
              spaceId: props.space.id,
              channelId: item.id,
              shouldIndex: true,
            },
            refetchQueries: ['DiscordChannels'],
          });

          showNotification({ message: 'Enabled Indexing on ' + item.name, type: 'success' });
        }

        if (key === 'unindex') {
          await updateIndexingOfDiscordChannelMutation({
            variables: {
              spaceId: props.space.id,
              channelId: item.id,
              shouldIndex: false,
            },
            refetchQueries: ['DiscordChannels'],
          });

          showNotification({ message: 'Disabled Indexing on ' + item.name, type: 'success' });
        }
      },
    };
  }, []);

  if (loading || !data) {
    return <SectionLoader />;
  }

  return (
    <div className="mt-8">
      <Table
        addNewLabel="Refetch Channels"
        onAddNew={async () => {
          await reFetchDiscordChannelsMutation({
            variables: {
              spaceId: props.space.id,
              serverId: props.space.spaceIntegrations?.loadersInfo?.discordServerId || '',
            },
            refetchQueries: ['DiscordChannels'],
          });
          showNotification({ message: 'Triggered new discourse index run', type: 'success' });
        }}
        actions={tableActions}
        heading={'Discord Channels'}
        data={getChannelRows(data?.discordChannels || [])}
        columnsHeadings={['Id', 'Name', 'Should Index', 'Status']}
        columnsWidthPercents={[20, 50, 20, 10]}
      />
    </div>
  );
}
