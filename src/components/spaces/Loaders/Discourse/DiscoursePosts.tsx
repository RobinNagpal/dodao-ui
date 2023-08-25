import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@/components/core/table/Table';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { DiscoursePost, SpaceWithIntegrationsFragment, useDiscoursePostsQuery } from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import { useRouter } from 'next/navigation';
import React from 'react';

function getIndexRunRows(discoursePosts: DiscoursePost[]): TableRow[] {
  return discoursePosts.map((post: DiscoursePost): TableRow => {
    const datePublished = moment(new Date(post.datePublished)).local().format('YYYY/MM/DD HH:mm');
    const indexedAt = post.indexedAt ? moment(new Date(post.indexedAt)).local().format('YYYY/MM/DD HH:mm') : '-';
    return {
      id: post.id,
      columns: [post.id.substring(0, 6), post.title, post.url, datePublished, indexedAt, post.status],
      item: post,
    };
  });
}

export default function DiscoursePosts(props: { space: SpaceWithIntegrationsFragment }) {
  const { data, loading } = useDiscoursePostsQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const router = useRouter();

  const discoursePosts = data?.discoursePosts;

  if (loading || !discoursePosts) {
    return <SectionLoader />;
  }

  const actionItems: EllipsisDropdownItem[] = [
    {
      key: 'view',
      label: 'View',
    },
  ];
  return (
    <Table
      heading={'Discourse Index Runs'}
      data={getIndexRunRows(discoursePosts)}
      columnsHeadings={['Id', 'Title', 'Url', 'Post Date', 'Indexed At', 'Status']}
      columnsWidthPercents={[5, 25, 20, 10, 10, 10, 10, 10]}
      actions={{
        items: actionItems,
        onSelect: async (key: string, item: { id: string }) => {
          console.log('item', item);
          router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/post-comments/' + item.id);
        },
      }}
    />
  );
}
