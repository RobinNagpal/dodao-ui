import DeleteConfirmationModal from '@/components/app/Modal/DeleteConfirmationModal';
import Button from '@/components/core/buttons/Button';
import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import EditCourseReading from '@/components/courses/Edit/Items/EditCourseReading';
import { useDeleteCourseItem } from '@/components/courses/Edit/useDeleteCourseItem';
import { useEditCourseDetails } from '@/components/courses/Edit/useEditCourseDetails';
import { useMoveCourseItem } from '@/components/courses/Edit/useMoveCourseItem';
import VideoWithQuestions from '@/components/courses/View/Details/VideoWithQuestion';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import {
  CourseDetailsFragment,
  CourseReadingFragment,
  CourseTopicFragment,
  DeleteTopicVideoInput,
  MoveTopicVideoInput,
  Space,
  UpdateTopicVideoInput,
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
import React, { useState } from 'react';

// Add more detailed types for props if you have them available
interface CourseVideoProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: Space;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
  videoUuid: string;
}

function NextButton(props: {
  course: CourseDetailsFragment;
  currentReading: CourseReadingFragment;
  currentReadingIndex: number;
  currentTopic: CourseTopicFragment;
  currentTopicIndex: number;
  submissionHelper: CourseSubmissionHelper;
}) {
  const { data: session } = useSession();

  const { setShowLoginModal } = useLoginModalContext();

  const { course, currentReading, currentReadingIndex, currentTopic, currentTopicIndex } = props;

  const isLastReading = currentReadingIndex === currentTopic.readings.length - 1;
  const isLastTopic = currentTopicIndex === course.topics.length - 1;
  const hasExplanations = currentTopic.explanations.length > 0;
  const hasQuestions = currentTopic.questions.length > 0;
  const hasSummaries = currentTopic.summaries.length > 0;

  const router = useRouter();

  if (!session) {
    return (
      <Button variant="contained" onClick={() => setShowLoginModal(true)} primary>
        Next
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  const markReadingCompleted = () => props.submissionHelper.markReadingCompleted(props.currentTopic.key, props.currentReading.uuid);

  if (isLastReading && hasExplanations) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markReadingCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/explanations/${currentTopic.explanations[0].key}`);
        }}
      >
        Evaluation
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastReading && hasSummaries) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markReadingCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/summaries/${currentTopic.summaries[0].key}`);
        }}
      >
        Evaluation
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastReading && hasQuestions) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markReadingCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/questions/${0}`);
        }}
      >
        Evaluation
        <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastReading && !isLastTopic) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markReadingCompleted();
          router.push(`/courses/view/${course.key}/${course.topics[currentTopicIndex + 1].key}`);
        }}
      >
        Next Chapter <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (isLastReading && isLastTopic) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markReadingCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/submit`);
        }}
      >
        Submission <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  if (!isLastReading) {
    return (
      <Button
        variant="contained"
        primary
        onClick={async () => {
          await markReadingCompleted();
          router.push(`/courses/view/${course.key}/${currentTopic.key}/readings/${currentTopic.readings[currentReadingIndex + 1].uuid}`);
        }}
      >
        Next <span className="ml-2 font-bold">&#8594;</span>
      </Button>
    );
  }

  return null;
}

const CourseVideo: React.FC<CourseVideoProps> = ({ course, isCourseAdmin, space, topicKey, courseHelper, submissionHelper, videoUuid }) => {
  const { topic: currentTopic, index: currentTopicIndex } = courseHelper.getTopicWithIndex(topicKey);
  const { video: currentReading, index: currentReadingIndex } = courseHelper.getTopicVideoWithIndex(topicKey, videoUuid);
  const renderer = getMarkedRenderer();
  const details = currentReading?.details && marked.parse(currentReading.details, { renderer });

  const { editMode, cancel, showEdit, save } = useEditCourseDetails<UpdateTopicVideoInput>(
    async (updates: UpdateTopicVideoInput) => await courseHelper.updateTopicVideo(updates)
  );

  const { deleting, deleteItem } = useDeleteCourseItem<DeleteTopicVideoInput>(
    async (updates: DeleteTopicVideoInput) => await courseHelper.deleteTopicVideo(updates)
  );

  function doDelete() {
    if (currentReading) {
      deleteItem({ courseKey: course.key, topicKey: topicKey, videoUuid: currentReading?.uuid });
    }
  }

  const { movingUp, movingDown, moveItem } = useMoveCourseItem<MoveTopicVideoInput>(
    async (updates: MoveTopicVideoInput) => await courseHelper.moveTopicVideo(updates)
  );

  function doMove(direction: MoveCourseItemDirection) {
    if (currentReading) {
      moveItem({
        courseKey: course.key,
        topicKey: topicKey,
        videoUuid: currentReading?.uuid,
        direction: direction,
      });
    }
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="h-full">
      {/* Converting v-if directive to conditional rendering in React */}
      {!editMode && currentReading && (
        <div className="flex flex-col justify-between h-full">
          <div className="flex w-full">
            <div className="right w-full">
              <div className="flex justify-between">
                <h1 className="mb-4">{currentReading.title}</h1>
                {isCourseAdmin && (
                  <div className="flex">
                    <IconButton iconName={IconTypes.Edit} removeBorder onClick={showEdit} />
                    <IconButton
                      iconName={IconTypes.MoveUp}
                      removeBorder
                      loading={movingUp}
                      disabled={movingUp || movingDown || currentReadingIndex === 0}
                      onClick={() => doMove(MoveCourseItemDirection.Up)}
                    />
                    <IconButton
                      iconName={IconTypes.MoveDown}
                      removeBorder
                      loading={movingDown}
                      disabled={movingUp || movingDown || currentReadingIndex === currentTopic?.readings.length - 1}
                      onClick={() => doMove(MoveCourseItemDirection.Down)}
                    />
                    <IconButton iconName={IconTypes.Trash} removeBorder disabled={deleting} loading={deleting} onClick={() => setShowDeleteModal(true)} />
                  </div>
                )}
              </div>
              <VideoWithQuestions reading={currentReading} submissionHelper={submissionHelper} />
              <p className="mt-6 markdown-body" dangerouslySetInnerHTML={{ __html: details }} />
            </div>
          </div>
          <div className="flex flex-between mt-4 flex-1 items-end p-2">
            {currentReadingIndex > 0 && (
              <Link href={`/courses/view/${course.key}/${topicKey}/readings/${currentTopic?.readings?.[currentReadingIndex - 1]?.uuid}`}>
                <Button>
                  <span className="mr-2 font-bold">&#8592;</span>
                  Previous
                </Button>
              </Link>
            )}
            <div className="flex-1"></div>
            <NextButton
              course={course}
              currentReading={currentReading}
              currentReadingIndex={currentReadingIndex}
              currentTopic={currentTopic}
              currentTopicIndex={currentTopicIndex}
              submissionHelper={submissionHelper}
            />
          </div>
        </div>
      )}
      {editMode && (
        <div className="flex flex-col justify-between h-full">
          <EditCourseReading space={space} course={course} topicKey={topicKey} currentReading={currentReading} saveReading={save} cancel={cancel} />
        </div>
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Video'}
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

export default CourseVideo;
