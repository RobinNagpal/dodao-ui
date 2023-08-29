import { Table, TableActions, TableRow } from '@/components/core/table/Table';
import DiscordChannels from '@/components/spaces/Loaders/Discord/DiscordChannels';
import DiscordMessages from '@/components/spaces/Loaders/Discord/DiscordMessages';
import DiscourseIndexRuns from '@/components/spaces/Loaders/Discourse/DiscourseIndexRuns';
import DiscoursePostComments from '@/components/spaces/Loaders/Discourse/DiscoursePostComments';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

function getLoaderRows(): TableRow[] {
  const indexedAt = moment(new Date()).local().format('YYYY/MM/DD HH:mm');
  const tableRows: TableRow[] = [];
  tableRows.push({
    id: 'discourse',
    columns: ['Discourse', indexedAt, 'STATUS'],
    item: {
      id: 'discourse',
    },
  });

  tableRows.push({
    id: 'discord',
    columns: ['Discord', indexedAt, 'STATUS'],
    item: {
      id: 'discord',
    },
  });
  return tableRows;
}

export default function AllLoaders(props: { space: SpaceWithIntegrationsFragment; spaceInfoParams: string[] }) {
  const router = useRouter();

  const loaderType = props.spaceInfoParams?.[2];
  const loaderSubview = props.spaceInfoParams?.[3];
  const subviewPathParam = props.spaceInfoParams?.[4];

  const tableActions: TableActions = useMemo(() => {
    return {
      items: [
        {
          key: 'view',
          label: 'View',
        },
      ],
      onSelect: async (key: string, item: { id: string }) => {
        if (key === 'view') {
          if (item.id === 'discourse') {
            router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/discourse/discourse-index-runs');
            return;
          }

          const discordServerId = props.space.spaceIntegrations?.loadersInfo?.discordServerId;
          console.log('discordServerId', discordServerId);
          if (item.id === 'discord' && discordServerId) {
            router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/discord/channels');
            return;
          }
        }
      },
    };
  }, []);

  if (loaderSubview === 'discourse-index-runs') {
    return <DiscourseIndexRuns space={props.space} />;
  }

  if (loaderSubview === 'post-comments' && subviewPathParam) {
    return <DiscoursePostComments space={props.space} postId={subviewPathParam} />;
  }

  if (loaderSubview === 'channels') {
    return <DiscordChannels space={props.space} />;
  }

  if (loaderSubview === 'messages' && subviewPathParam) {
    return <DiscordMessages space={props.space} channelId={subviewPathParam} />;
  }
  return (
    <div className="mx-8 mt-8">
      <div className="flex justify-between">
        <div className="text-xl">Loaders</div>
      </div>
      <Table data={getLoaderRows()} columnsHeadings={['Loader', 'Last Indexed At', 'Status']} columnsWidthPercents={[20, 50, 20, 10]} actions={tableActions} />
    </div>
  );
}
