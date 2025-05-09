import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CourseInformation from './CourseInformation';
import { Metadata } from 'next';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { CourseDetailsFragment } from '@/graphql/generated/generated-types';
import axios from 'axios';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

type CourseViewProps = {
  params: Promise<{ courseInfo: string[] }>;
};

export async function generateMetadata(args: CourseViewProps): Promise<Metadata> {
  const params = await args.params;
  const courseInfo = params.courseInfo;
  const courseKey = Array.isArray(courseInfo) ? courseInfo[0] : (courseInfo as string);

  const isCourseSubmissionScreen = Array.isArray(courseInfo) && courseInfo.length > 1 && courseInfo[1] === 'submission';
  const topicKey = Array.isArray(courseInfo) && courseInfo.length > 1 && !isCourseSubmissionScreen ? courseInfo[1] : undefined;
  const itemType = Array.isArray(courseInfo) && courseInfo.length > 2 ? courseInfo[2] : undefined;
  const itemKey = Array.isArray(courseInfo) && courseInfo.length > 3 ? courseInfo[3] : undefined;
  const space = (await getSpaceServerSide())!;
  const response = await axios.get(`${getBaseUrl()}/api/courses/${courseKey}`);
  const course: CourseDetailsFragment = response.data.course;
  let description = `\n\n${course.title}\n\n${course.details}`;
  let keywords = [course.title];
  if (topicKey !== undefined) {
    const topic = course.topics.find((t) => t.key === topicKey);
    if (topic) {
      description += `\n\nTopic: ${topic.title}\nDetails: ${topic.details}`;
      keywords.push(topic.title);
    }
  }
  if (itemType !== undefined) {
    const topic = course.topics.find((t) => t.key === topicKey);
    if (topic) {
      switch (itemType) {
        case 'readings':
          const currentReading = topic.readings.find((r) => r.uuid == itemKey);
          description = `\n\n${currentReading?.title}\n\n${currentReading?.details}`;
          keywords.push(currentReading?.title!);
          break;
        case 'summaries':
          const currentSummary = topic.summaries.find((s) => s.key == itemKey);
          description = `\n\n${currentSummary?.title}\n\n${currentSummary?.details}`;
          keywords.push(currentSummary?.title!);
          break;
        case 'explanations':
          const currentExplanation = topic.explanations.find((s) => s.key == itemKey);
          description = `\n\n${currentExplanation?.title}\n\n${currentExplanation?.details}`;
          keywords.push(currentExplanation?.title!);
          break;
        default:
          break;
      }
    }
  }
  return {
    title: course.title,
    description: description,
    keywords: keywords,
  };
}

const CourseView = async (props: CourseViewProps) => {
  const params = await props.params;
  const courseInfo = params.courseInfo;
  const space = (await getSpaceServerSide())!;
  return (
    <PageWrapper>
      <CourseInformation courseInfo={courseInfo} space={space} />
    </PageWrapper>
  );
};

export default CourseView;
