import ChapterSubmission from '@/components/courses/View/Details/ChapterSubmission';
import CourseDetails from '@/components/courses/View/Details/CourseDetails';
import ExplanationDetails from '@/components/courses/View/Details/ExplanationDetails';
import QuestionDetails from '@/components/courses/View/Details/QuestionDetails';
import SummaryDetails from '@/components/courses/View/Details/SummaryDetails';
import TopicDetails from '@/components/courses/View/Details/TopicDetails';
import VideoDetails from '@/components/courses/View/Details/VideoDetails';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { CourseDetailsFragment, Space } from '@/graphql/generated/generated-types';

export type ItemTypes = 'readings' | 'summaries' | 'explanations' | 'questions' | 'submission';
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
    return (
      <VideoDetails
        space={props.space}
        course={props.course}
        isCourseAdmin={props.isCourseAdmin}
        courseHelper={props.courseHelper}
        submissionHelper={props.submissionHelper}
        topicKey={props.topicKey}
        videoUuid={props.itemKey}
      />
    );
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
    return (
      <ExplanationDetails
        space={props.space}
        course={props.course}
        isCourseAdmin={props.isCourseAdmin}
        courseHelper={props.courseHelper}
        submissionHelper={props.submissionHelper}
        topicKey={props.topicKey}
        explanationKey={props.itemKey}
      />
    );
  } else if (props.itemType === 'questions' && props.topicKey && props.itemKey) {
    return (
      <QuestionDetails
        space={props.space}
        course={props.course}
        isCourseAdmin={props.isCourseAdmin}
        topicKey={props.topicKey}
        courseHelper={props.courseHelper}
        submissionHelper={props.submissionHelper}
        questionIndex={props.itemKey}
      />
    );
  } else if (props.itemType === 'submission' && props.topicKey) {
    return (
      <ChapterSubmission
        space={props.space}
        course={props.course}
        isCourseAdmin={props.isCourseAdmin}
        topicKey={props.topicKey}
        courseHelper={props.courseHelper}
        submissionHelper={props.submissionHelper}
      />
    );
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
