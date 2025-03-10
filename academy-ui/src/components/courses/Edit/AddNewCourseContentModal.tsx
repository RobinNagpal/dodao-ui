import GenerateQuestionsUsingAI, { GeneratedQuestionInterface } from '@/components/ai/questions/GenerateQuestionsUsingAI';
import EditCourseExplanation from '@/components/courses/Edit/Items/EditCourseExplanation';
import EditCourseQuestion from '@/components/courses/Edit/Items/EditCourseQuestion';
import EditTopic from '@/components/courses/Edit/Items/EditTopic';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import generateQuestionsPrompt from '@/components/guides/Edit/generateQuestionsPrompt';
import {
  AddTopicQuestionInput,
  AddTopicQuestionsInput,
  CourseDetailsFragment,
  UpdateTopicBasicInfoInput,
  UpdateTopicExplanationInput,
  UpdateTopicQuestionInput,
  UpdateTopicSummaryInput,
  UpdateTopicVideoInput,
} from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { QuestionType } from '@dodao/web-core/types/deprecated/models/enums';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
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
  space: SpaceWithIntegrationsDto;
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
    await fetch(`/api/courses/${course.key}/topics/${slugify(topicInfo.title)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        topicInfo: {
          courseKey: course.key,
          details: topicInfo.details,
          title: topicInfo.title,
        },
      }),
    });
    closeModal();
  };
  const addExplanation = async (input: UpdateTopicExplanationInput) => {
    await fetch(`/api/courses/${course.key}/topics/${input.topicKey}/explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        explanationInfo: {
          courseKey: input.courseKey,
          details: input.details,
          shortTitle: input.shortTitle,
          title: input.title,
          topicKey: input.topicKey,
        },
      }),
    });
    closeModal();
  };
  const addSummary = async (input: UpdateTopicSummaryInput) => {
    await fetch(`/api/courses/${course.key}/topics/${input.topicKey}/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        summaryInfo: {
          courseKey: input.courseKey,
          details: input.details,
          shortTitle: input.shortTitle,
          title: input.title,
          topicKey: input.topicKey,
        },
      }),
    });
    closeModal();
  };
  const addReading = async (input: UpdateTopicVideoInput) => {
    await fetch(`/api/courses/${course.key}/topics/${input.topicKey}/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        videoInfo: {
          courseKey: input.courseKey,
          details: input.details,
          shortTitle: input.shortTitle,
          title: input.title,
          topicKey: input.topicKey,
          url: input.url,
        },
      }),
    });
    closeModal();
  };
  const addQuestion = async (question: UpdateTopicQuestionInput) => {
    await fetch(`/api/courses/${course.key}/topics/${question.topicKey}/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        questionInfo: {
          answerKeys: question.answerKeys,
          choices: question.choices,
          content: question.content,
          courseKey: question.courseKey,
          explanation: question.explanation,
          hint: question.hint,
          questionType: question.questionType,
          topicKey: question.topicKey,
        },
      }),
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
        })
      ),
    };
    await fetch(`/api/courses/${course.key}/topics/${input.topicKey}/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        questionsInfo: input,
      }),
    });
    closeModal();
  };

  return (
    <FullPageModal open={open} onClose={closeModal} title={'Add Course Contents'}>
      <ModalBody className="mt-4 flex align-center justify-center h-full w-full">
        {showAddButtons && (
          <div className="max-w-xs">
            <Button primary onClick={() => selectAction(AddActions.Topic)} className="w-full mb-4">
              Add Chapter
            </Button>
            <Button primary onClick={() => selectAction(AddActions.Explanation)} className="w-full mb-4">
              Add Explanation
            </Button>
            <Button primary onClick={() => selectAction(AddActions.Question)} className="w-full mb-4">
              Add Question
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

            {selectedAction === AddActions.AIQuestions && showAddSection && (
              <GenerateQuestionsUsingAI
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
    </FullPageModal>
  );
};

export default AddNewCourseContentModal;
