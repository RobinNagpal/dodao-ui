import ClickableDemosSummaryCard from '@/components/clickableDemos/ClickableDemos/ClickableDemosSummaryCard';
import NoClickableDemos from '@/components/clickableDemos/ClickableDemos/NoClickableDemos';
import { Grid4Cols } from '@/components/core/grids/Grid4Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React from 'react';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import getApiResponse from '@/utils/api/getApiResponse';
import { ClickableDemo } from '@/graphql/generated/generated-types';

export default async function ClickableDemos() {
  const space = (await getSpaceServerSide())!;
  const demos = await getApiResponse<ClickableDemo[]>(space, 'clickable-demos');

  return (
    <PageWrapper>
      {!demos && <NoClickableDemos />}
      {demos.length && (
        <Grid4Cols>
          {demos.map((demo, i) => (
            <ClickableDemosSummaryCard key={i} clickableDemo={demo} />
          ))}
        </Grid4Cols>
      )}
    </PageWrapper>
  );
}
