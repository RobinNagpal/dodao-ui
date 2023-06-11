import { CourseQuestionSubmission, CourseSubmissionHelper, QuestionStatus } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { CourseDetailsFragment, Space, TopicCorrectAnswersFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import styled from 'styled-components';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';

interface IProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: Space;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
}

const TickMark = styled.span`
  content: '';
  left: 16px;
  top: 6px;
  width: 8px;
  height: 14px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  position: absolute;
`;

const QuestionNavItem: React.FC<{ className?: string } & PropsWithChildren> = styled.div`
  width: 40px;

  .indicator {
    height: 30px;
    border-radius: 8%;
    position: relative;
  }
`;

function EvaluationComponent({ course, courseHelper, topicKey, submissionHelper }: IProps) {
  const topic = courseHelper.getTopic(topicKey);
  const [isTopicSubmitted, setIsTopicSubmitted] = useState<boolean>(false);
  const [questionsSubmissions, setQuestionsSubmissions] = useState<Record<string, CourseQuestionSubmission> | undefined>();
  const [correctAnswersOfTopic, setCorrectAnswersOfTopic] = useState<Record<string, TopicCorrectAnswersFragment> | undefined>();

  useEffect(() => {
    setIsTopicSubmitted(submissionHelper.isTopicSubmissionInSubmittedStatus(topicKey));
    setQuestionsSubmissions(submissionHelper.courseSubmission?.topicSubmissionsMap?.[topicKey]?.questions);
    setCorrectAnswersOfTopic(submissionHelper.courseSubmission?.topicSubmissionsMap?.[topicKey]?.correctAnswers);
  }, [course, topicKey, submissionHelper]);

  const getQuestionClass = (question: any) => {
    if (isTopicSubmitted) {
      const questionRes: CourseQuestionSubmission | undefined = questionsSubmissions?.[question.uuid];
      const correctAnswers: TopicCorrectAnswersFragment | undefined = correctAnswersOfTopic?.[question.uuid];

      if (questionRes?.answers.length && correctAnswers?.answerKeys?.length) {
        const sortedResponse = sortBy(questionRes.answers, (answer) => answer.toLowerCase());
        const sortedCorrectAnswers = sortBy(correctAnswers.answerKeys, (answer) => answer.toLowerCase());
        if (isEqual(sortedResponse, sortedCorrectAnswers)) {
          return 'completed';
        }
      }
      return 'error';
    } else {
      const questionRes: CourseQuestionSubmission | undefined = questionsSubmissions?.[question.uuid];
      if (questionRes?.status === QuestionStatus.Completed && questionRes?.answers?.length > 0) {
        return 'completed';
      } else if (questionRes?.status === QuestionStatus.Skipped) {
        return 'skipped';
      }
      return 'error';
    }
  };

  return (
    <div className="flex flex-wrap">
      {topic?.questions?.map((question: any, index: number) => (
        <Link className="mx-2 my-2" href={`/courses/view/${course.key}/${topicKey}/questions/${index}`} key={index}>
          <QuestionNavItem
            className={`question-nav-item ${getQuestionClass(question)} ${
              getQuestionClass(question) === 'completed' && isTopicSubmitted ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <div className="bg-skin-header-bg text-center py-1">{index + 1}</div>
            <div className="indicator">{getQuestionClass(question) === 'completed' && isTopicSubmitted && <TickMark className="tick-mark" />}</div>
          </QuestionNavItem>
        </Link>
      ))}
    </div>
  );
}

export default EvaluationComponent;
