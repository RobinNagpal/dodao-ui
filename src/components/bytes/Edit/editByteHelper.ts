import {
  ByteQuestionFragmentFragment,
  ByteStepFragment,
  ByteStepInput,
  CompletionScreen,
  StepItemInputGenericInput,
  UpsertByteInput,
  UpsertProjectByteInput,
} from '@/graphql/generated/generated-types';
import { isQuestion, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { UserInput } from '@/types/deprecated/models/GuideModel';
import { ByteErrors } from '@/types/errors/byteErrors';
import { StepError } from '@/types/errors/error';
import { slugify } from '@/utils/auth/slugify';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { v4 as uuidv4 } from 'uuid';

const questionContentLimit = 1024;
const inputLabelLimit = 32;
const stepContentLimit = 14400;
const byteExceptContentLimit = 64;
const choiceContentLimit = 256;
const nameLimit = 40;
export interface EditByteStepItem extends Omit<StepItemInputGenericInput, 'order'> {}

export interface EditByteStep extends Omit<ByteStepInput, 'stepItems'>, Omit<ByteStepFragment, 'stepItems'> {
  stepItems: EditByteStepItem[];
}

export interface EditByteType extends UpsertByteInput {
  id: string;
  isPristine: boolean;
  byteExists: boolean;
  steps: EditByteStep[];
}

export interface EditProjectByteType extends UpsertProjectByteInput {
  id: string;
  isPristine: boolean;
  byteExists: boolean;
  steps: EditByteStep[];
}

export type KeyOfByteInput = keyof EditByteType | keyof EditProjectByteType;

export type UpdateByteFunctions = {
  moveStepDown: (stepUuid: string) => void;
  addStep: () => void;
  includeSteps: (newSteps: EditByteStep[]) => void;
  updateByteErrorField: (field: KeyOfByteInput, value: any) => void;
  updateByteField: (field: KeyOfByteInput, value: any) => void;
  updateStep: (step: EditByteStep) => void;
  removeStep: (stepUuid: string) => void;
  moveStepUp: (stepUuid: string) => void;
  setByte: (byte: EditByteType | EditProjectByteType) => void;
  updateCompletionScreen: (field: keyof CompletionScreen, value: any) => void;
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

  const updateCompletionScreenFn = (field: keyof CompletionScreen, value: any) => {
    setByte((prevByte) => {
      const defaultCompletionScreen: CompletionScreen = {
        content: '',
        name: '',
        imageUrl: '',
        items: [],
        uuid: '',
      };
      const currentCompletionScreen = prevByte.completionScreen || defaultCompletionScreen;

      const updatedCompletionScreen = {
        ...currentCompletionScreen,
        [field]: value !== undefined ? value : defaultCompletionScreen[field],
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
        stepError.name = true;
      }
      if (step.content?.length > stepContentLimit) {
        stepError.content = true;
      }
      step.stepItems.forEach((item: StepItemInputGenericInput) => {
        if (isQuestion(item)) {
          validateQuestion(item as ByteQuestionFragmentFragment, stepError);
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
    return updatedByteErrors;
  };

  function getByteInputFn(byte: EditByteType): UpsertByteInput {
    return {
      content: byte.content,
      id: byte.id || slugify(byte.name) + '-' + uuidv4().toString().substring(0, 4),
      name: byte.name,
      steps: byte.steps.map((s) => ({
        content: s.content,
        name: s.name,
        stepItems: s.stepItems.map((si) => ({
          type: si.type,
          uuid: si.uuid,
          answerKeys: si.answerKeys,
          choices: si.choices?.map((c) => ({ key: c.key, content: c.content })),
          content: si.content,
          questionType: si.questionType,
          label: si.label,
          required: si.required,
          explanation: si.explanation,
        })),
        imageUrl: s.imageUrl,
        uuid: s.uuid,
      })),
      thumbnail: byte.thumbnail,
      created: byte.created,
      admins: byte.admins,
      tags: byte.tags,
      priority: byte.priority,
      videoUrl: byte.videoUrl,
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
  };
}
