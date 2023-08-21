import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@/components/core/table/Table';
import { DiscoursePost, SpaceWithIntegrationsFragment, useDiscoursePostsQuery } from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import React from 'react';

function getIndexRunRows(discordRuns: DiscoursePost[]): TableRow[] {
  return discordRuns.map((post: DiscoursePost): TableRow => {
    const createdAt = moment(new Date(post.createdAt)).local().format('YYYY/MM/DD HH:mm');
    const datePublished = moment(new Date(post.datePublished)).local().format('YYYY/MM/DD HH:mm');
    const indexedAt = post.indexedAt ? moment(new Date(post.indexedAt)).local().format('YYYY/MM/DD HH:mm') : '-';
    return {
      id: post.id,
      columns: [post.id.substring(0, 6), post.title, post.url, createdAt, datePublished, indexedAt, post.status],
      item: {},
    };
  });
}

export default function DiscoursePosts(props: { space: SpaceWithIntegrationsFragment }) {
  const { data, loading } = useDiscoursePostsQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const discoursePosts = data?.discoursePosts;

  if (loading || !discoursePosts) {
    return <SectionLoader />;
  }

  return (
    <Table
      heading={'Discourse Index Runs'}
      data={getIndexRunRows(discoursePosts)}
      columnsHeadings={['Id', 'Title', 'Url', 'Post Date', 'Created At(DB)', 'Indexed At', 'Status']}
      columnsWidthPercents={[20, 50, 20, 10]}
    />
  );
}
