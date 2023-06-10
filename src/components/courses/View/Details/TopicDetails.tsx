import IconButton from '@/components/app/Button/IconButton';
import { IconTypes } from '@/components/app/Icons/IconTypes';
import Button from '@/components/core/buttons/Button';
import EditTopic from '@/components/courses/Edit/Items/EditTopic';
import { useDeleteCourseItem } from '@/components/courses/Edit/useDeleteCourseItem';
import { useEditCourseDetails } from '@/components/courses/Edit/useEditCourseDetails';
import { useMoveCourseItem } from '@/components/courses/Edit/useMoveCourseItem';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import {
  CourseDetailsFragment,
  CourseTopicFragment,
  DeleteTopicInput,
  Space,
  UpdateTopicBasicInfoInput,
  MoveTopicInput,
} from '@/graphql/generated/generated-types';
import { MoveCourseItemDirection } from '@/types/deprecated/models/enums';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const RightDiv = styled.div`
  min-height: 300px;
`;

interface TopicProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: Space;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
}

const Topic = ({ course, isCourseAdmin, space, topicKey, courseHelper }: TopicProps) => {
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number | null>(null);
  const [topic, setTopic] = useState<CourseTopicFragment | null>(null);
  const renderer = getMarkedRenderer();
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTopicIndex(course.topics.findIndex((topic) => topic.key === topicKey));
  }, [course, topicKey]);

  useEffect(() => {
    setTopic(currentTopicIndex !== -1 ? course.topics[currentTopicIndex || 0] : null);
  }, [course, currentTopicIndex]);

  useEffect(() => {
    const details = topic?.details;
    setDetails((details && marked.parse(details, { renderer })) || '');
  }, [topic]);

  const { editMode, cancel, showEdit, save } = useEditCourseDetails<UpdateTopicBasicInfoInput>(
    async (updates: UpdateTopicBasicInfoInput) => await courseHelper.updateTopic(updates)
  );

  const { deleting, deleteItem } = useDeleteCourseItem<DeleteTopicInput>(async (updates: DeleteTopicInput) => await courseHelper.deleteTopic(updates));

  const doDelete = () => {
    if (topic) {
      deleteItem({ courseKey: course.key, topicKey: topicKey });
    }
  };

  const { movingUp, movingDown, moveItem } = useMoveCourseItem<MoveTopicInput>(async (updates: MoveTopicInput) => await courseHelper.moveTopic(updates));

  const doMove = (direction: MoveCourseItemDirection) => {
    if (topic) {
      moveItem({
        courseKey: course.key,
        topicKey: topicKey,
        direction: direction,
      });
    }
  };

  return (
    <div className="h-full">
      {!editMode && topic && (
        <div className="flex flex-col h-full w-full">
          <RightDiv className="right w-full">
            <div className="flex justify-between">
              <h1 className="text-3xl mb-4">{topic?.title}</h1>
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
                    disabled={movingUp || movingDown || currentTopicIndex === topic.summaries.length - 1}
                    onClick={() => doMove(MoveCourseItemDirection.Down)}
                  />
                  <IconButton iconName={IconTypes.Trash} removeBorder disabled={deleting} loading={deleting} onClick={doDelete} />
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
            {topic.readings.length > 0 && (
              <Button primary variant="contained" onClick={() => courseHelper.goToLink(`/courses/view/${course.key}/readings/${topic.readings[0].uuid}`)}>
                Next
                <span className="ml-2 font-bold">&#8594;</span>
              </Button>
            )}
          </div>
        </div>
      )}
      {editMode && (
        <div className="flex flex-col justify-between h-full">
          <EditTopic course={course} space={space} topicKey={topicKey} currentTopic={topic!} saveTopic={save} cancel={cancel} />
        </div>
      )}
    </div>
  );
};

export default Topic;
