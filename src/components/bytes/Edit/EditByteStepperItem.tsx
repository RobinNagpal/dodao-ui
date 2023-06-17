import IconButton from '@/components/core/buttons/IconButton';
import CreateConnectDiscord from '@/components/app/Common/CreateDiscordConnect';
import CreateQuestion from '@/components/app/Common/CreateQuestion';
import CreateUserInput from '@/components/app/Common/CreateUserInput';
import { IconTypes } from '@/components/core/icons/IconTypes';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import AddStepItemModal from '@/components/app/Modal/AddStepItemModal';
import { EditByteStep, EditByteType } from '@/components/bytes/Edit/useEditByte';
import {
  ByteQuestion,
  ByteQuestionFragmentFragment,
  ByteUserInputFragmentFragment,
  GuideQuestion,
  SpaceWithIntegrationsFragment,
  StepItemInputGenericInput,
} from '@/graphql/generated/generated-types';
import { InputType, QuestionType, UserDiscordConnectType } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import { QuestionError, StepError } from '@/types/errors/error';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

interface EditByteStepperItemProps {
  space: SpaceWithIntegrationsFragment;
  byte: EditByteType;
  byteErrors?: ByteErrors;
  step: EditByteStep;
  stepIndex: number;
  stepErrors?: StepError;
  byteHasDiscordEnabled: boolean;
  moveStepUp: (uuid: string) => void;
  moveStepDown: (uuid: string) => void;
  removeStep: (uuid: string) => void;
  updateStep: (step: EditByteStep) => void;
}

const StyledStepItemContainer = styled.div`
  width: calc(100% - 3rem);
`;

const StepItemWrapper = styled.div<{ hasError: boolean }>`
  border: ${(props) => (props.hasError ? '1px solid red' : '1px solid var(--border-color)')};
  border-radius: 0.5rem;
`;

