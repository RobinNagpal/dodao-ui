import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import SectionLoader from '@dodao/web-core/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import TabsWithUnderline, { TabItem } from '@dodao/web-core/components/core/tabs/TabsWithUnderline';
import DiscoursePostsTable from '@/components/spaces/Loaders/Discourse/DiscoursePostsTable';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import {
  DiscourseIndexRunFragmentFragment,
  SpaceWithIntegrationsFragment,
  useDiscourseIndexRunsQuery,
  useIndexNeedsIndexingDiscoursePostsMutation,
  useTriggerNewDiscourseIndexRunMutation,
  useUpdateIndexWithAllDiscordPostsMutation,
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
  const [updateIndexWithAllDiscordPostsMutation] = useUpdateIndexWithAllDiscordPostsMutation();

  const indexActions: EllipsisDropdownItem[] = [
    {
      label: 'Scrape And Index All Posts',
      key: 'scrapeAndIndexAllPosts',
    },
    {
      label: 'Index - NeedsIndexing Posts',
      key: 'indexNeedsIndexingPosts',
    },
    {
      label: 'Index Pincone with Posts in DB',
      key: 'indexPinconeWithPostsInDB',
    },
  ];

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
            <EllipsisDropdown
              items={indexActions}
              onSelect={async (value) => {
                if (value === 'scrapeAndIndexAllPosts') {
                  await triggerNewDiscourseIndexRunMutation({
                    variables: {
                      spaceId: props.space.id,
                    },
                    refetchQueries: ['DiscourseIndexRuns'],
                  });
                  showNotification({ message: 'Triggered new discourse index run', type: 'success' });
                }

                if (value === 'indexNeedsIndexingPosts') {
                  await indexNeedsIndexingDiscoursePostsMutation({
                    variables: {
                      spaceId: props.space.id,
                    },
                    refetchQueries: ['DiscourseIndexRuns'],
                  });
                  showNotification({ message: 'Triggered index run for needs indexing', type: 'success' });
                }

                if (value === 'indexPinconeWithPostsInDB') {
                  await updateIndexWithAllDiscordPostsMutation({
                    variables: {
                      spaceId: props.space.id,
                    },
                    refetchQueries: ['DiscourseIndexRuns'],
                  });
                  showNotification({ message: 'Triggered Indexing for posts in DB', type: 'success' });
                }
              }}
            />
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
