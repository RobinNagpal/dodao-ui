import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@/components/core/table/Table';
import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import DiscoursePosts from '@/components/spaces/Loaders/Discourse/DiscoursePosts';
import { DiscourseIndexRunFragmentFragment, SpaceWithIntegrationsFragment, useDiscourseIndexRunsQuery } from '@/graphql/generated/generated-types';
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
  const [showCreateNewDiscourseIndexRunModal, setShowCreateNewDiscourseIndexRunModal] = useState(false);

  if (loading || !discourseIndexRuns) {
    return <SectionLoader />;
  }

  return (
    <div className="mx-8 mt-8">
      <div className="flex justify-end">
        <TabsWithUnderline selectedTabId={selectedTabId} setSelectedTabId={(id) => setSelectedTabId(id as TabIds)} tabs={tabs} className="w-96" />
      </div>
      {selectedTabId === TabIds.Posts ? (
        <DiscoursePosts space={props.space} />
      ) : (
        <div className="mt-8">
          <Table
            addNewLabel="Trigger New"
            onAddNew={() => {}}
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
