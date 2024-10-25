'use client';

import ClickableDemoModal from '@/components/clickableDemos/View/ClickableDemoModal';
import withSpace from '@/contexts/withSpace';
import { ClickableDemoWithSteps, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { SpaceTypes } from '@/types/space/SpaceDto';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function ViewClickableDemo({ params, space }: { params: { demoId: string[] }; space: SpaceWithIntegrationsFragment }) {
  const demoId = params.demoId[0];
  const [data, setData] = useState<ClickableDemoWithSteps>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios.get(`${getBaseUrl()}/api/${space.id}/clickable-demos/${demoId}`, {
        params: {
          spaceId: space.id,
          demoId,
        },
      });

      console.log('response.data: ', response.data);
      setData(response.data);
      setLoading(false);
    }
    fetchData();
  }, [demoId, space.id]);

  const router = useRouter();

  if (loading) {
    return <FullPageLoader />;
  }

  if (data) {
    return (
      <ClickableDemoModal
        clickableDemoWithSteps={data}
        space={space}
        onClose={() => {
          router.push(`${space.type === SpaceTypes.TidbitsSite ? '/' : '/clickable-demos'}`);
        }}
      />
    );
  }
  return null;
}

export default withSpace(ViewClickableDemo);
