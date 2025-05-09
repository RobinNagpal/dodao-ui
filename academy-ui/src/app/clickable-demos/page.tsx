import ClickableDemosSummaryCard from '@/components/clickableDemos/ClickableDemos/ClickableDemosSummaryCard';
import NoClickableDemos from '@/components/clickableDemos/ClickableDemos/NoClickableDemos';
import { ClickableDemo } from '@/graphql/generated/generated-types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import React from 'react';

export default async function ClickableDemos() {
  const space = (await getSpaceServerSide())!;
  const response = await axios.get(`${getBaseUrl()}/api/clickable-demos`, {
    params: {
      spaceId: space.id,
    },
  });
  const demos: ClickableDemo[] = response.data.clickableDemos;

  return (
    <PageWrapper>
      {!demos && <NoClickableDemos />}
      {demos.length && (
        <Grid4Cols>
          {demos.map((demo, i) => (
            <ClickableDemosSummaryCard key={i} clickableDemo={demo} space={space} />
          ))}
        </Grid4Cols>
      )}
    </PageWrapper>
  );
}
