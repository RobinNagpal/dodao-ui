import SelectImageInputModal from '@/components/app/Image/SelectImageInputModal';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { EditByteStep, EditByteType } from '@/components/bytes/Edit/editByteHelper';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import CreateConnectDiscord from '@dodao/web-core/components/app/Common/CreateDiscordConnect';
import CreateQuestion from '@/components/app/Common/CreateQuestion';
import CreateUserInput from '@dodao/web-core/components/app/Common/CreateUserInput';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import AddStepItemModal from '@dodao/web-core/components/app/Modal/StepItem/AddStepItemModal';
import Input from '@dodao/web-core/components/core/input/Input';
import { InputWithButton } from '@dodao/web-core/components/core/input/InputWithButton';
import {
  ByteQuestion,
  ByteQuestionFragmentFragment,
  ByteUserInputFragmentFragment,
  GuideQuestion,
  ImageType,
  SpaceWithIntegrationsFragment,
  StepItemInputGenericInput,
  ImageDisplayMode,
} from '@/graphql/generated/generated-types';
import { InputType, QuestionType, UserDiscordConnectType } from '@dodao/web-core/types/deprecated/models/enums';
import { ByteErrors } from '@dodao/web-core/types/errors/byteErrors';
import { QuestionError, StepError } from '@dodao/web-core/types/errors/error';
import isEqual from 'lodash/isEqual';
import React, { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { findClosestColor } from '@dodao/web-core/utils/colors/findClosestColor';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

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
  width: 100%;
`;

const StepItemWrapper = styled.div<{ hasError: boolean }>`
  border: ${(props) => (props.hasError ? '1px solid red' : '1px solid var(--border-color)')};
  border-radius: 0.5rem;
  padding: 1rem;
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
  const displayModeSelect: StyledSelectItem[] = [
    {
      label: 'Normal',
      id: ImageDisplayMode.Normal,
    },
    {
      label: 'Full Screen Image',
      id: ImageDisplayMode.FullScreenImage,
    },
  ];
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

  const updateStepName = (name: string) => {
    updateStep({ ...step, name });
  };

  const updateStepCaption = (caption: string) => {
    updateStep({ ...step, content: caption });
  };

  const updateStepImageUrl = (imageUrl: string | null) => {
    updateStep({ ...step, imageUrl });
  };
  const updateStepDisplayMode = (displayMode: string | null) => {
    updateStep({ ...step, displayMode: displayMode?.toString() || ImageDisplayMode.Normal });
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const primaryColor = findClosestColor(space.themeColors?.primaryColor || '#000CCC');
  const backgroundColor = findClosestColor(space.themeColors?.bgColor || '#FFFFFF');

  const promptForImagePrompt = `
Let's create an image prompt based on the below details "${byte?.name}". 

- Topic: ${byte?.name} - ${byte?.content}
- Details: ${step.name} - ${step.content}

Create an image prompt that captures the essence of the detail, the topic is just provided for high level guidance. 

Aim to include elements that mirror its themes, emotions, or critical aspects. 

The objective is to produce an image that visually communicates this particular detail effectively and should be minimalistic.

For background of the image, use the color ${backgroundColor} and for the primary color use ${primaryColor}.
`;

  const [selectImageUploadModal, setSelectImageUploadModal] = useState(false);
  return (
    <StyledStepItemContainer className="w-full">
      <div className={`${byteErrors?.steps?.[step.uuid] ? 'error-event-border' : ''}`}>
        <div style={{ minHeight: '20px' }}>
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.Trash}
            removeBorder
            disabled={byte.steps.length === 1}
            onClick={() => setShowDeleteModal(true)}
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
        <div className="w-full mb-4">
          <Input modelValue={step.name} maxLength={32} onUpdate={(e) => updateStepName(e?.toString() || '')}>
            Name*
          </Input>
        </div>

        <div className="w-full mb-4">
          <InputWithButton
            buttonLabel={'Set Image'}
            inputLabel={'Image Url'}
            onButtonClick={() => setSelectImageUploadModal(true)}
            onInputUpdate={(e) => updateStepImageUrl(e?.toString() || '')}
            inputModelValue={step.imageUrl || ''}
          />
          {step.imageUrl && <img src={step.imageUrl} style={{ height: '150px' }} className="my-2" />}
        </div>
        <div className="w-full mb-4">
          <StyledSelect
            label="Image Display Mode"
            selectedItemId={step.displayMode}
            items={displayModeSelect}
            setSelectedItemId={(value) => updateStepDisplayMode(value!)}
          />
        </div>
        {step.displayMode === ImageDisplayMode.FullScreenImage ? (
          <Input modelValue={step.content} maxLength={32} onUpdate={(e) => updateStepCaption(e?.toString() || '')}>
            Caption*
          </Input>
        ) : (
          <MarkdownEditor
            id={step.uuid}
            modelValue={step.content}
            generateImagePromptFn={() => promptForImagePrompt}
            placeholder={'Contents'}
            label={'Step Contents'}
            onUpdate={updateStepContent}
            spaceId={space.id}
            objectId={byte.id || 'unknown_byte_id'}
            imageType={ImageType.Tidbits}
            editorStyles={{ height: '200px' }}
          />
        )}
      </div>
      {stepItemsForStepper.map((stepItem, index) => (
        <StepItemWrapper key={stepItem.uuid} className="mt-2" hasError={!!stepErrors?.stepItems?.[stepItem.uuid]}>
          {stepItem.isQuestion ? (
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
              updateQuestionExplanation={updateExplanation}
            />
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

      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Step'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            removeStep(step.uuid);
            setShowDeleteModal(false);
          }}
        />
      )}
      {selectImageUploadModal && (
        <SelectImageInputModal
          open={selectImageUploadModal}
          onClose={() => setSelectImageUploadModal(false)}
          imageType={ImageType.Tidbits}
          objectId={byte.id || 'unknown_byte_id'}
          spaceId={space.id}
          generateImagePromptFn={() => promptForImagePrompt}
          imageUploaded={(imageUrl) => {
            updateStepImageUrl(imageUrl);
            setSelectImageUploadModal(false);
          }}
        />
      )}
    </StyledStepItemContainer>
  );
}
