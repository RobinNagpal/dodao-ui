import SectionLoader from '@/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@/components/core/table/Table';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { ScrapedUrlInfoFragmentFragment, SpaceWithIntegrationsFragment, useScrapedUrlInfosQuery } from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import Link from 'next/link';
import React from 'react';

function getIndexRunRows(discordRuns: ScrapedUrlInfoFragmentFragment[]): TableRow[] {
  return discordRuns.map((comment: ScrapedUrlInfoFragmentFragment): TableRow => {
    const indexedAt = moment(new Date(comment.createdAt)).local().format('YYYY/MM/DD HH:mm');
    return {
      id: comment.id,
      columns: [comment.id.substring(0, 6), comment.url, comment?.text.substring(0, 100), comment.textLength, indexedAt],
      item: {},
    };
  });
}

export default function WebsiteScrapedURLInfosTable(props: { space: SpaceWithIntegrationsFragment; websiteScrapingInfoId: string }) {
  const { data, loading } = useScrapedUrlInfosQuery({
    variables: {
      spaceId: props.space.id,
      websiteScrapingInfoId: props.websiteScrapingInfoId,
    },
  });

  const scrapedUrlInfos = data?.scrapedUrlInfos;

  if (loading || !scrapedUrlInfos) {
    return <SectionLoader />;
  }

  return (
    <div className="w-full">
      <Link href={'/space/manage/' + ManageSpaceSubviews.Chatbot} className="text-color">
        <span className="mr-1 font-bold">&#8592;</span>
        All Loaders
      </Link>
      <Table
        heading={'Discourse Index Runs'}
        data={getIndexRunRows(scrapedUrlInfos)}
        columnsHeadings={['Id', 'Url', 'Text', 'Text Length', 'Indexed At']}
        columnsWidthPercents={[20, 30, 30, 10, 10]}
      />
    </div>
  );
}
