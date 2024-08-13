'use client';

import withSpace from '@/contexts/withSpace';
import Block from '@dodao/web-core/components/app/Block';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import RowLoading from '@dodao/web-core/components/core/loaders/RowLoading';
import TimelineDetails from '@/components/timelines/View/TimelineDetailView';
import { SpaceWithIntegrationsFragment, TimelineDetailsFragment } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const TimelineInformation = ({ timelineId, space }: { timelineId: string; space: SpaceWithIntegrationsFragment }) => {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const router = useRouter();
  const [data, setData] = useState<{ timeline?: TimelineDetailsFragment }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get(`${getBaseUrl()}/api/timelines/${timelineId}`);
      setData(data);
      setLoading(false);
    }
    fetchData();
  }, [timelineId]);

  return (
    <div className="pt-12">
      <div className="lg:px-6 py-4">
        {data?.timeline && !loading ? (
          <>
            <div className="px-4 md:px-0 mb-5 flex justify-between">
              <Link href="/timelines" className="text-color">
                <span className="mr-1 font-bold">&#8592;</span>
                All Timelines
              </Link>
              <div className="ml-3">
                <PrivateEllipsisDropdown
                  items={threeDotItems}
                  onSelect={(key) => {
                    router.push(`/timelines/edit/${timelineId}`);
                  }}
                />
              </div>
            </div>

            <div>{loading ? <FullPageLoader /> : <TimelineDetails timeline={data?.timeline} space={space} />}</div>
          </>
        ) : (
          <Block slim>
            <RowLoading className="my-2" />
          </Block>
        )}
      </div>
    </div>
  );
};

export default withSpace(TimelineInformation);
