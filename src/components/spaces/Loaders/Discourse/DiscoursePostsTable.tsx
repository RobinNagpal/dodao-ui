import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@/components/core/table/Table';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { DiscoursePost, SpaceWithIntegrationsFragment, useDiscoursePostsQuery, useIndexDiscoursePostMutation } from '@/graphql/generated/generated-types';
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

export default function DiscoursePostsTable(props: { space: SpaceWithIntegrationsFragment }) {
  const { data, loading } = useDiscoursePostsQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const discoursePosts = data?.discoursePosts;
  const [indexDiscoursePostMutation] = useIndexDiscoursePostMutation();

  if (loading || !discoursePosts) {
    return <SectionLoader />;
  }

  const actionItems: EllipsisDropdownItem[] = [
    {
      key: 'view',
      label: 'View',
    },
    {
      key: 'index',
      label: 'Index',
    },
  ];
  return (
    <Table
      heading={'Discourse Posts'}
      data={getIndexRunRows(discoursePosts)}
      columnsHeadings={['Id', 'Title', 'Url', 'Post Date', 'Indexed At', 'Status']}
      columnsWidthPercents={[5, 25, 20, 10, 10, 10, 10, 10]}
      actions={{
        items: actionItems,
        onSelect: async (key: string, item: { id: string }) => {
          if (key === 'view') {
            router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/discourse/post-comments/' + item.id);
          } else if (key === 'index') {
            await indexDiscoursePostMutation({
              variables: {
                spaceId: props.space.id,
                postId: item.id,
              },
            });
            showNotification({ message: 'Indexed Post', type: 'success' });
          }
        },
      }}
    />
  );
}
