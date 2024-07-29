import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TimelineInformation from './TimelineInformation';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { Metadata } from 'next';
import axios from 'axios';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

type TimelinePageProps = {
  params: { timelineId: string };
};

export async function generateMetadata(props: TimelinePageProps): Promise<Metadata> {
  const timelineKey = props.params.timelineId;
  const space = (await getSpaceServerSide())!;
  const response = await axios.get(`${getBaseUrl()}/api/timelines/${timelineKey}`);
  const timeline = response.data.timeline;
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
