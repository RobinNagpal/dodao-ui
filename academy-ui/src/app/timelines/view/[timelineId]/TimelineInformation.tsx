'use client';

import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import TimelineDetails from '@/components/timelines/View/TimelineDetailView';
import { TimelineDetailsFragment } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Block from '@dodao/web-core/components/app/Block';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import RowLoading from '@dodao/web-core/components/core/loaders/RowLoading';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const TimelineInformation = ({ timelineId, space }: { timelineId: string; space: SpaceWithIntegrationsDto }) => {
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

export default TimelineInformation;
