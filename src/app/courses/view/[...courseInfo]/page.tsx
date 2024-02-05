import PageWrapper from '@/components/core/page/PageWrapper';
import CourseInformation from './CourseInformation';
import { Metadata } from 'next';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import getApiResponse from '@/utils/api/getApiResponse';
import { CourseDetailsFragment } from '@/graphql/generated/generated-types';

type CourseViewProps = {
  params: { courseInfo: string[] };
};

export async function generateMetadata({ params }: CourseViewProps): Promise<Metadata> {
  const courseInfo = params.courseInfo;
  const courseKey = Array.isArray(courseInfo) ? courseInfo[0] : (courseInfo as string);

  const isCourseSubmissionScreen = Array.isArray(courseInfo) && courseInfo.length > 1 && courseInfo[1] === 'submission';
  const topicKey = Array.isArray(courseInfo) && courseInfo.length > 1 && !isCourseSubmissionScreen ? courseInfo[1] : undefined;
  const itemType = Array.isArray(courseInfo) && courseInfo.length > 2 ? courseInfo[2] : undefined;
  const itemKey = Array.isArray(courseInfo) && courseInfo.length > 3 ? courseInfo[3] : undefined;
  const space = (await getSpaceServerSide())!;
  const course = await getApiResponse<CourseDetailsFragment>(space, `courses/${courseKey}`);
  let description = `\n\n${course.title}\n\n${course.details}`;
  if (topicKey !== undefined) {
    const topic = course.topics.find((t) => t.key === topicKey);
    if (topic) {
      description += `\n\nTopic: ${topic.title}\nDetails: ${topic.details}`;
    }
  }
  if (itemType !== undefined) {
    const topic = course.topics.find((t) => t.key === topicKey);
    if (topic) {
      switch (itemType) {
        case 'readings':
          const currentReading = topic.readings.find((r) => r.uuid == itemKey);
          description += `\n\n${currentReading?.title}\n\n${currentReading?.details}`;
          break;
        case 'summaries':
          const currentSummary = topic.summaries.find((s) => s.key == itemKey);
          description += `\n\n${currentSummary?.title}\n\n${currentSummary?.details}`;
          break;
        default:
          break;
      }
    }
  }
  return {
    title: course.title,
    description: description,
    keywords: [],
  };
}

const CourseView = async (props: CourseViewProps) => {
  return (
    <PageWrapper>
      <CourseInformation courseInfo={props.params.courseInfo} />
    </PageWrapper>
  );
};

export default CourseView;
