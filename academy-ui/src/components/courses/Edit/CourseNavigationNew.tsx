import Button from '@dodao/web-core/components/core/buttons/Button';
import AddIcon from '@dodao/web-core/components/core/icons/AddIcon';
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
import CheckIcon from '@heroicons/react/24/solid/CheckIcon';
import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

const StyledCheckCircleIcon = styled(CheckIcon)`
  background-color: var(--primary-color);
  border-radius: 50%;

  border: 4px solid var(--primary-color);
  color: white;
  font-weight: bold;
`;

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
                <StyledCheckCircleIcon className="h-5 w-5" aria-hidden="true" />
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
                <StyledCheckCircleIcon className="h-5 w-5" aria-hidden="true" />
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

      {course.topics.map((chapter) => {
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
              {topicSubmission?.status === TopicStatus.Submitted && <CheckIcon className="ml-1 h-5 w-5 text-green-500" aria-hidden="true" />}
            </Link>
            {topicKey === chapter.key && (
              <>
                <>{getReadings(course.key, submissionHelper, chapter, chapter.readings, itemKey || '')}</>
                <>{getExplanations(course.key, submissionHelper, chapter, chapter.explanations, itemKey || '')}</>
                {chapter.questions.length > 0 && (
                  <li key={chapter.key + '_questions'} className="relative flex gap-x-4">
                    <Link
                      className={`flex items-center ${itemType === 'questions' ? 'underline' : ''}`}
                      href={`/courses/view/${course.key}/${chapter.key}/questions/0`}
                    >
                      <div className={'-bottom-6 absolute left-0 top-0 flex w-6 justify-center'}>
                        <div className="w-px bg-gray-200" />
                      </div>
                      <>
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center">
                          {allQuestionsComplete ? (
                            <StyledCheckCircleIcon className="h-5 w-5" aria-hidden="true" />
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
                <li key={chapter.key + '_submission'} className="relative flex gap-x-4">
                  <Link
                    className={`flex items-center ${itemType === 'submission' ? 'underline' : ''}`}
                    href={`/courses/view/${course.key}/${chapter.key}/submission`}
                  >
                    <div className={classNames('h-6', 'absolute left-0 top-0 flex w-6 justify-center')}>
                      <div className="w-px bg-gray-200" />
                    </div>
                    <>
                      <div className="relative flex h-6 w-6 flex-none items-center justify-center">
                        {topicSubmission?.status === TopicStatus.Submitted ? (
                          <StyledCheckCircleIcon className="h-5 w-5" aria-hidden="true" />
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
