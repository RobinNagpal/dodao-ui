'use client';

import withSpace from '@/contexts/withSpace';
import ClickableDemoModal from '@/components/clickableDemos/View/ClickableDemoModal';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { SpaceWithIntegrationsFragment, ClickableDemoWithSteps } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

function ViewClickableDemo({ params, space }: { params: { demoId: string[] }; space: SpaceWithIntegrationsFragment }) {
  const demoId = params.demoId[0];
  const [data, setData] = useState<{ clickableDemoWithSteps?: ClickableDemoWithSteps }>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios.get('/api/clickable-demo/clickable-demo-with-steps', {
        params: {
          spaceId: space.id,
          demoId,
        },
      });
      setData(response.data);
      setLoading(false);
    }
    fetchData();
  }, [demoId, space.id]);

  const router = useRouter();

  if (loading) {
    return <FullPageLoader />;
  }

  if (data?.clickableDemoWithSteps) {
    return (
      <ClickableDemoModal
        clickableDemoWithSteps={data!.clickableDemoWithSteps}
        space={space}
        onClose={() => {
          router.push(`/clickable-demos`);
        }}
      />
    );
  }
  return null;
}

export default withSpace(ViewClickableDemo);
