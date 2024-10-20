import { ImageDisplayMode } from '@/graphql/generated/generated-types';
import { CompletionScreenDto } from '@/types/bytes/ByteDto';
import { ByteStepInput, EditByteStep, EditByteType, StepItemInputGenericInput, UpsertByteInput } from '@/types/request/ByteRequests';
import { Question, UserInput } from '@/types/stepItems/stepItemDto';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { isQuestion, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { ByteErrors, CompletionScreenErrors, CompletionScreenItemErrors } from '@dodao/web-core/types/errors/byteErrors';
import { StepError } from '@dodao/web-core/types/errors/error';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { v4 as uuidv4 } from 'uuid';

const questionContentLimit = 1024;
const inputLabelLimit = 32;
const stepContentLimit = 14400;
const byteExceptContentLimit = 64;
const choiceContentLimit = 256;
const nameLimit = 40;

export type KeyOfByteInput = keyof EditByteType;

export type UpdateByteFunctions = {
  moveStepDown: (stepUuid: string) => void;
  addStep: () => void;
  includeSteps: (newSteps: EditByteStep[]) => void;
  updateByteErrorField: (field: KeyOfByteInput, value: any) => void;
  updateByteField: (field: KeyOfByteInput, value: any) => void;
  updateStep: (step: EditByteStep) => void;
  removeStep: (stepUuid: string) => void;
  moveStepUp: (stepUuid: string) => void;
  setByte: (byte: EditByteType) => void;
  updateCompletionScreen: (field: keyof CompletionScreenDto, value: any) => void;
  removeCompletionScreen: () => void;
  addCallToActionButtonLink: (uuid: string, link: string) => void;
  addCallToActionButtonLabel: (uuid: string, label: string) => void;
  removeCallToActionButton: (uuid: string) => void;
};

export interface GeneratedByte {
  id: string;
  name: string;
  content: string;
  steps: {
    name: string;
    content: string;
  }[];
}

export function editByteCommonFunctions(setByte: (value: ((prevState: EditByteType) => EditByteType) | EditByteType) => void) {
  const removeStepFn = (stepUuid: string) => {
    setByte((prevByte) => {
      const updatedSteps = prevByte.steps
        .filter((s) => s.uuid !== stepUuid)
        .map((step, index) => ({
          ...step,
          order: index,
        }));

      return { ...prevByte, steps: updatedSteps };
    });
  };

  const updateStepFn = (step: EditByteStep) => {
    setByte((prevByte) => {
      const updatedSteps = prevByte.steps.map((s) => {
        if (s.uuid === step.uuid) {
          return step;
        } else {
          return s;
        }
      });

      return { ...prevByte, steps: updatedSteps };
    });
  };

  const updateCompletionScreenFn = (field: keyof CompletionScreenDto, value: any) => {
    setByte((prevByte) => {
      const uuid = uuidv4();
      const defaultCompletionScreen: CompletionScreenDto = {
        content: '',
        name: '',
        imageUrl: '',
        items: [],
        uuid: uuid,
      };
      const currentCompletionScreen = prevByte.completionScreen || defaultCompletionScreen;

      if (field === 'items' && value !== undefined) {
        const updatedItems = [...currentCompletionScreen.items, value];
        return { ...prevByte, completionScreen: { ...currentCompletionScreen, items: updatedItems } };
      }

      const updatedCompletionScreen = {
        ...currentCompletionScreen,
        [field]: value !== undefined ? value : defaultCompletionScreen[field],
      };

      return { ...prevByte, completionScreen: updatedCompletionScreen };
    });
  };

  const addCallToActionButtonLabelFn = (uuid: string, label: string) => {
    setByte((prevByte) => {
      const currentCompletionScreen = prevByte.completionScreen!;
      const updatedCompletionScreen = {
        ...currentCompletionScreen,
        items: currentCompletionScreen?.items ? [...currentCompletionScreen.items] : [],
      };

      const itemIndex = updatedCompletionScreen.items.findIndex((item) => item.uuid === uuid);
      if (itemIndex !== -1) {
        updatedCompletionScreen.items[itemIndex] = { ...updatedCompletionScreen.items[itemIndex], label };
      }

      return { ...prevByte, completionScreen: updatedCompletionScreen };
    });
  };

  const addCallToActionButtonLinkFn = (uuid: string, link: string) => {
    setByte((prevByte) => {
      const currentCompletionScreen = prevByte.completionScreen!;

      const updatedCompletionScreen = {
        ...currentCompletionScreen,
        items: currentCompletionScreen.items ? [...currentCompletionScreen.items] : [],
      };

      const itemIndex = updatedCompletionScreen.items.findIndex((item) => item.uuid === uuid);
      if (itemIndex !== -1) {
        updatedCompletionScreen.items[itemIndex] = { ...updatedCompletionScreen.items[itemIndex], link };
      }

      return { ...prevByte, completionScreen: updatedCompletionScreen };
    });
  };

  const removeCallToActionButtonFn = (buttonUuid: string) => {
    setByte((prevByte) => {
      const currentCompletionScreen = prevByte.completionScreen ? { ...prevByte.completionScreen } : null;
      if (!currentCompletionScreen || !currentCompletionScreen.items) {
        return prevByte;
      }

      const updatedItems = currentCompletionScreen.items.filter((item) => item.uuid !== buttonUuid);

      const updatedCompletionScreen = {
        ...currentCompletionScreen,
        items: updatedItems,
      };

      return { ...prevByte, completionScreen: updatedCompletionScreen };
    });
  };

  const moveStepUpFn = (stepUuid: string) => {
    setByte((prevByte) => {
      const steps = prevByte.steps;
      const index = steps.findIndex((step) => step.uuid === stepUuid);
      if (index > 0) {
        [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
      }

      return { ...prevByte, steps: [...steps] };
    });
  };

  const moveStepDownFn = (stepUuid: string) => {
    setByte((prevByte) => {
      const newSteps = [...prevByte.steps];
      const index = newSteps.findIndex((step) => step.uuid === stepUuid);
      if (index >= 0 && index < newSteps.length - 1) {
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      }

      return { ...prevByte, steps: newSteps };
    });
  };

  function validateCompletionScreen(completionScreen?: CompletionScreenDto): CompletionScreenErrors {
    let errors: CompletionScreenErrors = {};

    if (completionScreen && !completionScreen?.name?.trim()) {
      errors.name = true;
    }
    if (completionScreen && !completionScreen?.content?.trim()) {
      errors.content = true;
    }

    let itemErrors: Record<string, CompletionScreenItemErrors> = {};
    completionScreen?.items?.forEach((item) => {
      let itemError: CompletionScreenItemErrors = {};
      if (item.label == '' || item.label == null) {
        itemError.label = true;
      }
      if (item.link == '' || item.label == null) {
        itemError.link = true;
      }
      if (Object.keys(itemError).length > 0) {
        itemErrors[item.uuid] = itemError;
      }
    });

    if (Object.keys(itemErrors).length > 0) {
      errors.items = itemErrors;
    }

    return errors;
  }

  const validateByteFn = (byte: EditByteType, byteErrors: ByteErrors) => {
    const updatedByteErrors: ByteErrors = { ...byteErrors };
    updatedByteErrors.name = undefined;
    if (!byte.name || byte.name.length > nameLimit) {
      updatedByteErrors.name = true;
    }
    updatedByteErrors.content = undefined;
    if (!byte.content || byte.content?.length > byteExceptContentLimit) {
      updatedByteErrors.content = true;
    }
    updatedByteErrors.steps = undefined;
    byte.steps.forEach((step: ByteStepInput) => {
      const stepError: StepError = {};
      if (!step.name || step.name.length > nameLimit) {
        stepError.stepName = true;
      }
      if (step.content?.length > stepContentLimit) {
        stepError.content = true;
      }
      step.stepItems.forEach((item: StepItemInputGenericInput) => {
        if (isQuestion(item)) {
          validateQuestion(item as Question, stepError);
        } else if (isUserInput(item)) {
          validateUserInput(item as UserInput, stepError);
        }
      });
      if (Object.keys(stepError).length > 0) {
        if (!updatedByteErrors.steps) {
          updatedByteErrors.steps = {};
        }
        updatedByteErrors.steps[step.uuid] = stepError;
      }
    });

    const completionScreenErrors = validateCompletionScreen(byte.completionScreen || undefined);
    if (Object.keys(completionScreenErrors).length > 0) {
      updatedByteErrors.completionScreen = completionScreenErrors;
    }
    return updatedByteErrors;
  };

  function getByteInputFn(byte: EditByteType): UpsertByteInput {
    return {
      content: byte.content,
      id: byte.id || slugify(byte.name) + '-' + uuidv4().toString().substring(0, 4),
      name: byte.name,
      steps: byte.steps,
      thumbnail: byte.thumbnail,
      created: byte.created,
      admins: byte.admins,
      tags: byte.tags,
      priority: byte.priority,
      videoUrl: byte.videoUrl,
      completionScreen: byte.completionScreen,
    };
  }

  return {
    updateStepFn,
    moveStepUpFn,
    moveStepDownFn,
    removeStepFn,
    validateByteFn,
    getByteInputFn,
    updateCompletionScreenFn,
    addCallToActionButtonLabelFn,
    addCallToActionButtonLinkFn,
    removeCallToActionButtonFn,
  };
}
