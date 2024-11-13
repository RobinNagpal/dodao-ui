import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { CourseSubmissionHelper, TopicItemStatus } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { CourseDetailsFragment, Space } from '@/graphql/generated/generated-types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';
import EvaluationReview from './EvaluationReview';

// Styled Components
const Right = styled.div`
  min-height: 300px;
`;

const Checkmark = styled.span`
  margin: auto;
  display: block;
  width: 14px;
  height: 10px;
  border-top: 3px solid #00813a;
  border-right: 3px solid #00813a;
  transform: rotate(135deg);
`;

const Icon = styled.div`
  text-align: center;
  width: 30px;
  font-size: 0.5rem;
`;

interface TopicComponentProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: SpaceWithIntegrationsDto;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
}

const TopicComponent: FunctionComponent<TopicComponentProps> = (props) => {
  const { data: session } = useSession();
  const { setShowLoginModal } = useLoginModalContext();

  const { space, course, isCourseAdmin, topicKey, courseHelper, submissionHelper } = props;

  // Your notify function needs to be implemented or provided as props.
  const notify = (message: any) => console.error(message);

  const topic = courseHelper.getTopic(topicKey);
  const topicSubmission = submissionHelper.getTopicSubmission(topicKey);

  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState<boolean>(false);
  const [showSubmissionWarning, setShowSubmissionWarning] = useState<boolean>(false);
  const [isTopicEmpty, setIsTopicEmpty] = useState<boolean>(false);

  useEffect(() => {
    setIsAlreadySubmitted(!!(topic?.key && submissionHelper.isTopicSubmissionInSubmittedStatus(topic?.key)));
    setShowSubmissionWarning(!!topic && !submissionHelper.isAllEvaluationsComplete(topic!));
    setIsTopicEmpty(!topic?.readings?.length && !topic?.explanations?.length && !topic?.summaries?.length && !topic?.questions?.length);
  }, [course, topicKey, submissionHelper, topic]);

  const handleSubmit = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    try {
      await submissionHelper.submitCourseTopic(topicKey);
    } catch (e) {
      console.log(e);
      notify(['red', e]);
    }
  };

  // ...

  // The actual JSX
  return (
    <div>
      <Right className="flex">
        <div className="right">
          <h1 className="text-3xl mb-4">Submit Topic Title</h1>

          {topic?.readings?.length > 0 && (
            <>
              <div className="text-xl">Videos</div>
              {topic.readings.map((reading) => (
                <Link className="text-skin-text" href={`/courses/view/${course.key}/${topic.key}/readings/${reading.uuid}`} key={reading.uuid}>
                  <span className="mt-1 flex items-center">
                    <Icon>{topicSubmission?.readings?.[reading.uuid]?.status === TopicItemStatus.Completed ? <Checkmark /> : <span>&#9679;</span>}</Icon>
                    <span>{reading.shortTitle}</span>
                  </span>
                </Link>
              ))}
            </>
          )}
          {topic?.explanations?.length > 0 && (
            <>
              <div className="text-xl">Explanations</div>
              {topic.explanations.map((explanation) => (
                <Link className="text-skin-text" href={`/courses/view/${course.key}/${topic.key}/explanations/${explanation.key}`} key={explanation.key}>
                  <span className="mt-1 flex items-center">
                    <Icon>{topicSubmission?.readings?.[explanation.key]?.status === TopicItemStatus.Completed ? <Checkmark /> : <span>&#9679;</span>}</Icon>
                    <span>{explanation.shortTitle}</span>
                  </span>
                </Link>
              ))}
            </>
          )}
          {topic?.summaries?.length > 0 && (
            <>
              <div className="text-xl">Summaries</div>
              {topic.summaries.map((summary) => (
                <Link className="text-skin-text" href={`/courses/view/${course.key}/${topic.key}/summaries/${summary.key}`} key={summary.key}>
                  <span className="mt-1 flex items-center">
                    <Icon>{topicSubmission?.readings?.[summary.key]?.status === TopicItemStatus.Completed ? <Checkmark /> : <span>&#9679;</span>}</Icon>
                    <span>{summary.shortTitle}</span>
                  </span>
                </Link>
              ))}
            </>
          )}
          {topic?.questions?.length > 0 && (
            <EvaluationReview
              course={course}
              isCourseAdmin={isCourseAdmin}
              space={space}
              topicKey={topicKey}
              courseHelper={courseHelper}
              submissionHelper={submissionHelper}
            />
          )}

          {/* ... Similar code for explanations, summaries and questions ... */}

          {showSubmissionWarning && (
            <div className="float-left mb-2 text-red-500 mt-4">
              <i className="iconfont iconwarning"></i>
              <span className="ml-1">Answer all the questions to submit the chapter</span>
            </div>
          )}
          {isTopicEmpty && <div className="float-left mb-2 text-red-500 mt-4">No contents are yet present in this chapter</div>}
        </div>
      </Right>
      {!isTopicEmpty && (
        <div className="flex justify-between mt-4">
          <div className="flex-1"></div>
          <Button disabled={showSubmissionWarning || isAlreadySubmitted} onClick={handleSubmit} variant="contained" primary>
            Submit Topic
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopicComponent;
