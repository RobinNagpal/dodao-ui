import ShowDraftsToggle from '@/components/guides/List/ShowDraftsToggle';
import GuideSummaryCard from '@/components/guides/Summary/GuideSummaryCard';
import NoGuide from '@/components/guides/Summary/NoGuides';
import { GuideSummaryFragment } from '@/graphql/generated/generated-types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { PublishStatus } from '@dodao/web-core/types/deprecated/models/enums';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import sortBy from 'lodash/sortBy';
import { Metadata } from 'next';
import React from 'react';

type GuidesProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Guides about different Blockchain concepts.',
  keywords: [],
};

async function Guides({ searchParams }: GuidesProps) {
  const space = (await getSpaceServerSide())!;

  const response = await axios.get(`${getBaseUrl()}/api/guide/guides`, {
    params: {
      spaceId: space.id,
    },
  });
  const allGuides: GuideSummaryFragment[] = response.data.guides;

  const showDrafts = (await searchParams)?.['showDrafts'] === 'true';

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
