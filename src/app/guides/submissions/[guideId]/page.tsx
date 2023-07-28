'use client';

import withSpace from '@/app/withSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import GuideSubmissionsTable from '@/components/guideSubmissions/GuideSubmissionsTable';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

function GuideSubmissionsPage(props: { space: SpaceWithIntegrationsFragment; params: { guideId: string } }) {
  return (
    <PageWrapper>
      <GuideSubmissionsTable space={props.space} guideId={props.params.guideId} />
    </PageWrapper>
  );
}

export default withSpace(GuideSubmissionsPage);
