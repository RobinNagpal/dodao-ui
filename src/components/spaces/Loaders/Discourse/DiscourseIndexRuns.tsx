import Button from '@/components/core/buttons/Button';
import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@/components/core/table/Table';
import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import DiscoursePostsTable from '@/components/spaces/Loaders/Discourse/DiscoursePostsTable';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  DiscourseIndexRunFragmentFragment,
  SpaceWithIntegrationsFragment,
  useDiscourseIndexRunsQuery,
  useIndexNeedsIndexingDiscoursePostsMutation,
  useTriggerNewDiscourseIndexRunMutation,
} from '@/graphql/generated/generated-types';
import moment from 'moment';
import React, { useState } from 'react';

function getIndexRunRows(discordRuns: DiscourseIndexRunFragmentFragment[]): TableRow[] {
  return discordRuns.map((run: DiscourseIndexRunFragmentFragment): TableRow => {
    const createdAt = moment(new Date(run.createdAt)).local().format('YYYY/MM/DD HH:mm');
    const runDate = run.runDate ? moment(new Date(run.runDate)).local().format('YYYY/MM/DD HH:mm') : '-';
    return {
      id: run.id,
      columns: [run.id.substring(0, 6), createdAt, runDate, run.status],
      item: {},
    };
  });
}

enum TabIds {
  Runs = 'Runs',
  Posts = 'Posts',
}

export default function DiscourseIndexRuns(props: { space: SpaceWithIntegrationsFragment }) {
  const { data, loading } = useDiscourseIndexRunsQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const { showNotification } = useNotificationContext();

  const discourseIndexRuns = data?.discourseIndexRuns;
  const tabs: TabItem[] = [
    {
      id: TabIds.Runs,
      label: 'Runs',
    },

    {
      id: TabIds.Posts,
      label: 'Posts',
    },
  ];

  const [selectedTabId, setSelectedTabId] = useState(TabIds.Runs);
  const [triggerNewDiscourseIndexRunMutation] = useTriggerNewDiscourseIndexRunMutation();
  const [indexNeedsIndexingDiscoursePostsMutation] = useIndexNeedsIndexingDiscoursePostsMutation();

  if (loading || !discourseIndexRuns) {
    return <SectionLoader />;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-end">
        <TabsWithUnderline selectedTabId={selectedTabId} setSelectedTabId={(id) => setSelectedTabId(id as TabIds)} tabs={tabs} className="w-96" />
      </div>
      {selectedTabId === TabIds.Posts ? (
        <DiscoursePostsTable space={props.space} />
      ) : (
        <div className="mt-8">
          <div className="flex justify-end">
            <Button
              primary
              variant="contained"
              onClick={async () => {
                await triggerNewDiscourseIndexRunMutation({
                  variables: {
                    spaceId: props.space.id,
                  },
                  refetchQueries: ['DiscourseIndexRuns'],
                });
                showNotification({ message: 'Triggered new discourse index run', type: 'success' });
              }}
              className="mr-4"
            >
              Trigger Full Index
            </Button>
            <Button
              primary
              variant="contained"
              onClick={async () => {
                await indexNeedsIndexingDiscoursePostsMutation({
                  variables: {
                    spaceId: props.space.id,
                  },
                  refetchQueries: ['DiscourseIndexRuns'],
                });
                showNotification({ message: 'Triggered index run for needs indexing', type: 'success' });
              }}
            >
              Update Needs Indexing
            </Button>
          </div>
          <Table
            heading={'Discourse Index Runs'}
            data={getIndexRunRows(discourseIndexRuns)}
            columnsHeadings={['Id', 'Created At', 'Ran At', 'Status']}
            columnsWidthPercents={[20, 50, 20, 10]}
          />
        </div>
      )}
    </div>
  );
}
