import Block from '@/components/app/Block';
import { Grid4Cols } from '@/components/core/grids/Grid4Colst';
import CardLoader from '@/components/core/loaders/CardLoader';
import PageWrapper from '@/components/core/page/PageWrapper';
import ShowDraftsToggle from '@/components/guides/List/ShowDraftsToggle';
import GuideSummaryCard from '@/components/guides/Summary/GuideSummaryCard';
import NoGuide from '@/components/guides/Summary/NoGuides';
import { GuideSummaryFragment, useGuidesQueryQuery } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { isAdmin } from '@/utils/auth/isAdmin';
import sortBy from 'lodash/sortBy';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import React from 'react';

async function Guides() {
  const space = (await getSpaceServerSide())!;
  const { data, loading } = useGuidesQueryQuery({ variables: { space: space.id } });

  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const showDrafts = searchParams.get('showDrafts') === 'true';

  const isUserAdmin = session && isAdmin(session as Session, space);

  const guides = data?.guides?.filter((guide) => guide.publishStatus !== PublishStatus.Draft || showDrafts) || [];
  const hasDraftGuides = !!data?.guides?.find((guide) => guide.publishStatus === PublishStatus.Draft);
  const sortedGuides = sortBy(guides, (guide) => -(guide.priority || 50));
  return (
    <PageWrapper>
      {loading ? (
        <Block>
          <CardLoader />
        </Block>
      ) : (
        <div>
          {isUserAdmin && hasDraftGuides && <ShowDraftsToggle showDrafts={showDrafts} />}
          <div>
            <div className="flex justify-center items-center px-5 sm:px-0">
              {!sortedGuides.length && !loading && <NoGuide space={space} />}
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
      )}
    </PageWrapper>
  );
}

export default Guides;
