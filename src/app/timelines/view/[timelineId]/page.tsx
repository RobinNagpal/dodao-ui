'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import RowLoading from '@/components/core/loaders/RowLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import TimelineDetails from '@/components/timelines/View/TimelineDetails';
import { SpaceWithIntegrationsFragment, useTimelineDetailsQuery } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TimelinePage = ({ params, space }: { params: { timelineId: string }; space: SpaceWithIntegrationsFragment }) => {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const router = useRouter();
  const { data, loading } = useTimelineDetailsQuery({ variables: { timelineId: params.timelineId, spaceId: space.id } });
  const renderer = getMarkedRenderer();
  const contents = data?.timeline?.content && marked.parse(data?.timeline?.content, { renderer });
  return (
    <PageWrapper>
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
                      router.push(`/timelines/edit/${params.timelineId}`);
                    }}
                  />
                </div>
              </div>

              <div className="max-w-xl mx-auto">
                <div className="text-center ">
                  <div className="relative flex flex-col items-center">
                    <h1 className="text-6xl font-bold leading-tight"> {data?.timeline?.name}
                    </h1>
                    <div className="flex w-24 mt-1 mb-10 overflow-hidden rounded">
                      <div className="flex-1 h-2 bg-blue-200">
                      </div>
                      <div className="flex-1 h-2 bg-blue-400">
                      </div>
                      <div className="flex-1 h-2 bg-blue-600">
                      </div>
                    </div>
                  </div>
                  <p className="text-base text-center">
                    {data?.timeline?.excerpt}
                  </p>
                  <p className="text-sm text-center" dangerouslySetInnerHTML={{ __html: contents || '' }}></p>
                </div>
              </div>
              <div className="px-2">{!loading && <TimelineDetails timeline={data?.timeline} space={space} />}</div>
            </>
          ) : (
            <Block slim>
              <RowLoading className="my-2" />
            </Block>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default withSpace(TimelinePage);
