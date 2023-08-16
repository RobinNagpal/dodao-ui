import Button from '@/components/core/buttons/Button';
import AddIcon from '@/components/core/icons/AddIcon';
import { ItemTypes } from '@/components/courses/View/CourseDetailsRightSection';
import { CourseSubmissionHelper, QuestionStatus, TopicItemStatus, TopicStatus } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import {
  CourseDetailsFragment,
  CourseExplanationFragment,
  CourseReadingFragment,
  CourseSummaryFragment,
  CourseTopicFragment,
  Space,
} from '@/graphql/generated/generated-types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Link from 'next/link';
import React, { Fragment } from 'react';
import styled from 'styled-components';

function getReadings(
  courseKey: string,
  submissionHelper: CourseSubmissionHelper,
  topic: CourseTopicFragment,
  readings: CourseReadingFragment[],
  itemKey: string
) {
  return readings.map((reading, i) => {
    const isActive = itemKey === reading.uuid;

    const isComplete = submissionHelper.getTopicSubmission(topic.key)?.readings?.[reading.uuid]?.status === TopicItemStatus.Completed;

    return (
      <li key={reading.uuid} className="relative flex gap-x-4">
        <Link key={reading.uuid} className={`flex ${isActive ? 'underline' : ''}`} href={`/courses/view/${courseKey}/${topic.key}/readings/${reading.uuid}`}>
          <div className={classNames('-bottom-6', 'absolute left-0 top-0 flex w-6 justify-center')}>
            <div className="w-px bg-gray-200" />
          </div>
          <>
            <div className="relative flex h-6 w-6 flex-none items-center justify-center">
              {isComplete ? (
                <StyledCheckCircleIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              )}
            </div>
            <p className="ml-2 flex-auto py-0.5 text-xs leading-5">
              <span className={`font-medium`}>{reading.title}</span>
            </p>
          </>
        </Link>
      </li>
    );
  });
}

function getExplanations(
  courseKey: string,
  submissionHelper: CourseSubmissionHelper,
  topic: CourseTopicFragment,
  explanations: CourseExplanationFragment[],
  itemKey: string
) {
  return explanations.map((explanation, i) => {
    const isActive = itemKey === explanation.key;
    const isComplete = submissionHelper.getTopicSubmission(topic.key)?.explanations?.[explanation.key]?.status === TopicItemStatus.Completed;
    return (
      <li key={explanation.key} className="relative flex gap-x-4">
        <Link
          key={explanation.key}
          className={`flex ${isActive ? 'underline' : ''}`}
          href={`/courses/view/${courseKey}/${topic.key}/explanations/${explanation.key}`}
        >
          <div className={classNames('-bottom-6', 'absolute left-0 top-0 flex w-6 justify-center')}>
            <div className="w-px bg-gray-200" />
          </div>
          <>
            <div className="relative flex h-6 w-6 flex-none items-center justify-center">
              {isComplete ? (
                <StyledCheckCircleIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              )}
            </div>
            <p className="ml-2 flex-auto py-0.5 text-xs leading-5">
              <span className={`font-medium ${isActive ? 'underline' : ''}`}>{explanation.title}</span>
            </p>
          </>
        </Link>
      </li>
    );
  });
}

function getSummaries(
  courseKey: string,
  submissionHelper: CourseSubmissionHelper,
  topic: CourseTopicFragment,
  summaries: CourseSummaryFragment[],
  itemKey: string
) {
  return summaries.map((summary, i) => {
    const isActive = itemKey === summary.key;
    const isComplete = submissionHelper.getTopicSubmission(topic.key)?.summaries?.[summary.key]?.status === TopicItemStatus.Completed;
    return (
      <li key={summary.key} className="relative flex gap-x-4">
        <Link key={summary.key} className={`flex ${isActive ? 'underline' : ''}`} href={`/courses/view/${courseKey}/${topic.key}/summaries/${summary.key}`}>
          <div className={classNames('-bottom-6', 'absolute left-0 top-0 flex w-6 justify-center')}>
            <div className="w-px bg-gray-200" />
          </div>
          <>
            <div className="relative flex h-6 w-6 flex-none items-center justify-center">
              {isComplete ? (
                <StyledCheckCircleIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              )}
            </div>
            <p className="ml-2 flex-auto py-0.5 text-xs leading-5">
              <span className={`font-medium ${isActive ? 'underline' : ''}`}>{summary.title}</span>
            </p>
          </>
        </Link>
      </li>
    );
  });
}
interface CourseNavigationProps {
  course: CourseDetailsFragment;
  space: Space;
  showAddModal: () => void;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
  isCourseSubmissionScreen: boolean;
  topicKey?: string;
  itemType?: ItemTypes;
  itemKey?: string;
  isCourseAdmin: boolean;
}

