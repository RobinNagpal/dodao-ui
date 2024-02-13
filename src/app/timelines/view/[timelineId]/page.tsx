import PageWrapper from '@/components/core/page/PageWrapper';
import TimelineInformation from './TimelineInformation';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import getApiResponse from '@/utils/api/getApiResponse';
import { TimelineDetailsFragment } from '@/graphql/generated/generated-types';
import { Metadata } from 'next';

type TimelinePageProps = {
  params: { timelineId: string };
};

export async function generateMetadata(props: TimelinePageProps): Promise<Metadata> {
  const timelineKey = props.params.timelineId;
  const space = (await getSpaceServerSide())!;
  const timeline = await getApiResponse<TimelineDetailsFragment>(space, `timelines/${timelineKey}`);
  return {
    title: timeline.name,
    description: timeline.excerpt,
    keywords: [],
  };
}

const TimelinePage = async (props: TimelinePageProps) => {
  return (
    <PageWrapper>
      <TimelineInformation timelineId={props.params.timelineId} />
    </PageWrapper>
  );
};

export default TimelinePage;