export default function EditByteStepperItem({
  space,
  byte,
  byteErrors,
  step,
  stepIndex,
  stepErrors,
  byteHasDiscordEnabled,
  moveStepUp,
  moveStepDown,
  removeStep,
  updateStep,
}: EditByteStepperItemProps) {
  const [modalByteInputOrQuestionOpen, setModalByteInputOrQuestionOpen] = useState(false);

  const updateStepContent = (content: string) => {
    updateStep({ ...step, content });
  };

  const updateQuestionDescription = (questionId: string, content: string) => {
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
  };

  function updateChoiceContent(questionId: string, choiceKey: string, content: string) {
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        const choices = (question as ByteQuestionFragmentFragment).choices.map((choice) => {
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

  const stepItemsForStepper = [
    ...step.stepItems.map(
      (
        q: StepItemInputGenericInput,
        index: number
      ): StepItemInputGenericInput & {
        isQuestion: boolean;
        isDiscord: boolean;
      } => ({
        ...q,
        isQuestion: q.type === QuestionType.MultipleChoice || q.type === QuestionType.SingleChoice,
        isDiscord: q.type === UserDiscordConnectType,
      })
    ),
  ];

  function newChoiceKey() {
    return uuidv4().split('-')[0];
  }

  function addChoice(questionId: string) {
    const key = newChoiceKey();
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        const choices = [...(question as ByteQuestionFragmentFragment).choices, { key, content: '' }];
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

  function updateQuestionType(questionId: string, type: QuestionType) {
    const stepItems = step.stepItems.map((question): StepItemInputGenericInput => {
      if (question.uuid === questionId) {
        return {
          ...question,
          answerKeys: [],
          type,
        };
      } else {
        return question;
      }
    });
    updateStep({ ...step, stepItems });
  }

  function updateExplanation(questionId: string, explanation: string) {
    const stepItems = step.stepItems.map((question) => {
      if (question.uuid === questionId) {
        return {
          ...question,
          explanation: explanation,
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
          choices: (question as ByteQuestionFragmentFragment).choices.filter((choice) => choice.key !== choiceKey),
          answerKeys: (question as GuideQuestion).answerKeys.filter((answerKey) => answerKey !== choiceKey),
        };
      } else {
        return question;
      }
    });

    updateStep({ ...step, stepItems });
  }

  function removeStepItem(itemUuid: string) {
    const filteredQuestions = step.stepItems.filter((stepItem: { uuid: string }) => stepItem.uuid !== itemUuid);

    const itemsWithIndex: ByteQuestionFragmentFragment[] = filteredQuestions.map((question, index) => ({
      ...question,
      order: index,
    })) as ByteQuestionFragmentFragment[];

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
        const existingAnswerKeys = (question as ByteQuestionFragmentFragment).answerKeys;
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
        const answerKeys = isEqual((question as ByteQuestionFragmentFragment).answerKeys, [choiceKey]) ? [] : [choiceKey];
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
    const question = {
      uuid: uuidv4(),
      content: '',
      choices: [
        {
          key: newChoiceKey(),
          content: '',
          order: 0,
        },
        {
          key: newChoiceKey(),
          content: '',
          order: 1,
        },
      ],
      answerKeys: [],
      order: step.stepItems.length,
      type: type,
    };
    const stepItems = [...(step.stepItems || []), question];
    updateStep({ ...step, stepItems });
  }

  function addInput(type: InputType) {
    const input: ByteUserInputFragmentFragment = {
      uuid: uuidv4(),
      label: 'Label',
      type: type,
      required: false,
    };
    const inputs = [...(step.stepItems || []), input];
    updateStep({ ...step, stepItems: inputs });
  }

  function addDiscord() {
    const discord = {
      uuid: uuidv4(),
      order: step.stepItems.length,
      type: UserDiscordConnectType,
    };
    const stepItems = [...(step.stepItems || []), discord];
    updateStep({ ...step, stepItems });
  }

  return (
    <StyledStepItemContainer className="w-full">
      <div className={`border rounded rounded-md p-4 mb-4 ml-4 w-full ${byteErrors?.steps?.[step.uuid] ? 'error-event-border' : ''}`}>
        <h3 className="float-left">Step {stepIndex + 1}</h3>
        <div className="h-10" style={{ minHeight: '40px' }}>
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.Trash}
            removeBorder
            disabled={byte.steps.length === 1}
            onClick={() => removeStep(step.uuid)}
          />
          <IconButton className="float-right ml-2" iconName={IconTypes.MoveUp} removeBorder disabled={stepIndex === 0} onClick={() => moveStepUp(step.uuid)} />
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.MoveDown}
            removeBorder
            disabled={stepIndex + 1 === byte.steps.length}
            onClick={() => moveStepDown(step.uuid)}
          />
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.GuideAddIcon}
            disabled={step.stepItems.length >= 1}
            removeBorder
            onClick={() => setModalByteInputOrQuestionOpen(true)}
          />
        </div>
        <MarkdownEditor
          id={step.uuid}
          modelValue={step.content}
          placeholder={'Contents'}
          onUpdate={updateStepContent}
          spaceId={space.id}
          objectId={byte.id || 'unknown_byte_id'}
          imageType="Byte"
          editorStyles={{ height: '200px' }}
        />
      </div>
      {stepItemsForStepper.map((stepItem, index) => (
        <StepItemWrapper key={stepItem.uuid} className="ml-4 mt-2 w-full" hasError={!!stepErrors?.stepItems?.[stepItem.uuid]}>
          {stepItem.isQuestion ? (
            <>
              <CreateQuestion
                addChoice={addChoice}
                item={stepItem as ByteQuestion}
                removeChoice={removeChoice}
                removeQuestion={removeStepItem}
                setAnswer={setAnswer}
                updateChoiceContent={updateChoiceContent}
                updateQuestionDescription={updateQuestionDescription}
                updateAnswers={updateAnswers}
                questionErrors={stepErrors?.stepItems?.[stepItem.uuid] as QuestionError}
                updateQuestionType={updateQuestionType}
              />
              <MarkdownEditor
                id={`${stepItem.uuid}_explanation`}
                modelValue={stepItem.explanation || ''}
                placeholder="Explanation (2-3 lines)"
                editorStyles={{ height: '150px' }}
                error={!!stepErrors?.stepItems?.[stepItem.uuid]}
                onUpdate={(content) => updateExplanation(stepItem.uuid, content)}
                spaceId={space.id}
                objectId={`${byte.id}/${stepItem.uuid}`}
                imageType="Byte"
              />
            </>
          ) : stepItem.isDiscord ? (
            <CreateConnectDiscord item={stepItem} removeDiscord={removeStepItem} />
          ) : (
            <CreateUserInput
              removeUserInput={removeStepItem}
              item={{ ...stepItem, order: index }}
              userInputErrors={stepErrors?.stepItems?.[stepItem.uuid]}
              updateUserInputLabel={updateUserInputLabel}
              updateUserInputPrivate={updateUserInputPrivate}
              updateUserInputRequired={updateUserInputRequired}
            />
          )}
        </StepItemWrapper>
      ))}
      {modalByteInputOrQuestionOpen && (
        <AddStepItemModal
          open={modalByteInputOrQuestionOpen}
          hasDiscordEnabled={byteHasDiscordEnabled}
          onClose={() => setModalByteInputOrQuestionOpen(false)}
          onAddQuestion={addQuestion}
          onAddInput={addInput}
          onAddDiscord={addDiscord}
        />
      )}
    </StyledStepItemContainer>
  );
}
