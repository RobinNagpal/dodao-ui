import Button from '@/components/core/buttons/Button';
import WarningWithAccentBorder from '@/components/core/warnings/WarningWithAccentBorder';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { CourseDetailsFragment, CourseTopicFragment, Space } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { CourseStatus } from '@/types/deprecated/models/course/GitCourseTopicSubmission';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { CourseSubmissionHelper, QuestionStatus, TopicStatus } from '../useCourseSubmission';

const ScoreDiv = styled.div<{ status: 'unattempted' | 'inprogress' | 'correct' | 'submitted' | 'incorrect' }>`
  width: 40px;
  height: 40px;
  color: white;
  text-align: center;
  line-height: 40px;
  border-radius: 50%;
  margin-right: 0.5rem;

  ${({ status }) => {
    switch (status) {
      case 'incorrect':
        return 'background-color: red';
      case 'unattempted':
        return 'color: white; background-color: orange';
      case 'inprogress':
        return 'color: white; background-color: orange';
      case 'correct':
        return 'background-color: green';
      case 'submitted':
        return 'color: white; background-color: var(--primary-color)';
      default:
        return '';
    }
  }}
`;

interface CourseViewProps {
  course: CourseDetailsFragment;
  submissionHelper: CourseSubmissionHelper;
}

function getSubmissionStatus(submissionHelper: CourseSubmissionHelper, topic: CourseTopicFragment) {
  return submissionHelper.getTopicSubmission(topic.key)?.status === TopicStatus.InProgress ? <div>In Progress</div> : <div>Not Started</div>;
}

export default function CourseSubmission(props: CourseViewProps) {
  const { course, submissionHelper } = props;
  const { $t: t } = useI18();
  const { data: session } = useSession();
  const courseSubmission = submissionHelper.courseSubmission;
  const { setShowLoginModal } = useLoginModalContext();

  const topicProgress = useMemo(() => {
    const map: Record<string, { status: TopicStatus; answeredQuestions?: number }> = {};
    for (let i = 0; i < course.topics.length; i++) {
      const topic = course.topics[i];
      const topicSubmissionValue = courseSubmission?.topicSubmissionsMap?.[topic.key];
      const topicQuestions = topicSubmissionValue?.questions || {};
      const answeredQuestions = Object.keys(topicQuestions).filter(
        (key) => topicQuestions[key].status === QuestionStatus.Completed && topicQuestions[key].answers.length > 0,
      ).length;
      if (!topicSubmissionValue) {
        map[topic.key] = {
          answeredQuestions,
          status: TopicStatus.UnAttempted,
        };
      } else {
        map[topic.key] = {
          answeredQuestions,
          status: topicSubmissionValue && submissionHelper.isTopicSubmissionInSubmittedStatus(topic.key) ? TopicStatus.Completed : TopicStatus.InProgress,
        };
      }
    }

    return map;
  }, [courseSubmission, course, submissionHelper]);

  const handleSubmit = async () => {
    if (!session) {
      setShowLoginModal(true);
    }
    try {
      await submissionHelper.submitCourse();
    } catch (e) {
      console.error(e);
      // notify(['red', e]);
    }
  };

  const showSubmissionWarning =
    !!courseSubmission &&
    !Object.values(courseSubmission.topicSubmissionsMap || {}).every(
      //  has no questions or is submitted
      (ts) => !submissionHelper.getTopic(ts.topicKey).questions?.length || ts.status === TopicStatus.Submitted,
    );
  // Translate the Vue template into JSX here

  return (
    <div>
      <div className="flex">
        <div className="right">
          <h1 className="text-3xl mb-4">{t('courses.view.courseSubmission')}</h1>
          <div className="mb-4">
            <div className="grid-cols-2 grid font-bold">
              <div>Score</div>
              <div>Chapter</div>
            </div>
          </div>

          {course.topics.map((topic) => (
            <Link href={`/courses/view/${course.key}/${topic.key}`} key={topic.key}>
              <div className="mb-2">
                <div className="grid-cols-2 grid">
                  {submissionHelper.isTopicSubmissionInSubmittedStatus(topic.key) ? (
                    <div className="flex">
                      <ScoreDiv className="h-6 w-6 icon" status={'correct'}>
                        {submissionHelper.correctAndWrongAnswerCounts(topic.key).correctAnswers}
                      </ScoreDiv>
                      <ScoreDiv className="h-6 w-6 icon" status={'incorrect'}>
                        {submissionHelper.correctAndWrongAnswerCounts(topic.key).wrongAnswers}
                      </ScoreDiv>
                    </div>
                  ) : (
                    getSubmissionStatus(submissionHelper, topic)
                  )}

                  <div className="font-medium flex flex-col justify-center">
                    <span> {topic.title} </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div>
          {courseSubmission?.status === CourseStatus.Submitted && courseSubmission.questionsCorrect && (
            <div className="w-full">
              {courseSubmission.questionsCorrect >= (course.coursePassCount || 0) ? (
                <div>
                  {course.coursePassContent && <div>{course.coursePassContent}</div>}
                  <div>Congrats! You have passed the course.</div>
                </div>
              ) : (
                <div>
                  {course.courseFailContent && <div>{course.courseFailContent}</div>}
                  <div>
                    You got {courseSubmission?.questionsCorrect} correct and its less than the passing score of
                    {course.coursePassCount}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <div>
          <WarningWithAccentBorder warning={'Submit all the chapters to be able to submit the course'} className="my-4" />
          <div className="flex flex-between mt-4 flex-1 items-end p-2">
            <div className="flex-1"></div>

            <div className="mt-4">
              {props.submissionHelper.courseSubmission?.status !== CourseStatus.Submitted && (
                <div className="flex flex-between mt-4 flex-1 items-end p-2">
                  <div className="flex-1"></div>
                  <Button disabled={showSubmissionWarning} onClick={handleSubmit} variant="contained" primary>
                    {t('courses.view.courseSubmission')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
