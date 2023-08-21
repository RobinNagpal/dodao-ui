import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@/components/core/table/Table';
import { DiscourseIndexRunFragmentFragment, SpaceWithIntegrationsFragment, useDiscourseIndexRunsQuery } from '@/graphql/generated/generated-types';
import moment from 'moment';
import React from 'react';

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

export default function DiscourseIndexRuns(props: { space: SpaceWithIntegrationsFragment }) {
  const { data, loading } = useDiscourseIndexRunsQuery({
    variables: {
      spaceId: props.space.id,
    },
  });
  const discourseIndexRuns = data?.discourseIndexRuns;
  if (loading || !discourseIndexRuns) {
    return <SectionLoader />;
  }
  return (
    <div className="mx-8 mt-8">
      <div className="flex justify-between">
        <div className="text-xl">Loaders</div>
      </div>
      <Table data={getIndexRunRows(discourseIndexRuns)} columnsHeadings={['Id', 'Created At', 'Ran At', 'Status']} columnsWidthPercents={[20, 50, 20, 10]} />
    </div>
  );
}
