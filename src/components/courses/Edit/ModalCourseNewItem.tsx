import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import EditCourseExplanation from '@/components/courses/Edit/Items/EditCourseExplanation';
import EditCourseQuestion from '@/components/courses/Edit/Items/EditCourseQuestion';
import EditCourseReading from '@/components/courses/Edit/Items/EditCourseReading';
import EditCourseSummary from '@/components/courses/Edit/Items/EditCourseSummary';
import EditTopic, { UpdateTopicForm } from '@/components/courses/Edit/Items/EditTopic';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { CourseDetailsFragment, Space, UpdateTopicSummaryInput, UpdateTopicVideoInput } from '@/graphql/generated/generated-types';
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

const ModalCourseNewItem: React.FC<ModalCourseNewItemProps> = ({ course, space, submissionHelper, courseHelper, open, closeModal }) => {
  const [selectedTopicKey, setSelectedTopicKey] = useState<string | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>(null);
  const [showAddButtons, setShowAddButtons] = useState(true);
  const [showChapterSelectionButtons, setShowChapterSelectionButtons] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AddActions | null>(AddActions.Explanation);

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

  const addTopic = async (updatedTopic: UpdateTopicForm): Promise<void> => {};
  const addExplanation = () => {};
  const addSummary = async (updatedSummary: UpdateTopicSummaryInput) => {};
  const addReading = async (updatedReading: UpdateTopicVideoInput) => {};
  const addQuestion = () => {};
  return (
    <FullScreenModal open={open} onClose={closeModal} title={'Add'}>
      <h3>Add</h3>
      <ModalBody className="mt-4 flex justify-center h-full">
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
          <div className="max-w-xs">
            <p className="mb-4 text-center">Select the chapter to which you want to add the new {selectedAction}</p>
            {course.topics.map((topic) => (
              <Button key={topic.key} primary onClick={() => selectTopic(topic.key)} className="w-full mb-4">
                {topic.title}
              </Button>
            ))}
          </div>
        )}

        {selectedAction === AddActions.Topic && showAddSection && (
          <div className="p-4 w-full h-full">
            <EditTopic course={course} space={space} saveTopic={addTopic} cancel={closeModal} />
          </div>
        )}

        {selectedAction === AddActions.Explanation && showAddSection && (
          <div className="p-4 w-full h-full">
            <EditCourseExplanation course={course} space={space} topicKey={selectedTopicKey!} saveExplanation={addExplanation} cancel={closeModal} />
          </div>
        )}

        {selectedAction === AddActions.Summary && showAddSection && (
          <div className="p-4 w-full h-full">
            <EditCourseSummary course={course} space={space} topicKey={selectedTopicKey!} saveSummary={addSummary} cancel={closeModal} />
          </div>
        )}

        {selectedAction === AddActions.Reading && showAddSection && (
          <div className="p-4 w-full h-full">
            <EditCourseReading course={course} space={space} topicKey={selectedTopicKey!} saveReading={addReading} cancel={closeModal} />
          </div>
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
