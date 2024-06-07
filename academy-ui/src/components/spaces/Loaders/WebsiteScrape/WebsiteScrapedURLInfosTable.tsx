import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import SectionLoader from '@dodao/web-core/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { ScrapedUrlInfoFragmentFragment, SpaceWithIntegrationsFragment, useScrapedUrlInfosQuery } from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import Link from 'next/link';
import React, { useState } from 'react';
import ViewCompleteWebsiteTextModal from '../../Edit/LoadersInfo/ViewCompleteWebsiteTextModal';

function getIndexRunRows(discordRuns: ScrapedUrlInfoFragmentFragment[]): TableRow[] {
  return discordRuns.map((comment: ScrapedUrlInfoFragmentFragment): TableRow => {
    const indexedAt = moment(new Date(comment.createdAt)).local().format('YYYY/MM/DD HH:mm');
    return {
      id: comment.id,
      columns: [comment.id.substring(0, 6), comment.url, comment?.textSample, comment.textLength, indexedAt],
      item: comment,
    };
  });
}

export default function WebsiteScrapedURLInfosTable(props: { space: SpaceWithIntegrationsFragment; websiteScrapingInfoId: string }) {
  const [viewCompleteTextModal, setViewCompleteTextModal] = useState<boolean>(false);
  const [websiteIndexingSpaceAndInfoId, setWebsiteIndexingSpaceAndInfoId] = useState<{ spaceId: string; scrapedUrlInfoId: string } | undefined>(undefined);
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

  const siteScrapingActionItems: EllipsisDropdownItem[] = [
    {
      key: 'view',
      label: 'View complete text',
    },
  ];

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
        actions={{
          items: siteScrapingActionItems,
          onSelect: async (key: string, item: { id: string }) => {
            if (key === 'view') {
              setWebsiteIndexingSpaceAndInfoId({ spaceId: props.space.id, scrapedUrlInfoId: item.id });
              setViewCompleteTextModal(true);
            }
          },
        }}
      />
      {viewCompleteTextModal && (
        <ViewCompleteWebsiteTextModal
          indexingInfo={websiteIndexingSpaceAndInfoId}
          open={viewCompleteTextModal}
          onClose={() => {
            setWebsiteIndexingSpaceAndInfoId(undefined);
            setViewCompleteTextModal(false);
          }}
        />
      )}
    </div>
  );
}
