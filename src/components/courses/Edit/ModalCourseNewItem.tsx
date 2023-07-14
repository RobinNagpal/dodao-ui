import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import EditCourseExplanation from '@/components/courses/Edit/Items/EditCourseExplanation';
import EditCourseQuestion from '@/components/courses/Edit/Items/EditCourseQuestion';
import EditCourseReading from '@/components/courses/Edit/Items/EditCourseReading';
import EditCourseSummary from '@/components/courses/Edit/Items/EditCourseSummary';
import EditTopic, { UpdateTopicForm } from '@/components/courses/Edit/Items/EditTopic';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { CourseDetailsFragment, Space, UpdateTopicBasicInfoInput, UpdateTopicSummaryInput, UpdateTopicVideoInput } from '@/graphql/generated/generated-types';
import { QuestionType } from '@/types/deprecated/models/enums';
import React, { useState } from 'react';
import styled from 'styled-components';

enum AddActions {
  Topic = 'Topic',
  Explanation = 'Explanation',
  Reading = 'Reading',
  Question = 'Question',
  Summary = 'Summary',
}

interface ModalCourseNewItemProps {
  course: CourseDetailsFragment;
  space: Space;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
  open: boolean;
  closeModal: () => void;
}

const ModalCourseNewItem: React.FC<ModalCourseNewItemProps> = ({ course, space, submissionHelper, courseHelper, open, closeModal: onCloseModal }) => {
  const [selectedTopicKey, setSelectedTopicKey] = useState<string | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>(null);
  const [showAddButtons, setShowAddButtons] = useState(true);
  const [showChapterSelectionButtons, setShowChapterSelectionButtons] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AddActions | null>(AddActions.Explanation);

  const closeModal = () => {
    setSelectedTopicKey(null);
    setSelectedQuestionType(null);
    setSelectedAction(null);
    setShowAddButtons(true);
    setShowChapterSelectionButtons(false);
    setShowAddSection(false);
    onCloseModal();
  };
  //... define your addTopic, addExplanation, addSummary, addReading, and addQuestion functions here.

  function selectAction(action: AddActions) {
    setSelectedAction(action);
    setShowAddButtons(false);

    if (action === AddActions.Topic) {
      setShowChapterSelectionButtons(false);
      setShowAddSection(true);
    } else {
      setShowChapterSelectionButtons(true);
      setShowAddSection(false);
    }
  }

  function selectTopic(topicKey: string) {
    setSelectedTopicKey(topicKey);
    setShowAddButtons(false);
    setShowChapterSelectionButtons(false);
    setShowAddSection(true);
  }

  const addTopic = async (updatedTopic: UpdateTopicBasicInfoInput): Promise<void> => {};
  const addExplanation = () => {};
  const addSummary = async (updatedSummary: UpdateTopicSummaryInput) => {};
  const addReading = async (updatedReading: UpdateTopicVideoInput) => {};
  const addQuestion = () => {};
  return (
    <FullScreenModal open={open} onClose={closeModal} title={'Add Course Contents'}>
      <ModalBody className="mt-4 flex align-center justify-center h-full w-full">
        {showAddButtons && (
          <div className="max-w-xs">
            <Button primary onClick={() => selectAction(AddActions.Topic)} className="w-full mb-4">
              Add Chapter
            </Button>
            <Button primary onClick={() => selectAction(AddActions.Explanation)} className="w-full mb-4">
              Add Explanation
            </Button>
            <Button primary onClick={() => selectAction(AddActions.Reading)} className="w-full mb-4">
              Add Video
            </Button>
            <Button primary onClick={() => selectAction(AddActions.Question)} className="w-full mb-4">
              Add Question
            </Button>
            <Button primary onClick={() => selectAction(AddActions.Summary)} className="w-full mb-4">
              Add Summary
            </Button>
          </div>
        )}

        {showChapterSelectionButtons && (
          <div className="mt-4 flex justify-center align-center h-full w-full">
            <div className="max-w-xs">
              <p className="mb-4 text-center">Select the chapter to which you want to add the new {selectedAction}</p>
              {course.topics.map((topic) => (
                <Button key={topic.key} primary onClick={() => selectTopic(topic.key)} className="w-full mb-4">
                  {topic.title}
                </Button>
              ))}
            </div>
          </div>
        )}
        {selectedAction && (
          <>
            {selectedAction === AddActions.Topic && showAddSection && <EditTopic course={course} space={space} saveTopic={addTopic} cancel={closeModal} />}

            {selectedAction === AddActions.Explanation && showAddSection && (
              <EditCourseExplanation course={course} space={space} topicKey={selectedTopicKey!} saveExplanation={addExplanation} cancel={closeModal} />
            )}

            {selectedAction === AddActions.Summary && showAddSection && (
              <EditCourseSummary course={course} space={space} topicKey={selectedTopicKey!} saveSummary={addSummary} cancel={closeModal} />
            )}

            {selectedAction === AddActions.Reading && showAddSection && (
              <EditCourseReading course={course} space={space} topicKey={selectedTopicKey!} saveReading={addReading} cancel={closeModal} />
            )}
          </>
        )}

        {selectedAction === AddActions.Question && showAddSection && (
          <div className="p-4 w-full h-full">
            {selectedQuestionType ? (
              <EditCourseQuestion
                course={course}
                space={space}
                topicKey={selectedTopicKey!}
                selectedQuestionType={selectedQuestionType}
                saveQuestion={addQuestion}
                cancel={closeModal}
              />
            ) : (
              <div className="w-full h-full">
                <Button primary onClick={() => setSelectedQuestionType(QuestionType.SingleChoice)} className="w-full mb-4">
                  Single Choice
                </Button>
                <Button primary onClick={() => setSelectedQuestionType(QuestionType.MultipleChoice)} className="w-full mb-4">
                  Multiple Choice
                </Button>
              </div>
            )}
          </div>
        )}
      </ModalBody>
    </FullScreenModal>
  );
};

export default ModalCourseNewItem;

const ModalBody = styled.div`
  min-height: 600px;
`;
