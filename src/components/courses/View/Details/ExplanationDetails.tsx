import DeleteConfirmationModal from '@/components/app/Modal/DeleteConfirmationModal';
import Button from '@/components/core/buttons/Button';
import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import EditCourseExplanation from '@/components/courses/Edit/Items/EditCourseExplanation';
import { useDeleteCourseItem } from '@/components/courses/Edit/useDeleteCourseItem';
import { useEditCourseDetails } from '@/components/courses/Edit/useEditCourseDetails';
import { useMoveCourseItem } from '@/components/courses/Edit/useMoveCourseItem';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import {
  CourseDetailsFragment,
  CourseExplanationFragment,
  CourseTopicFragment,
  DeleteTopicExplanationInput,
  MoveTopicExplanationInput,
  Space,
  UpdateTopicExplanationInput,
} from '@/graphql/generated/generated-types';
import { MoveCourseItemDirection } from '@/types/deprecated/models/enums';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
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
import { useRouter } from 'next/navigation';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const RightDiv = styled.div`
  min-height: 300px;
`;

interface CourseExplanationProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: Space;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;

  explanationKey: string;
}

function NextButton(props: {
  course: CourseDetailsFragment;
  currentExplanation: CourseExplanationFragment;
  currentExplanationIndex: number;
  currentTopic: CourseTopicFragment;
  currentTopicIndex: number;
  submissionHelper: CourseSubmissionHelper;
}) {
  const { data: session } = useSession();

  const router = useRouter();
  const { setShowLoginModal } = useLoginModalContext();

  const { course, currentExplanationIndex, currentTopic, currentTopicIndex } = props;

  const isLastExplanation = currentExplanationIndex === currentTopic.explanations.length - 1;
  const isLastTopic = currentTopicIndex === course.topics.length - 1;
  const hasQuestions = currentTopic.questions.length > 0;
  const hasSummaries = currentTopic.summaries.length > 0;

  const markExplanationCompleted = () => props.submissionHelper.markExplanationCompleted(props.currentTopic.key, props.currentExplanation.key);

  if (!session) {
    return (
      <Button variant="contained" onClick={() => setShowLoginModal(true)} primary>
        Next
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastExplanation && hasSummaries) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markExplanationCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/summaries/${currentTopic.summaries[0].key}`);
        }}
      >
        Summary
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastExplanation && hasQuestions) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markExplanationCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/questions/${0}`);
        }}
      >
        Evaluation
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastExplanation && !isLastTopic) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markExplanationCompleted();
          router.push(`/courses/view/${course.key}/${course.topics[currentTopicIndex + 1].key}`);
        }}
      >
        Next Chapter <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastExplanation && isLastTopic) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markExplanationCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/submit`);
        }}
      >
        Submission <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (!isLastExplanation) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markExplanationCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/explanations/${currentTopic.explanations[currentExplanationIndex + 1].key}`);
        }}
      >
        Next <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  return null;
}

const ExplanationDetails: FC<CourseExplanationProps> = ({ course, isCourseAdmin, space, topicKey, submissionHelper, explanationKey, courseHelper }) => {
  // Some hooks may need to be adjusted to work with your codebase.

  const { explanation: currentExplanation, index: currentExplanationIndex } = courseHelper.getTopicExplanationWithIndex(topicKey, explanationKey);
  const { topic: currentTopic, index: currentTopicIndex } = courseHelper.getTopicWithIndex(topicKey);

  const renderer = getMarkedRenderer();
  const details = currentExplanation?.details && marked.parse(currentExplanation.details, { renderer });

  const { editMode, cancel, showEdit, save } = useEditCourseDetails<UpdateTopicExplanationInput>(
    async (updates: UpdateTopicExplanationInput) => await courseHelper.updateTopicExplanation(updates)
  );

  const { deleting, deleteItem } = useDeleteCourseItem<DeleteTopicExplanationInput>(
    async (updates: DeleteTopicExplanationInput) => await courseHelper.deleteTopicExplanation(updates)
  );

  function doDelete() {
    if (currentExplanation) {
      deleteItem({ courseKey: course.key, topicKey: topicKey, explanationKey: currentExplanation.key });
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { movingUp, movingDown, moveItem } = useMoveCourseItem<MoveTopicExplanationInput>(
    async (updates: MoveTopicExplanationInput) => await courseHelper.moveTopicExplanation(updates)
  );

  function doMove(direction: MoveCourseItemDirection) {
    if (currentExplanation) {
      moveItem({
        courseKey: course.key,
        topicKey: topicKey,
        explanationKey: currentExplanation.key,
        direction: direction,
      });
    }
  }

  // Special case for not adding any dependencies to the use effect as we want this to run on every render.
  useEffect(() => {
    Array.from(document.querySelectorAll('.play-js-player')).map((p: any) => new Plyr(p));
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="h-full">
      {!editMode && currentExplanation && (
        <div className="flex flex-col justify-between h-full w-full">
          <RightDiv className="right w-full">
            <div className="flex justify-between">
              <h1 className="mb-4">{currentExplanation.title}</h1>
              {isCourseAdmin && (
                <div className="flex">
                  <IconButton iconName={IconTypes.Edit} removeBorder onClick={showEdit} />
                  <IconButton
                    iconName={IconTypes.MoveUp}
                    removeBorder
                    loading={movingUp}
                    disabled={movingUp || movingDown || currentExplanationIndex === 0}
                    onClick={() => doMove(MoveCourseItemDirection.Up)}
                  />
                  <IconButton
                    iconName={IconTypes.MoveDown}
                    removeBorder
                    loading={movingDown}
                    disabled={movingUp || movingDown || currentExplanationIndex === currentTopic?.explanations.length - 1}
                    onClick={() => doMove(MoveCourseItemDirection.Down)}
                  />
                  <IconButton iconName={IconTypes.Trash} removeBorder disabled={deleting} loading={deleting} onClick={() => setShowDeleteModal(true)} />
                </div>
              )}
            </div>
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: details }} />
          </RightDiv>
          <div className="flex flex-between mt-4 flex-1 items-end p-2">
            {currentExplanationIndex > 0 && (
              <Link href={`/courses/view/${course.key}/${topicKey}/explanations/${currentTopic?.explanations?.[currentExplanationIndex - 1]?.key}`}>
                <Button>
                  <span className="mr-2 font-bold">&#8592;</span>
                  Previous
                </Button>
              </Link>
            )}
            <div className="flex-1"></div>
            <NextButton
              course={course}
              currentExplanation={currentExplanation}
              currentExplanationIndex={currentExplanationIndex}
              currentTopic={currentTopic}
              currentTopicIndex={currentTopicIndex}
              submissionHelper={submissionHelper}
            />
          </div>
        </div>
      )}
      {editMode && (
        <div className="flex flex-col justify-between h-full">
          <EditCourseExplanation
            course={course}
            space={space}
            topicKey={topicKey}
            currentExplanation={currentExplanation}
            saveExplanation={save}
            cancel={cancel}
          />
        </div>
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Explanation'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            doDelete();
            setShowDeleteModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ExplanationDetails;
