import CourseDetails from '@/components/courses/View/Details/CourseDetails';
import SummaryDetails from '@/components/courses/View/Details/SummaryDetails';
import TopicDetails from '@/components/courses/View/Details/TopicDetails';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { CourseDetailsFragment, Space } from '@/graphql/generated/generated-types';

export type ItemTypes = 'readings' | 'summaries' | 'explanations' | 'questions';
interface CourseDetailsRightSectionProps {
  space: Space;
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;

  topicKey?: string;
  itemType?: ItemTypes;
  itemKey?: string;
}

export default function CourseDetailsRightSection(props: CourseDetailsRightSectionProps) {
  if (props.itemType === 'readings' && props.topicKey && props.itemKey) {
    return <div>Readings</div>;
  } else if (props.itemType === 'summaries' && props.topicKey && props.itemKey) {
    return (
      <SummaryDetails
        space={props.space}
        course={props.course}
        isCourseAdmin={props.isCourseAdmin}
        courseHelper={props.courseHelper}
        submissionHelper={props.submissionHelper}
        topicKey={props.topicKey}
        summaryKey={props.itemKey}
      />
    );
  } else if (props.itemType === 'explanations' && props.topicKey && props.itemKey) {
    return <div>Explanations</div>;
  } else if (props.itemType === 'questions' && props.topicKey && props.itemKey) {
    return <div>Questions</div>;
  } else if (props.topicKey) {
    return (
      <TopicDetails
        space={props.space}
        course={props.course}
        isCourseAdmin={props.isCourseAdmin}
        courseHelper={props.courseHelper}
        submissionHelper={props.submissionHelper}
        topicKey={props.topicKey}
      />
    );
  } else {
    return (
      <CourseDetails
        space={props.space}
        course={props.course}
        isCourseAdmin={props.isCourseAdmin}
        courseHelper={props.courseHelper}
        submissionHelper={props.submissionHelper}
      />
    );
  }
}
