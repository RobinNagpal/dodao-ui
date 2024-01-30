import { Grid4Cols } from '@/components/core/grids/Grid4Cols';
import PageWrapper from '@/components/core/page/PageWrapper';
import ShowDraftsToggle from '@/components/guides/List/ShowDraftsToggle';
import GuideSummaryCard from '@/components/guides/Summary/GuideSummaryCard';
import NoGuide from '@/components/guides/Summary/NoGuides';
import { GuideSummaryFragment } from '@/graphql/generated/generated-types';
import { PublishStatus } from '@/types/deprecated/models/enums';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import sortBy from 'lodash/sortBy';
import { Metadata } from 'next';
import React from 'react';

type GuidesProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Guides',
    description: 'Guides about different Blockchain concepts.',
    keywords: ['Guides', 'Blockchain'],
  };
}

async function Guides({ searchParams }: GuidesProps) {
  const space = (await getSpaceServerSide())!;

  const allGuides = await getApiResponse<GuideSummaryFragment[]>(space, 'guides');

  const showDrafts = searchParams?.['showDrafts'] === 'true';

  const guides = allGuides?.filter((guide) => guide.publishStatus !== PublishStatus.Draft || showDrafts) || [];
  const hasDraftGuides = !!allGuides?.find((guide) => guide.publishStatus === PublishStatus.Draft);
  const sortedGuides = sortBy(guides, (guide) => -(guide.priority || 50));
  return (
    <PageWrapper>
      <div>
        {hasDraftGuides && <ShowDraftsToggle space={space} showDrafts={showDrafts} />}
        <div>
          <div className="flex justify-center items-center px-5 sm:px-0">
            {!sortedGuides.length && <NoGuide space={space} />}
            {sortedGuides.length ? (
              <Grid4Cols>
                {sortedGuides.map((guide: GuideSummaryFragment, i) => (
                  <GuideSummaryCard key={i} guide={guide} />
                ))}
              </Grid4Cols>
            ) : null}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Guides;
