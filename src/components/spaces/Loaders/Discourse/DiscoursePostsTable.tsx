import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@/components/core/table/Table';
import AnnotateDiscoursePostModal from '@/components/spaces/Loaders/Discourse/AnnotateDiscoursePostModal';
import { ChatbotSubView, ChatbotView, getChatbotSubviewUrl, ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { DiscoursePost, SpaceWithIntegrationsFragment, useDiscoursePostsQuery, useIndexDiscoursePostMutation } from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function getIndexRunRows(discoursePosts: DiscoursePost[]): TableRow[] {
  return discoursePosts.map((post: DiscoursePost): TableRow => {
    const datePublished = moment(new Date(post.datePublished)).local().format('YYYY/MM/DD HH:mm');
    const indexedAt = post.indexedAt ? moment(new Date(post.indexedAt)).local().format('YYYY/MM/DD HH:mm') : '-';
    const annotation = `
Enacted: ${post.enacted ? 'Yes' : 'No'} \n
Discussed: ${post.discussed ? 'Yes' : 'No'} \n
Categories: ${post.categories?.join(', ') || '-'} \n
SubCategories: ${post.subCategories?.join(', ') || '-'} \n
    
`;
    return {
      id: post.id,
      columns: [post.title, post.url, annotation, datePublished, indexedAt, post.status],
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
  const [editDiscoursePost, setEditDiscoursePost] = useState<DiscoursePost | null>(null);

  const actionItems: EllipsisDropdownItem[] = [
    {
      key: 'view',
      label: 'View',
    },
    {
      key: 'index',
      label: 'Index',
    },
    {
      key: 'annotate',
      label: 'Annotate',
    },
  ];

  if (loading || !discoursePosts) {
    return <SectionLoader />;
  }

  return (
    <>
      <Table
        heading={'Discourse Posts'}
        data={getIndexRunRows(discoursePosts)}
        columnsHeadings={['Title', 'Url', 'Annotations', 'Post Date', 'Indexed At', 'Status']}
        columnsWidthPercents={[25, 20, 20, 10, 10, 10]}
        actions={{
          items: actionItems,
          onSelect: async (key: string, item: DiscoursePost) => {
            if (key === 'view') {
              const chatbotSubviewUrl = getChatbotSubviewUrl(ChatbotView.Discourse, ChatbotSubView.DiscoursePostComments, item.id);
              router.push(chatbotSubviewUrl);
            } else if (key === 'index') {
              await indexDiscoursePostMutation({
                variables: {
                  spaceId: props.space.id,
                  postId: item.id,
                },
              });
              showNotification({ message: 'Indexed Post', type: 'success' });
            } else if (key === 'annotate') {
              setEditDiscoursePost(item);
            }
          },
        }}
      />
      {editDiscoursePost && (
        <AnnotateDiscoursePostModal
          space={props.space}
          open={!!editDiscoursePost}
          onClose={() => {
            setEditDiscoursePost(null);
          }}
          post={editDiscoursePost}
        />
      )}
    </>
  );
}
