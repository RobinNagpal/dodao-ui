import BytesGrid from '@/components/bytes/List/BytesGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteSummaryFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

export default async function Byte() {
  const space = (await getSpaceServerSide())!;

  const bytes = await getApiResponse<ByteSummaryFragment[]>(space, 'bytes');

  return (
    <PageWrapper>
      <TidbitsSiteTabs selectedTabId={TidbitSiteTabIds.Tidbits} />
      <BytesGrid bytes={bytes} baseByteViewUrl={`/tidbits/view`} byteType={'byte'} space={space} />
    </PageWrapper>
  );
}
