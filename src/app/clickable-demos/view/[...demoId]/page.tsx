'use client';

import withSpace from '@/app/withSpace';
import ClickableDemoModal from '@/components/clickableDemos/View/ClickableDemoModal';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import { SpaceWithIntegrationsFragment, useClickableDemoWithStepsQuery } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';

function ViewClickableDemo({ params, space }: { params: { demoId: string[] }; space: SpaceWithIntegrationsFragment }) {
  const demoId = params.demoId[0];
  const { data, loading } = useClickableDemoWithStepsQuery({ variables: { spaceId: space.id, demoId } });

  const router = useRouter();

  if (loading) {
    return <FullPageLoader />;
  }

  if (data?.clickableDemoWithSteps) {
    return (
      <ClickableDemoModal
        clickableDemoWithSteps={data!.clickableDemoWithSteps}
        onClose={() => {
          router.push(`/clickable-demos`);
        }}
      />
    );
  }
  return null;
}

export default withSpace(ViewClickableDemo);