const StyledCheckCircleIcon = styled(CheckCircleIcon)`
  background-color: white;
  border-radius: 50%;
  border: 0;
  color: var(--primary-color);
`;
export default function CourseNavigationNew({
  course,
  showAddModal,
  topicKey,
  itemKey,
  itemType,
  submissionHelper,
  isCourseSubmissionScreen,
  isCourseAdmin,
}: CourseNavigationProps) {
  return (
    <div className="p-4 bg-skin-header-bg rounded-l-lg border-skin-border h-full w-full text-sm">
      {isCourseAdmin && (
        <Button primary variant="contained" className="w-full mb-4" onClick={showAddModal}>
          <AddIcon /> Add
        </Button>
      )}

      {course.topics.map((chapter, topicIdx) => {
        const topicSubmission = submissionHelper.getTopicSubmission(chapter.key);
        const allQuestionsComplete =
          Object.keys(topicSubmission?.questions || {}).length === chapter.questions.length &&
          Object.values(topicSubmission?.questions || {}).every((r) => r.status === QuestionStatus.Completed);

        const isActive = itemKey === chapter.key;
        return (
          <ul key={chapter.key} role="list" className="space-y-2 w-full px-4">
            <Link
              key={chapter.key + '_chapter_root'}
              className={`pt-4 flex items-center ${isActive ? 'underline' : ''}`}
              href={`/courses/view/${course.key}/${chapter.key}`}
            >
              <div>{chapter.title}</div>
            </Link>
            {topicKey === chapter.key && (
              <>
                <>{getReadings(course.key, submissionHelper, chapter, chapter.readings, itemKey || '')}</>
                <>{getSummaries(course.key, submissionHelper, chapter, chapter.summaries, itemKey || '')}</>
                <>{getExplanations(course.key, submissionHelper, chapter, chapter.explanations, itemKey || '')}</>
                {chapter.questions.length > 0 && (
                  <li key={chapter.key + '_questions'} className="relative flex gap-x-4">
                    <Link
                      key={chapter.key + '_questions'}
                      className={`flex items-center ${itemType === 'questions' ? 'underline' : ''}`}
                      href={`/courses/view/${course.key}/${chapter.key}/questions/0`}
                    >
                      <div className={'-bottom-6 absolute left-0 top-0 flex w-6 justify-center'}>
                        <div className="w-px bg-gray-200" />
                      </div>
                      <>
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center">
                          {allQuestionsComplete ? (
                            <StyledCheckCircleIcon className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                          )}
                        </div>
                        <p className="ml-2 flex-auto py-0.5 text-xs leading-5">
                          <span className="font-medium">Questions</span>
                        </p>
                      </>
                    </Link>
                  </li>
                )}
                <li key={chapter.key + '_questions'} className="relative flex gap-x-4">
                  <Link
                    key={chapter.key + '_questions'}
                    className={`flex items-center ${itemType === 'submission' ? 'underline' : ''}`}
                    href={`/courses/view/${course.key}/${chapter.key}/submission`}
                  >
                    <div className={classNames('h-6', 'absolute left-0 top-0 flex w-6 justify-center')}>
                      <div className="w-px bg-gray-200" />
                    </div>
                    <>
                      <div className="relative flex h-6 w-6 flex-none items-center justify-center">
                        {topicSubmission?.status === TopicStatus.Submitted ? (
                          <StyledCheckCircleIcon className="h-6 w-6" aria-hidden="true" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                        )}
                      </div>
                      <p className="ml-2 flex-auto py-0.5 text-xs leading-5">
                        <span className="font-medium">Submission</span>
                      </p>
                    </>
                  </Link>
                </li>
              </>
            )}
          </ul>
        );
      })}
      <Link
        key={course.key + '_course_submission'}
        href={`/courses/view/${course.key}/submission`}
        className={`mt-4 ml-4 flex items-center ${isCourseSubmissionScreen ? 'underline' : ''}`}
      >
        <div>Course Submission</div>
      </Link>
    </div>
  );
}
