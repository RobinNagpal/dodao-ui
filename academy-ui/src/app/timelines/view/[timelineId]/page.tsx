import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TimelineInformation from './TimelineInformation';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { Metadata } from 'next';
import axios from 'axios';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

type TimelinePageProps = {
  params: Promise<{ timelineId: string }>;
};

export async function generateMetadata({ params }: TimelinePageProps): Promise<Metadata> {
  const timelineKey = (await params).timelineId;
  const space = (await getSpaceServerSide())!;
  const response = await axios.get(`${getBaseUrl()}/api/timelines/${timelineKey}`);
  const timeline = response.data.timeline;
  return {
    title: timeline.name,
    description: timeline.excerpt,
    keywords: [],
  };
}

const TimelinePage = async ({ params }: TimelinePageProps) => {
  const timelineKey = (await params).timelineId;
  const space = (await getSpaceServerSide())!;
  return (
    <PageWrapper>
      <TimelineInformation timelineId={timelineKey} space={space} />
    </PageWrapper>
  );
};

export default TimelinePage;
