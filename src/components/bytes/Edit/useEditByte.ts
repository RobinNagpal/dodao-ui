import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ByteDetailsFragment,
  ByteQuestionFragmentFragment,
  ByteStepFragment,
  ByteStepInput,
  SpaceWithIntegrationsFragment,
  StepItemInputGenericInput,
  UpsertByteInput,
  usePublishByteMutation,
  useQueryByteDetailsQuery,
  useSaveByteMutation,
  useUpsertByteMutation,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { isQuestion, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { UserInput } from '@/types/deprecated/models/GuideModel';
import { ByteErrors } from '@/types/errors/byteErrors';
import { StepError } from '@/types/errors/error';
import { slugify } from '@/utils/auth/slugify';
import { emptyByte } from '@/utils/byte/EmptyByte';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { FetchResult } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
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

type KeyOfByteInput = keyof EditByteType;

export type UpdateByteFunctions = {
  moveStepDown: (stepUuid: string) => void;
  addStep: () => void;
  updateByteErrorField: (field: KeyOfByteInput, value: any) => void;
  updateByteField: (field: KeyOfByteInput, value: any) => void;
  updateStep: (step: EditByteStep) => void;
  removeStep: (stepUuid: string) => void;
  moveStepUp: (stepUuid: string) => void;
  setByte: (byte: EditByteType) => void;
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
export function useEditByte(space: SpaceWithIntegrationsFragment, byteId: string | null) {
  const router = useRouter();
  const emptyByteModel = emptyByte();
  const [byte, setByte] = useState<EditByteType>({
    ...emptyByteModel,
    byteExists: false,
  });
  const [byteErrors, setByteErrors] = useState<ByteErrors>({});
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);

  const [byteCreating, setByteCreating] = useState<boolean>(false);

  const { refetch: queryByteDetails } = useQueryByteDetailsQuery({ skip: true });
  const [upsertByteMutation] = useUpsertByteMutation();
  const [saveByteMutation] = useSaveByteMutation();
  const [publishByteMutation] = usePublishByteMutation();
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();

  const initialize = useCallback(async () => {
    const storedByte = byteId && localStorage.getItem(byteId);
    if (byteId && storedByte) {
      const generatedByte = JSON.parse(storedByte) as GeneratedByte;
      const byte: EditByteType = {
        ...generatedByte,
        steps: generatedByte.steps.map((step) => ({ ...step, uuid: uuidv4(), stepItems: [] })),
        byteExists: true,
        isPristine: true,
        admins: [],
        created: new Date().toISOString(),
        priority: 50,
        publishStatus: PublishStatus.Draft,
        tags: [],
      };
      setByte(byte);
      setByteLoaded(true);
    } else if (byteId) {
      const result = await queryByteDetails({ byteId: byteId, spaceId: space.id, includeDraft: true });
      const byte: ByteDetailsFragment = result.data.byte;
      setByte({
        ...byte,
        byteExists: true,
        isPristine: true,
      });
      setByteLoaded(true);
    } else {
      setByteLoaded(true);
    }
  }, [byteId, space]);

  // Add other
  const updateStep = useCallback((step: EditByteStep) => {
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
  }, []);

  const moveStepUp = useCallback((stepUuid: string) => {
    setByte((prevByte) => {
      const steps = prevByte.steps;
      const index = steps.findIndex((step) => step.uuid === stepUuid);
      if (index > 0) {
        [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
      }

      return { ...prevByte, steps: [...steps] };
    });
  }, []);

  const moveStepDown = useCallback((stepUuid: string) => {
    setByte((prevByte) => {
      const newSteps = [...prevByte.steps];
      const index = newSteps.findIndex((step) => step.uuid === stepUuid);
      if (index >= 0 && index < newSteps.length - 1) {
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      }

      return { ...prevByte, steps: newSteps };
    });
  }, []);

  const removeStep = useCallback((stepUuid: string) => {
    setByte((prevByte) => {
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
    setByte((prevByte) => {
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
      setByteErrors(updatedByteErrors);
      return Object.values(updatedByteErrors).filter((v) => !!v).length === 0;
    },
    [validateQuestion, validateUserInput, byteErrors]
  );

  const updateByteField = useCallback((field: KeyOfByteInput, value: any) => {
    setByte((prevByte) => ({
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
    setByte,
  };

  function getByteInput(): UpsertByteInput {
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
        uuid: s.uuid,
      })),
      publishStatus: byte.publishStatus,
      thumbnail: byte.thumbnail,
      created: byte.created,
      admins: byte.admins,
      tags: byte.tags,
      priority: byte.priority,
    };
  }

  const saveViaMutation = async (mutationFn: () => Promise<FetchResult<{ payload: ByteDetailsFragment | undefined }>>) => {
    setByteCreating(true);
    try {
      const valid = validateByte(byte);
      setByte({
        ...byte,
        isPristine: false,
      });

      if (!valid) {
        console.log('Byte invalid', valid, byteErrors);
        showNotification({ type: 'error', message: "Validation Error: Can't Save Byte" });

        setByteCreating(false);
        return;
      }
      const response = await mutationFn();

      const payload = response?.data?.payload;
      if (payload) {
        showNotification({ type: 'success', message: 'Byte Saved', heading: 'Success 🎉' });

        router.push(`/tidbits/view/${payload.id}/0`);
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
        console.error(response.errors);
      }
    } catch (e) {
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      console.error(e);
    }
    setByteCreating(false);
  };

  const handleSubmit = async () => {
    await saveViaMutation(
      async () =>
        await upsertByteMutation({
          variables: {
            spaceId: space.id,
            input: getByteInput(),
          },
          errorPolicy: 'all',
        })
    );
  };

  const handleSave = async () => {
    await saveViaMutation(
      async () =>
        await saveByteMutation({
          variables: {
            spaceId: space.id,
            input: { ...getByteInput(), publishStatus: PublishStatus.Draft },
          },
          errorPolicy: 'all',
        })
    );
  };
  const handlePublish = async () => {
    await saveViaMutation(
      async () =>
        await publishByteMutation({
          variables: {
            spaceId: space.id,
            input: { ...getByteInput(), publishStatus: PublishStatus.Live },
          },
          errorPolicy: 'all',
        })
    );
  };

  return {
    byteCreating,
    byteLoaded,
    byteRef: byte,
    byteErrors,
    updateByteFunctions,
    handleSubmit,
    handleSave,
    handlePublish,
    initialize,
  };
}
