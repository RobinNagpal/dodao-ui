import { GeneratedQuestionInterface } from '@/components/ai/questions/GenerateQuestionsUsingAI';
import CreateQuestion from '@/components/app/Common/CreateQuestion';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import AddContentOrQuestionAIModal from '@/components/app/Modal/AI/AddContentOrQuestionAIModal';
import GenerateContentUsingAIModal from '@/components/app/Modal/AI/GenerateContentUsingAIModal';
import GenerateQuestionUsingAIModal from '@/components/app/Modal/AI/GenerateQuestionUsingAIModal';
import generateGuideContentPrompt from '@/components/guides/Edit/generateGuideContentPrompt';
import generateQuestionsPrompt from '@/components/guides/Edit/generateQuestionsPrompt';
import { UseEditGuideHelper } from '@/components/guides/Edit/useEditGuide';
import {
  GuideFragment,
  GuideQuestion,
  GuideQuestionFragment,
  GuideStepFragment,
  GuideStepItemFragment,
  GuideUserDiscordConnectFragment,
  GuideUserInputFragment,
  ImageType,
  StepItemInputGenericInput,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import CreateConnectDiscord from '@dodao/web-core/components/app/Common/CreateDiscordConnect';
import CreateUserInput from '@dodao/web-core/components/app/Common/CreateUserInput';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import AddStepItemModal from '@dodao/web-core/components/app/Modal/StepItem/AddStepItemModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import { InputType, QuestionType, UserDiscordConnectType } from '@dodao/web-core/types/deprecated/models/enums';
import { QuestionError, StepError } from '@dodao/web-core/types/errors/error';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import isEqual from 'lodash/isEqual';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

interface GuideStepProps {
  space: SpaceWithIntegrationsDto;
  guide: GuideFragment;
  guideHasDiscordEnabled: boolean;
  step: GuideStepFragment;
  stepErrors?: StepError;
  editGuideHelper: UseEditGuideHelper;
}

const defaultGuidelines = `- The output should be in simple language and easy to understand.
- The output should be in your own words and not copied from the content provided.
- The output should be between 4-8 paragraphs.
- Don't create a conclusion or summary paragraph.`;

const StepContainer = styled.div`
  // Create a styled-component for styles where Tailwind classes are not available.
  min-height: 40px;
`;

const StepItemWrapper = styled.div<{ hasError: boolean }>`
  border: ${(props) => (props.hasError ? '1px solid red' : '1px solid var(--border-color)')};
  border-radius: 0.5rem;
`;

const GuideStep: React.FC<GuideStepProps> = ({ guide, step, stepErrors, guideHasDiscordEnabled, editGuideHelper, space }) => {
  const { moveStepUp, moveStepDown, removeStep, updateStep } = editGuideHelper.updateGuideFunctions;
  const [modalGuidInputOrQuestionOpen, setModalGuidInputOrQuestionOpen] = useState(false);
  const [modalGenerateAIOpen, setModalGenerateAIOpen] = useState(false);
  const [modalGenerateContentUsingAIOpen, setModalGenerateContentUsingAIOpen] = useState(false);
  const [modalGenerateQuestionsUsingAIOpen, setModalGenerateQuestionsUsingAIOpen] = useState(false);
  const { $t } = useI18();
  const { showNotification } = useNotificationContext();

  const inputError = (field: keyof StepError) => {
    return stepErrors?.[field];
  };

  const updateStepName = (stepName: string) => {
    updateStep({ ...step, stepName });
  };

  const updateStepContent = (content: string) => {
    updateStep({ ...step, content });
  };
  // Add your handler functions here...

  function updateQuestionDescription(questionId: string, content: string) {
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        return {
          ...question,
          content,
        };
      } else {
        return question;
      }
    });

    updateStep({ ...step, stepItems });
  }

  function updateQuestionExplanation(questionId: string, explanation: string) {
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        return {
          ...question,
          explanation,
        };
      } else {
        return question;
      }
    });

    updateStep({ ...step, stepItems });
  }

  function updateChoiceContent(questionId: string, choiceKey: string, content: string) {
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        const choices = (question as GuideQuestionFragment).choices.map((choice) => {
          if (choice.key === choiceKey) {
            return { ...choice, content };
          } else {
            return choice;
          }
        });
        return {
          ...question,
          choices,
        };
      } else {
        return question;
      }
    });

    updateStep({ ...step, stepItems });
  }

  const stepItemsForStepper = useMemo(() => {
    return [
      ...step.stepItems.map((q: GuideQuestionFragment | GuideUserInputFragment | GuideUserDiscordConnectFragment) => ({
        ...q,
        isQuestion: q.type === QuestionType.MultipleChoice || q.type === QuestionType.SingleChoice,
        isDiscord: q.type === UserDiscordConnectType,
      })),
    ];
  }, [step]);

  function newChoiceKey() {
    return uuidv4().split('-')[0];
  }

  function addChoice(questionId: string) {
    const key = newChoiceKey();
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        const choices = [...(question as GuideQuestion).choices, { key, content: '' }];
        return {
          ...question,
          choices: choices.map((choice, index) => ({ ...choice, order: index })),
        };
      } else {
        return question;
      }
    });
    updateStep({ ...step, stepItems });
  }

  function removeChoice(questionId: string, choiceKey: string) {
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        return {
          ...question,
          choices: (question as GuideQuestion).choices.filter((choice) => choice.key !== choiceKey),
          answerKeys: (question as GuideQuestion).answerKeys.filter((answerKey) => answerKey !== choiceKey),
        };
      } else {
        return question;
      }
    });

    updateStep({ ...step, stepItems });
  }

  function removeStepItem(itemUuid: string) {
    const filteredQuestions = step.stepItems.filter((stepItem) => stepItem.uuid !== itemUuid);

    const itemsWithIndex: GuideStepItemFragment[] = filteredQuestions.map((question, index) => ({
      ...question,
      order: index,
    })) as GuideStepItemFragment[];
    updateStep({ ...step, stepItems: itemsWithIndex });
  }

  function updateUserInputLabel(itemUuid: string, label: string) {
    const stepItems = step.stepItems.map((userInput) => {
      if (userInput.uuid === itemUuid) {
        return {
          ...userInput,
          label,
        };
      } else {
        return userInput;
      }
    });

    updateStep({ ...step, stepItems });
  }

  function updateUserInputPrivate(itemUuid: string, isPrivate: boolean) {
    const stepItems = step.stepItems.map((stepItem) => {
      if (stepItem.uuid === itemUuid) {
        return {
          ...stepItem,
          type: isPrivate ? InputType.PrivateShortInput : InputType.PublicShortInput,
        };
      } else {
        return stepItem;
      }
    });

    updateStep({ ...step, stepItems });
  }

  function updateUserInputRequired(itemUuid: string, isRequired: boolean) {
    const stepItems = step.stepItems.map((stepItem) => {
      if (stepItem.uuid === itemUuid) {
        return {
          ...stepItem,
          required: isRequired,
        };
      } else {
        return stepItem;
      }
    });

    updateStep({ ...step, stepItems });
  }

  function updateAnswers(questionId: string, choiceKey: string, selected: boolean) {
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        const existingAnswerKeys = (question as GuideQuestion).answerKeys;
        const answerKeys = selected ? [...existingAnswerKeys, choiceKey] : existingAnswerKeys.filter((answer) => answer !== choiceKey);
        return {
          ...question,
          answerKeys,
        };
      } else {
        return question;
      }
    });
    updateStep({ ...step, stepItems });
  }

  function setAnswer(questionId: string, choiceKey: string) {
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        const answerKeys = isEqual((question as GuideQuestion).answerKeys, [choiceKey]) ? [] : [choiceKey];
        return {
          ...question,
          answerKeys,
        };
      } else {
        return question;
      }
    });
    updateStep({ ...step, stepItems });
  }

  function addQuestion(type: QuestionType) {
    const question: GuideStepItemFragment = {
      __typename: 'GuideQuestion',
      uuid: uuidv4(),
      content: '',
      explanation: '',
      choices: [
        {
          key: newChoiceKey(),
          content: '',
        },
        {
          key: newChoiceKey(),
          content: '',
        },
      ],
      answerKeys: [],
      order: step.stepItems.length,
      type: type,
    };
    const stepItems = [...(step.stepItems || []), question];
    updateStep({ ...step, stepItems });
  }

  function addGeneratedQuestions(generatedQuestions: GeneratedQuestionInterface[]) {
    const questions: GuideStepItemFragment[] = generatedQuestions.map((generatedQuestion, index) => ({
      __typename: 'GuideQuestion',
      uuid: uuidv4(),
      ...generatedQuestion,
      type: QuestionType.SingleChoice,
      order: step.stepItems.length + index,
      explanation: generatedQuestion.explanation,
    }));

    const stepItems = [...(step.stepItems || []), ...questions];
    updateStep({ ...step, stepItems });
  }

  function addInput(type: InputType) {
    const input: GuideStepItemFragment = {
      __typename: 'GuideUserInput',
      uuid: uuidv4(),
      label: 'Label',
      order: step.stepItems.length,
      type: type,
      required: false,
    };
    const inputs: GuideStepItemFragment[] = [...(step.stepItems || []), input];
    updateStep({ ...step, stepItems: inputs });
  }

  function addDiscord() {
    const discord: GuideStepItemFragment = {
      __typename: 'UserDiscordConnect',
      uuid: uuidv4(),
      type: UserDiscordConnectType,
    };
    const stepItems: GuideStepItemFragment[] = [...(step.stepItems || []), discord];
    updateStep({ ...step, stepItems });
  }

  function updateQuestionType(questionId: string, type: QuestionType) {
    const stepItems: GuideStepItemFragment[] = step.stepItems.map((question): StepItemInputGenericInput => {
      if (question.uuid === questionId) {
        return {
          ...question,
          answerKeys: [],
          type,
        };
      } else {
        return question;
      }
    }) as GuideStepItemFragment[];
    updateStep({ ...step, stepItems });
  }
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="w-full p-4 flex flex-col justify-center items-center">
      <StepContainer className="h-10 mb-4 flex justify-between items-center w-full">
        <h3 className="text-2xl font-bold">Step {step.stepOrder + 1}</h3>
        <div className="h-10" style={{ minHeight: '40px' }}>
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.Trash}
            removeBorder
            disabled={guide.steps.length === 1}
            onClick={() => setShowDeleteModal(true)}
          />
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.MoveUp}
            removeBorder
            disabled={step.stepOrder === 0}
            onClick={() => moveStepUp(step.uuid)}
          />
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.MoveDown}
            removeBorder
            disabled={step.stepOrder + 1 === guide.steps.length}
            onClick={() => moveStepDown(step.uuid)}
          />
          <IconButton className="float-right ml-2" iconName={IconTypes.RobotIconSolid} removeBorder onClick={() => setModalGenerateAIOpen(true)} />
          <IconButton className="float-right ml-2" iconName={IconTypes.GuideAddIcon} removeBorder onClick={() => setModalGuidInputOrQuestionOpen(true)} />
        </div>
      </StepContainer>

      <div className="w-full mb-4">
        <Input modelValue={step.stepName} error={!!inputError('stepName')} maxLength={32} onUpdate={(e) => updateStepName(e?.toString() || '')}>
          Name*
        </Input>
      </div>
      <MarkdownEditor
        id={step.uuid}
        modelValue={step.content}
        placeholder={$t(`guide.step.contents`)}
        onUpdate={updateStepContent}
        spaceId={space.id}
        objectId={guide.uuid}
        imageType={ImageType.Guide}
        className="w-full"
      />

      {stepItemsForStepper.map((stepItem, index) => {
        const itemError = stepErrors?.stepItems?.[stepItem.uuid];
        const hasError = !!itemError;
        return (
          <StepItemWrapper style={{ margin: '50px 0 0 0' }} key={stepItem.uuid} className="ml-4  p-4 mb-4 w-full" hasError={hasError}>
            {stepItem.isQuestion ? (
              <>
                <CreateQuestion
                  addChoice={addChoice}
                  item={stepItem as GuideQuestionFragment}
                  removeChoice={removeChoice}
                  removeQuestion={removeStepItem}
                  setAnswer={setAnswer}
                  updateChoiceContent={updateChoiceContent}
                  updateQuestionDescription={updateQuestionDescription}
                  updateQuestionExplanation={updateQuestionExplanation}
                  updateAnswers={updateAnswers}
                  questionErrors={itemError as QuestionError}
                  updateQuestionType={updateQuestionType}
                />
              </>
            ) : stepItem.isDiscord ? (
              <CreateConnectDiscord item={stepItem} removeDiscord={removeStepItem} />
            ) : (
              <CreateUserInput
                removeUserInput={removeStepItem}
                item={{ ...stepItem, order: index }}
                userInputErrors={itemError}
                updateUserInputLabel={updateUserInputLabel}
                updateUserInputPrivate={updateUserInputPrivate}
                updateUserInputRequired={updateUserInputRequired}
              />
            )}
          </StepItemWrapper>
        );
      })}
      {modalGuidInputOrQuestionOpen && (
        <AddStepItemModal
          open={modalGuidInputOrQuestionOpen}
          hasDiscordEnabled={guideHasDiscordEnabled}
          onClose={() => setModalGuidInputOrQuestionOpen(false)}
          onAddQuestion={addQuestion}
          onAddInput={addInput}
          onAddDiscord={addDiscord}
        />
      )}
      {modalGenerateAIOpen && (
        <AddContentOrQuestionAIModal
          open={modalGenerateAIOpen}
          onClose={() => setModalGenerateAIOpen(false)}
          onGenerateContent={() => setModalGenerateContentUsingAIOpen(true)}
          onGenerateQuestions={() => setModalGenerateQuestionsUsingAIOpen(true)}
        />
      )}
      {modalGenerateContentUsingAIOpen && (
        <GenerateContentUsingAIModal
          open={modalGenerateContentUsingAIOpen}
          onClose={() => setModalGenerateContentUsingAIOpen(false)}
          modalTitle={'Generate Content Using AI'}
          guidelines={defaultGuidelines}
          onGenerateContent={(generatedContent) => {
            if (generatedContent) {
              updateStepContent(generatedContent);
              setModalGenerateContentUsingAIOpen(false);
            } else {
              showNotification({
                heading: 'Error',
                type: 'error',
                message: 'For some reason, we were unable to generate content. Please try again.',
              });
            }
          }}
          generatePrompt={(topic: string, guidelines: string, contents: string) => generateGuideContentPrompt(topic, guidelines, contents, guide)}
        />
      )}
      {modalGenerateQuestionsUsingAIOpen && (
        <GenerateQuestionUsingAIModal
          open={modalGenerateQuestionsUsingAIOpen}
          onClose={() => setModalGenerateQuestionsUsingAIOpen(false)}
          modalTitle={'Generate Content Using AI'}
          onGenerateContent={(questions) => {
            addGeneratedQuestions(questions);
            setModalGenerateQuestionsUsingAIOpen(false);
          }}
          generatePrompt={(topic: string, numberOfQuestions: number, contents: string) => generateQuestionsPrompt(topic, numberOfQuestions, contents)}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={`Delete Step - ${step.stepName}`}
          deleteButtonText="Delete Step"
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            removeStep(step.uuid);
            setShowDeleteModal(false);
          }}
        />
      )}
    </div>
  );
};

export default GuideStep;
