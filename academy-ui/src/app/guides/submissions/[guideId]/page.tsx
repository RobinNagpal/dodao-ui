'use client';

import withSpace from '@/contexts/withSpace';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import GuideSubmissionsTable from '@/components/guides/Submissions/GuideSubmissionsTable';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';

function GuideSubmissionsPage(props: { space: SpaceWithIntegrationsFragment; params: { guideId: string } }) {
  return (
    <PageWrapper>
      <div tw="px-4 md:px-0 overflow-hidden">
        <Link href={`/guides/view/${props.params.guideId}/0`} className="text-color">
          <span className="mr-1 font-bold">&#8592;</span>
          Back to Guide
        </Link>
      </div>
      <div className="mt-4">
        <GuideSubmissionsTable space={props.space} guideId={props.params.guideId} />
      </div>
    </PageWrapper>
  );
}

export default withSpace(GuideSubmissionsPage);
