import PageWrapper from '@/components/core/page/PageWrapper';
import CourseInformation from './CourseInformation';
import { Metadata } from 'next';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import getApiResponse from '@/utils/api/getApiResponse';
import { CourseDetailsFragment, CourseFragment } from '@/graphql/generated/generated-types';

type CourseViewProps = {
  params: { courseInfo: string[] };
};

export async function generateMetadata({ params }: CourseViewProps): Promise<Metadata> {
  const courseInfo = params.courseInfo;
  const courseKey = Array.isArray(courseInfo) ? courseInfo[0] : (courseInfo as string);
  const space = (await getSpaceServerSide())!;
  const course = await getApiResponse<CourseDetailsFragment>(space, `courses/${courseKey}`);
  return {
    title: course.title,
    description: course.summary,
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
