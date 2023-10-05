'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import { Grid4Cols } from '@/components/core/grids/Grid4Colst';
import GuideSkeleton from '@/components/core/loaders/CardLoader';
import PageWrapper from '@/components/core/page/PageWrapper';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import GuideSummaryCard from '@/components/guides/Summary/GuideSummaryCard';
import NoGuide from '@/components/guides/Summary/NoGuides';
import { GuideSummaryFragment, useGuidesQueryQuery } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { isAdmin } from '@/utils/auth/isAdmin';
import sortBy from 'lodash/sortBy';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

function Guide({ space }: SpaceProps) {
  const { data, loading } = useGuidesQueryQuery({ variables: { space: space.id } });

  const { data: session } = useSession();

  const isUserAdmin = session && isAdmin(session as Session, space);

  const [showDrafts, setShowDrafts] = useState(false);

  const guides = data?.guides?.filter((guide) => guide.publishStatus !== PublishStatus.Draft || showDrafts) || [];
  const hasDraftGuides = !!data?.guides?.find((guide) => guide.publishStatus === PublishStatus.Draft);
  const sortedGuides = sortBy(guides, (guide) => -(guide.priority || 50));
  return (
    <PageWrapper>
      {loading ? (
        <Block>
          <GuideSkeleton />
        </Block>
      ) : (
        <div>
          {isUserAdmin && hasDraftGuides && (
            <div className="w-full mb-4 flex justify-end">
              <div className="w-52">
                <ToggleWithIcon label={'Show Draft'} enabled={showDrafts} setEnabled={(value) => setShowDrafts(value)} />
              </div>
            </div>
          )}
          <div>
            <div className="flex justify-center items-center px-5 sm:px-0">
              {!sortedGuides.length && !loading && <NoGuide />}
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

export default withSpace(Guide);
