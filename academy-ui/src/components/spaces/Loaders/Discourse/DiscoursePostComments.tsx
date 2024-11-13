import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import SectionLoader from '@dodao/web-core/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { DiscoursePostComment, useDiscoursePostCommentsQuery } from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import Link from 'next/link';
import React from 'react';

function getIndexRunRows(discordRuns: DiscoursePostComment[]): TableRow[] {
  return discordRuns.map((comment: DiscoursePostComment): TableRow => {
    const datePublished = moment(new Date(comment.datePublished)).local().format('YYYY/MM/DD HH:mm');
    const indexedAt = comment.indexedAt ? moment(new Date(comment.indexedAt)).local().format('YYYY/MM/DD HH:mm') : '-';
    return {
      id: comment.id,
      columns: [comment.id.substring(0, 6), comment.content?.substring(0, 100), datePublished, indexedAt],
      item: {},
    };
  });
}

export default function DiscoursePostComments(props: { space: SpaceWithIntegrationsDto; postId: string }) {
  const { data, loading } = useDiscoursePostCommentsQuery({
    variables: {
      spaceId: props.space.id,
      postId: props.postId,
    },
  });

  const discoursePostComments = data?.discoursePostComments;

  if (loading || !discoursePostComments) {
    return <SectionLoader />;
  }

  return (
    <div className="w-full">
      <Link href={'/space/manage/' + ManageSpaceSubviews.Chatbot + '/discourse/discourse-index-runs'} className="text-color">
        <span className="mr-1 font-bold">&#8592;</span>
        All Posts
      </Link>
      <Table
        heading={'Discourse Index Runs'}
        data={getIndexRunRows(discoursePostComments)}
        columnsHeadings={['Id', 'Contents', 'Comment Date', 'Indexed At']}
        columnsWidthPercents={[20, 50, 20, 10]}
      />
    </div>
  );
}
