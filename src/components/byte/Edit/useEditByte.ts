import {
  ByteQuestionFragment,
  ByteStepFragment,
  ByteStepInput,
  SpaceWithIntegrationsFragment,
  StepItemInputGenericInput,
  UpsertByteInput,
  useQueryByteDetailsQuery,
  useUpsertByteMutation,
} from '@/graphql/generated/generated-types';
import useNotification from '@/hooks/useNotification';
import { isQuestion, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { UserInput } from '@/types/deprecated/models/GuideModel';
import { ByteErrors } from '@/types/errors/byteErrors';
import { StepError } from '@/types/errors/error';
import { emptyByte } from '@/utils/byte/EmptyByte';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import orderBy from 'lodash/orderBy';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';

const questionContentLimit = 1024;
const inputLabelLimit = 32;
const stepContentLimit = 14400;
const byteExceptContentLimit = 64;
const choiceContentLimit = 256;
const nameLimit = 32;

export interface EditByteStepItem extends StepItemInputGenericInput {}

export interface EditByteStep extends Omit<ByteStepInput, 'stepItems'>, Omit<ByteStepFragment, 'stepItems'> {
  stepItems: EditByteStepItem[];
}
export interface EditByteType extends UpsertByteInput {
  id?: string;
  isPristine: boolean;
  byteExists: boolean;
  steps: EditByteStep[];
}

type KeyOfByteInput = keyof EditByteType;

export type UpdateByteFunctions = {
  moveStepDown: (stepUuid: string) => void;
  addStep: () => void;
  updateByteErrorField: (field: KeyOfByteInput, value: any) => void;
  updateByteField: (field: KeyOfByteInput, value: any) => void;
  updateStep: (step: EditByteStep) => void;
  removeStep: (stepUuid: string) => void;
  moveStepUp: (stepUuid: string) => void;
};

export function useEditByte(space: SpaceWithIntegrationsFragment, byteId: string | null) {
  const router = useRouter();
  const emptyByteModel = emptyByte();
  const [byteRef, setByteRef] = useState<EditByteType>({
    ...emptyByteModel,
    byteExists: false,
  });
  const [byteErrors, setByteErrors] = useState<ByteErrors>({});
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);

  const [byteCreating, setByteCreating] = useState<boolean>(false);

  const { refetch: queryByteDetails, data, error } = useQueryByteDetailsQuery({ skip: true });
  const [upsertByteMutation, { data: upsertResponse, error: UpsertError }] = useUpsertByteMutation();
  const { showNotification } = useNotification();

  const initialize = useCallback(async () => {
    if (byteId) {
      const result = await queryByteDetails({ byteId: byteId, spaceId: space.id });
      const byte = result.data.byte;
      setByteRef({
        ...byte,
        byteExists: true,
        isPristine: true,
      });
      setByteLoaded(true);
    } else {
      setByteLoaded(true);
    }
  }, [byteId, space]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Add other
  const updateStep = useCallback((step: EditByteStep) => {
    setByteRef((prevByte) => {
      const updatedSteps = prevByte.steps.map((s) => {
        if (s.uuid === step.uuid) {
          return step;
        } else {
          return s;
        }
      });

      return { ...prevByte, steps: updatedSteps };
    });
  }, []);

  const moveStepUp = useCallback((stepUuid: string) => {
    setByteRef((prevByte) => {
      const stepIndex = prevByte.steps.findIndex((s) => s.uuid === stepUuid);
      const updatedSteps = [...prevByte.steps];
      updatedSteps[stepIndex - 1].order = stepIndex;
      updatedSteps[stepIndex].order = stepIndex - 1;

      return { ...prevByte, steps: orderBy(updatedSteps, 'order') };
    });
  }, []);

  const moveStepDown = useCallback((stepUuid: string) => {
    setByteRef((prevByte) => {
      const stepIndex = prevByte.steps.findIndex((s) => s.uuid === stepUuid);
      const updatedSteps = [...prevByte.steps];
      updatedSteps[stepIndex + 1].order = stepIndex;
      updatedSteps[stepIndex].order = stepIndex + 1;

      return { ...prevByte, steps: orderBy(updatedSteps, 'order') };
    });
  }, []);

  const removeStep = useCallback((stepUuid: string) => {
    setByteRef((prevByte) => {
      const updatedSteps = prevByte.steps
        .filter((s) => s.uuid !== stepUuid)
        .map((step, index) => ({
          ...step,
          order: index,
        }));

      return { ...prevByte, steps: updatedSteps };
    });
  }, []);

  const addStep = useCallback(() => {
    const uuid = uuidv4();
    setByteRef((prevByte) => {
      const updatedSteps = [
        ...prevByte.steps,
        {
          uuid: uuid,
          name: `Step ${prevByte.steps.length + 1}`,
          content: '',
          stepItems: [],
          order: prevByte.steps.length,
        },
      ];

      return { ...prevByte, steps: updatedSteps };
    });
  }, []);

  const validateByte = useCallback(
    (byte: EditByteType) => {
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
            validateQuestion(item as ByteQuestionFragment, stepError);
          } else if (isUserInput(item)) {
            validateUserInput(item as UserInput, stepError);
          }
        });
        if (Object.keys(stepError).length > 0) {
          if (!updatedByteErrors.steps) {
            updatedByteErrors.steps = {};
          }
          updatedByteErrors.steps[step.order];
          updatedByteErrors.steps[step.order] = stepError;
        }
      });
      setByteErrors(updatedByteErrors);
      return Object.values(updatedByteErrors).filter((v) => !!v).length === 0;
    },
    [validateQuestion, validateUserInput, byteErrors]
  );

  const updateByteField = useCallback((field: KeyOfByteInput, value: any) => {
    setByteRef((prevByte) => ({
      ...prevByte,
      [field]: value,
    }));
  }, []);

  const updateByteErrorField = useCallback((field: KeyOfByteInput, value: any) => {
    setByteErrors((prevByteErrors) => ({
      ...prevByteErrors,
      [field]: value,
    }));
  }, []);

  const updateByteFunctions: UpdateByteFunctions = {
    addStep,
    moveStepUp,
    moveStepDown,
    removeStep,
    updateByteErrorField,
    updateByteField,
    updateStep,
  };

  function getByteInput(): UpsertByteInput {
    return {
      content: byteRef.content,
      id: byteRef.id,
      name: byteRef.name,
      steps: byteRef.steps.map((s) => ({
        content: s.content,
        name: s.name,
        order: s.order,
        stepItems: s.stepItems.map((si) => ({
          type: si.type,
          order: si.order,
          uuid: si.uuid,
          answerKeys: si.answerKeys,
          choices: si.choices,
          content: si.content,
          questionType: si.questionType,
          label: si.label,
          required: si.required,
          explanation: si.explanation,
        })),
        uuid: s.uuid,
      })),
      publishStatus: byteRef.publishStatus,
      thumbnail: byteRef.thumbnail,
      created: byteRef.created,
      admins: byteRef.admins,
      tags: byteRef.tags,
      priority: byteRef.priority,
    };
  }

  const handleSubmit = async () => {
    setByteCreating(true);
    try {
      const valid = validateByte(byteRef);
      setByteRef({
        ...byteRef,
        isPristine: false,
      });

      if (!valid) {
        console.log('Guide invalid', valid, byteErrors);
        showNotification({
          type: 'error',
          message: "Validation Error: Can't Save Byte",
        });

        setByteCreating(false);
        return;
      }
      const response = await upsertByteMutation({
        variables: {
          spaceId: space.id,
          input: getByteInput(),
        },
      });

      const payload = response?.data?.payload;
      if (payload) {
        showNotification({
          type: 'success',
          message: 'Byte Saved',
        });

        router.push(`/bytes/${payload.id}`);
      } else {
        showNotification({
          type: 'error',
          message: "Can't Save Byte",
        });
        console.error(response.errors);
      }
    } catch (e) {
      showNotification({
        type: 'error',
        message: "Can't Save Byte",
      });
      console.error(e);
    }
    setByteCreating(false);
  };

  return {
    byteCreating,
    byteLoaded,
    byteRef,
    byteErrors,
    updateByteFunctions,
    handleSubmit,
    initialize,
  };
}
