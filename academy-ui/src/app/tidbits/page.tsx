import BytesGrid from '@/components/bytes/List/BytesGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteSummaryFragment } from '@/graphql/generated/generated-types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';
import axios from 'axios';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function Byte() {
  const space = (await getSpaceServerSide())!;
  const response = await axios.get(`${getBaseUrl()}/api/${space.id}/bytes`);

  const bytes: ByteSummaryFragment[] = response.data.bytes;

  return (
    <PageWrapper>
      <TidbitsSiteTabs selectedTabId={TidbitSiteTabIds.Tidbits} />
      <BytesGrid bytes={bytes} baseByteViewUrl={`/tidbits/view`} space={space} />
    </PageWrapper>
  );
}
