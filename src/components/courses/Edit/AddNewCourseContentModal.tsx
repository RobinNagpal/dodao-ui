import GenerateQuestionUsingAI, { GeneratedQuestionInterface } from '@/components/ai/questions/GenerateQuestionUsingAI';
import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import EditCourseExplanation from '@/components/courses/Edit/Items/EditCourseExplanation';
import EditCourseQuestion from '@/components/courses/Edit/Items/EditCourseQuestion';
import EditCourseReading from '@/components/courses/Edit/Items/EditCourseReading';
import EditCourseSummary from '@/components/courses/Edit/Items/EditCourseSummary';
import EditTopic from '@/components/courses/Edit/Items/EditTopic';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import generateQuestionsPrompt from '@/components/guides/Edit/generateQuestionsPrompt';
import {
  AddTopicQuestionInput,
  AddTopicQuestionsInput,
  CourseDetailsFragment,
  Space,
  UpdateTopicBasicInfoInput,
  UpdateTopicExplanationInput,
  UpdateTopicQuestionInput,
  UpdateTopicSummaryInput,
  UpdateTopicVideoInput,
} from '@/graphql/generated/generated-types';
import { QuestionType } from '@/types/deprecated/models/enums';
import React, { useState } from 'react';
import styled from 'styled-components';

enum AddActions {
  Topic = 'Topic',
  Explanation = 'Explanation',
  Reading = 'Reading',
  Question = 'Question',
  AIQuestions = 'AIQuestions',
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

const ModalBody = styled.div`
  min-height: 600px;
`;

const AddNewCourseContentModal: React.FC<ModalCourseNewItemProps> = ({ course, space, submissionHelper, courseHelper, open, closeModal: onCloseModal }) => {
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

  const addTopic = async (topicInfo: UpdateTopicBasicInfoInput): Promise<void> => {
    await courseHelper.addTopic({
      courseKey: course.key,
      details: topicInfo.details,
      title: topicInfo.title,
    });
    closeModal();
  };
  const addExplanation = async (input: UpdateTopicExplanationInput) => {
    await courseHelper.addTopicExplanation({
      courseKey: input.courseKey,
      details: input.details,
      shortTitle: input.shortTitle,
      title: input.title,
      topicKey: input.topicKey,
    });
    closeModal();
  };
  const addSummary = async (input: UpdateTopicSummaryInput) => {
    await courseHelper.addTopicSummary({
      courseKey: input.courseKey,
      details: input.details,
      shortTitle: input.shortTitle,
      title: input.title,
      topicKey: input.topicKey,
    });
    closeModal();
  };
  const addReading = async (input: UpdateTopicVideoInput) => {
    await courseHelper.addTopicVideo({
      courseKey: input.courseKey,
      details: input.details,
      shortTitle: input.shortTitle,
      title: input.title,
      topicKey: input.topicKey,
      url: input.url,
    });
    closeModal();
  };
  const addQuestion = async (question: UpdateTopicQuestionInput) => {
    await courseHelper.addTopicQuestion({
      answerKeys: question.answerKeys,
      choices: question.choices,
      content: question.content,
      courseKey: question.courseKey,
      explanation: question.explanation,
      hint: question.hint,
      questionType: question.questionType,
      topicKey: question.topicKey,
    });
    closeModal();
  };

  const addGeneratedQuestions = async (generatedQuestions: GeneratedQuestionInterface[]) => {
    const input: AddTopicQuestionsInput = {
      courseKey: course.key,
      topicKey: selectedTopicKey!,
      questions: generatedQuestions.map(
        (generatedQuestion, index): AddTopicQuestionInput => ({
          answerKeys: generatedQuestion.answerKeys,
          choices: generatedQuestion.choices,
          content: generatedQuestion.content,
          courseKey: course.key,
          hint: 'NoHint',
          topicKey: selectedTopicKey!,
          questionType: QuestionType.SingleChoice,
          explanation: generatedQuestion.explanation,
        }),
      ),
    };
    await courseHelper.addTopicQuestions(input!);
    closeModal();
  };

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
            <Button primary onClick={() => selectAction(AddActions.AIQuestions)} className="w-full mb-4">
              Add Questions using AI
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
            {selectedAction === AddActions.AIQuestions && showAddSection && (
              <GenerateQuestionUsingAI
                onGenerateContent={(questions) => {
                  addGeneratedQuestions(questions);
                }}
                generatePrompt={(topic: string, numberOfQuestions: number, contents: string) => generateQuestionsPrompt(topic, numberOfQuestions, contents)}
              />
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

export default AddNewCourseContentModal;
