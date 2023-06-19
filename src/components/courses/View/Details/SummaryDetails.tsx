import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import Button from '@/components/core/buttons/Button';
import EditCourseSummary from '@/components/courses/Edit/Items/EditCourseSummary';
import { useDeleteCourseItem } from '@/components/courses/Edit/useDeleteCourseItem';
import { useEditCourseDetails } from '@/components/courses/Edit/useEditCourseDetails';
import { useMoveCourseItem } from '@/components/courses/Edit/useMoveCourseItem';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import {
  CourseDetailsFragment,
  CourseSummaryFragment,
  CourseTopicFragment,
  DeleteTopicSummaryInput,
  MoveTopicSummaryInput,
  Space,
  UpdateTopicSummaryInput,
} from '@/graphql/generated/generated-types';
import { MoveCourseItemDirection } from '@/types/deprecated/models/enums';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { sha1 } from '@noble/hashes/sha1';
import { marked } from 'marked';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-solidity';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-yaml';
import React, { FC } from 'react';
import styled from 'styled-components';

const RightDiv = styled.div`
  min-height: 300px;
`;

interface CourseSummaryProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: Space;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;

  summaryKey: string;
}

function NextButton(props: {
  course: CourseDetailsFragment;
  currentSummary: CourseSummaryFragment;
  currentSummaryIndex: number;
  currentTopic: CourseTopicFragment;
  currentTopicIndex: number;
}) {
  const { data: session } = useSession();

  const { setShowLoginModal } = useLoginModalContext();

  const { course, currentSummary, currentSummaryIndex, currentTopic, currentTopicIndex } = props;

  const isLastSummary = currentSummaryIndex === currentTopic.summaries.length - 1;
  const isLastTopic = currentTopicIndex === course.topics.length - 1;
  const hasQuestions = currentTopic.questions.length > 0;

  if (!session) {
    return (
      <Button variant="contained" onClick={() => setShowLoginModal(true)} primary>
        Next
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastSummary && hasQuestions) {
    return (
      <Link href={`/courses/view/${course.key}/${currentTopic.key}/questions/${0}`}>
        <Button variant="contained" primary>
          Evaluation
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </Link>
    );
  }

  if (isLastSummary && !isLastTopic) {
    return (
      <Link href={`/courses/view/${course.key}/${course.topics[currentTopicIndex + 1].key}`}>
        <Button variant="contained" primary>
          Next Chapter <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </Link>
    );
  }

  if (isLastSummary && isLastTopic) {
    return (
      <Link href={`/courses/view/${course.key}/${currentTopic.key}/submit`}>
        <Button variant="contained" primary>
          Submission <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </Link>
    );
  }

  if (!isLastSummary) {
    return (
      <Link href={`/courses/view/${course.key}/${currentTopic.key}/summaries/${currentTopic.summaries[currentSummaryIndex + 1].key}`}>
        <Button variant="contained" primary>
          Next <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </Link>
    );
  }

  return null;
}

const SummaryDetails: FC<CourseSummaryProps> = ({ course, isCourseAdmin, space, topicKey, submissionHelper, summaryKey, courseHelper }) => {
  // Some hooks may need to be adjusted to work with your codebase.

  const { summary: currentSummary, index: currentSummaryIndex } = courseHelper.getTopicSummaryWithIndex(topicKey, summaryKey);
  const { topic: currentTopic, index: currentTopicIndex } = courseHelper.getTopicWithIndex(topicKey);

  const renderer = getMarkedRenderer();
  const details = currentSummary?.details && marked.parse(currentSummary.details, { renderer });

  const { editMode, cancel, showEdit, save } = useEditCourseDetails<UpdateTopicSummaryInput>(
    async (updates: UpdateTopicSummaryInput) => await courseHelper.updateTopicSummary(updates)
  );

  const { deleting, deleteItem } = useDeleteCourseItem<DeleteTopicSummaryInput>(
    async (updates: DeleteTopicSummaryInput) => await courseHelper.deleteTopicSummary(updates)
  );

  function doDelete() {
    if (currentSummary) {
      deleteItem({ courseKey: course.key, topicKey: topicKey, summaryKey: currentSummary.key });
    }
  }

  const { movingUp, movingDown, moveItem } = useMoveCourseItem<MoveTopicSummaryInput>(
    async (updates: MoveTopicSummaryInput) => await courseHelper.moveTopicSummary(updates)
  );

  function doMove(direction: MoveCourseItemDirection) {
    if (currentSummary) {
      moveItem({
        courseKey: course.key,
        topicKey: topicKey,
        summaryKey: currentSummary.key,
        direction: direction,
      });
    }
  }

  return (
    <div className="h-full">
      {!editMode && currentSummary && (
        <div className="flex flex-col justify-between h-full w-full">
          <RightDiv className="right w-full">
            <div className="flex justify-between">
              <h1 className="mb-4">{currentSummary.title}</h1>
              {isCourseAdmin && (
                <div className="flex">
                  <IconButton iconName={IconTypes.Edit} removeBorder onClick={showEdit} />
                  <IconButton
                    iconName={IconTypes.MoveUp}
                    removeBorder
                    loading={movingUp}
                    disabled={movingUp || movingDown || currentSummaryIndex === 0}
                    onClick={() => doMove(MoveCourseItemDirection.Up)}
                  />
                  <IconButton
                    iconName={IconTypes.MoveDown}
                    removeBorder
                    loading={movingDown}
                    disabled={movingUp || movingDown || currentSummaryIndex === currentTopic?.summaries.length - 1}
                    onClick={() => doMove(MoveCourseItemDirection.Down)}
                  />
                  <IconButton iconName={IconTypes.Trash} removeBorder disabled={deleting} loading={deleting} onClick={doDelete} />
                </div>
              )}
            </div>
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: details }} />
          </RightDiv>
          <div className="flex flex-between mt-4 flex-1 items-end p-2">
            {currentSummaryIndex > 0 && (
              <Link href={`/courses/view/${course.key}/${topicKey}/summaries/${currentTopic?.summaries?.[currentSummaryIndex - 1]?.key}`}>
                <Button>
                  <span className="mr-2 font-bold">&#8592;</span>
                  Previous
                </Button>
              </Link>
            )}
            <div className="flex-1"></div>
            <NextButton
              course={course}
              currentSummary={currentSummary}
              currentSummaryIndex={currentSummaryIndex}
              currentTopic={currentTopic}
              currentTopicIndex={currentTopicIndex}
            />
          </div>
        </div>
      )}
      {editMode && (
        <div className="flex flex-col justify-between h-full">
          <EditCourseSummary course={course} space={space} topicKey={topicKey} currentSummary={currentSummary} saveSummary={save} cancel={cancel} />
        </div>
      )}
    </div>
  );
};

export default SummaryDetails;
