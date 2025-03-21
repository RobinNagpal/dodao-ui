import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Button from '@dodao/web-core/components/core/buttons/Button';
import EditTopic from '@/components/courses/Edit/Items/EditTopic';
import { useDeleteCourseItem } from '@/components/courses/Edit/useDeleteCourseItem';
import { useEditCourseDetails } from '@/components/courses/Edit/useEditCourseDetails';
import { useMoveCourseItem } from '@/components/courses/Edit/useMoveCourseItem';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import {
  CourseDetailsFragment,
  CourseTopicFragment,
  DeleteTopicInput,
  MoveTopicInput,
  Space,
  UpdateTopicBasicInfoInput,
} from '@/graphql/generated/generated-types';
import { MoveCourseItemDirection } from '@dodao/web-core/types/deprecated/models/enums';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

const RightDiv = styled.div`
  min-height: 300px;
`;

function NextButton(props: { course: CourseDetailsFragment; currentTopic: CourseTopicFragment; currentTopicIndex: number }) {
  const { data: session } = useSession();

  const { setShowLoginModal } = useLoginModalContext();

  const { course, currentTopic, currentTopicIndex } = props;

  const hasQuestions = currentTopic.questions.length > 0;
  const hasSummaries = currentTopic.summaries.length > 0;
  const hasExplanations = currentTopic.explanations.length > 0;
  const hasReadings = currentTopic.readings.length > 0;

  if (!session) {
    return (
      <Button variant="contained" onClick={() => setShowLoginModal(true)} primary>
        Next
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (hasReadings) {
    return (
      <Link href={`/courses/view/${course.key}/${currentTopic.key}/readings/${currentTopic.readings?.[0].uuid}`}>
        <Button variant="contained" primary>
          Next
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </Link>
    );
  }

  if (hasExplanations) {
    return (
      <Link href={`/courses/view/${course.key}/${currentTopic.key}/explanations/${currentTopic.explanations?.[0].key}`}>
        <Button variant="contained" primary>
          Next
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </Link>
    );
  }

  if (hasSummaries) {
    return (
      <Link href={`/courses/view/${course.key}/${currentTopic.key}/summaries/${currentTopic.summaries?.[0].key}`}>
        <Button variant="contained" primary>
          Next
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </Link>
    );
  }

  if (hasQuestions) {
    return (
      <Link href={`/courses/view/${course.key}/${currentTopic.key}/questions/${0}`}>
        <Button variant="contained" primary>
          Evaluation
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </Link>
    );
  }

  return null;
}

interface TopicProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: SpaceWithIntegrationsDto;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
}

const Topic = ({ course, isCourseAdmin, space, topicKey, courseHelper }: TopicProps) => {
  const { topic: currentTopic, index: currentTopicIndex } = courseHelper.getTopicWithIndex(topicKey);
  const renderer = getMarkedRenderer();
  const details = marked.parse(currentTopic.details, { renderer });

  const { editMode, cancel, showEdit, save } = useEditCourseDetails<UpdateTopicBasicInfoInput>(
    async (updates: UpdateTopicBasicInfoInput) =>
      await fetch(`/api/courses/${updates.courseKey}/topics/${updates.topicKey}`, {
        method: 'PUT',
        body: JSON.stringify({
          spaceId: space.id,
          topicInfo: updates,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
  );

  const { deleting, deleteItem } = useDeleteCourseItem<DeleteTopicInput>(
    async (updates: DeleteTopicInput) =>
      await fetch(`/api/courses/${updates.courseKey}/topics/${updates.topicKey}`, {
        method: 'DELETE',
        body: JSON.stringify({
          spaceId: space.id,
          topicInfo: updates,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
  );

  const doDelete = () => {
    deleteItem({ courseKey: course.key, topicKey: topicKey });
  };

  const { movingUp, movingDown, moveItem } = useMoveCourseItem<MoveTopicInput>(
    async (updates: MoveTopicInput) =>
      await fetch(`/api/courses/${updates.courseKey}/topics/${updates.topicKey}`, {
        method: 'PATCH',
        body: JSON.stringify({
          spaceId: space.id,
          topicInfo: updates,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
  );

  const doMove = (direction: MoveCourseItemDirection) => {
    moveItem({
      courseKey: course.key,
      topicKey: topicKey,
      direction: direction,
    });
  };

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  return (
    <div className="h-full">
      {!editMode && (
        <div className="flex flex-col h-full w-full">
          <RightDiv className="right w-full">
            <div className="flex justify-between">
              <h1 className="text-3xl mb-4">{currentTopic?.title}</h1>
              {isCourseAdmin && (
                <div className="flex">
                  <IconButton iconName={IconTypes.Edit} removeBorder onClick={showEdit} />
                  <IconButton
                    iconName={IconTypes.MoveUp}
                    removeBorder
                    loading={movingUp}
                    disabled={movingUp || movingDown || currentTopicIndex === 0}
                    onClick={() => doMove(MoveCourseItemDirection.Up)}
                  />
                  <IconButton
                    iconName={IconTypes.MoveDown}
                    removeBorder
                    loading={movingDown}
                    disabled={movingUp || movingDown || currentTopicIndex === course.topics.length - 1}
                    onClick={() => doMove(MoveCourseItemDirection.Down)}
                  />
                  <IconButton iconName={IconTypes.Trash} removeBorder disabled={deleting} loading={deleting} onClick={() => setShowDeleteModal(true)} />
                </div>
              )}
            </div>
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: details || '' }} />
          </RightDiv>

          <div className="flex flex-between mt-4 flex-1 items-end p-2">
            {currentTopicIndex === 0 && (
              <Button primary variant="contained" onClick={() => courseHelper.goToLink(`/courses/view/${course.key}`)}>
                <span className="mr-2 font-bold">&#8592;</span>
                Previous
              </Button>
            )}
            <div className="flex-1"></div>
            <NextButton course={course} currentTopic={currentTopic} currentTopicIndex={currentTopicIndex} />
          </div>
        </div>
      )}
      {editMode && (
        <div className="flex flex-col justify-between h-full">
          <EditTopic course={course} space={space} topicKey={topicKey} currentTopic={currentTopic!} saveTopic={save} cancel={cancel} />
        </div>
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={`Delete Chapter - ${currentTopic.title}`}
          deleteButtonText="Delete Chapter"
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

export default Topic;
