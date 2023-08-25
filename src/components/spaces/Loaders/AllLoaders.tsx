import { Table, TableActions, TableRow } from '@/components/core/table/Table';
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

  const loaderSubview = props.spaceInfoParams?.[2];
  const subviewPathParam = props.spaceInfoParams?.[3];

  console.log('loaderSubview', loaderSubview);
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
            router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/' + 'discourse-index-runs');
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
  return (
    <div className="mx-8 mt-8">
      <div className="flex justify-between">
        <div className="text-xl">Loaders</div>
      </div>
      <Table data={getLoaderRows()} columnsHeadings={['Loader', 'Last Indexed At', 'Status']} columnsWidthPercents={[20, 50, 20, 10]} actions={tableActions} />
    </div>
  );
}
