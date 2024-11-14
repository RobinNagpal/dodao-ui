import { useI18 } from '@/hooks/useI18';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { ByteDto, CompletionScreenDto, ImageDisplayMode } from '@/types/bytes/ByteDto';
import { ByteStepInput, EditByteStep, EditByteType, StepItemInputGenericInput, UpsertByteInput } from '@/types/request/ByteRequests';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Question, UserInput } from '@/types/stepItems/stepItemDto';
import { emptyByte } from '@/utils/byte/EmptyByte';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { isQuestion, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { ByteErrors, CompletionScreenErrors, CompletionScreenItemErrors } from '@dodao/web-core/types/errors/byteErrors';
import { StepError } from '@dodao/web-core/types/errors/error';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { Byte } from '@prisma/client';
import axios from 'axios';
import { useCallback, useState } from 'react';
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

export function useEditByte(space: SpaceWithIntegrationsDto, onUpsert: (byteId: string) => Promise<void>, byteCollectionId: string, byteId: string | null) {
  const emptyByteModel = emptyByte();
  const [byte, setByte] = useState<EditByteType>({
    ...emptyByteModel,
    byteExists: false,
  });
  const [byteErrors, setByteErrors] = useState<ByteErrors>({});
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);

  const [byteUpserting, setByteUpserting] = useState<boolean>(false);

  const { showNotification } = useNotificationContext();
  const { putData } = useFetchUtils();
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
        tags: [],
        completionScreen: null,
      };
      setByte(byte);
      setByteLoaded(true);
    } else if (byteId) {
      const result = await axios.get(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollectionId}/bytes/${byteId}`);
      const byte: ByteDto = result.data;
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
    const steps = [...byte.steps]; // Create a copy of the steps array
    const index = steps.findIndex((step) => step.uuid === stepUuid);
    if (index > 0) {
      // Swap elements to move the step up
      const temp = steps[index];
      steps[index] = steps[index - 1];
      steps[index - 1] = temp;
    }

    setByte({ ...byte, steps });
  };

  const moveStepDownFn = (stepUuid: string) => {
    const steps = [...byte.steps]; // Create a copy of the steps array
    const index = steps.findIndex((step) => step.uuid === stepUuid);
    if (index >= 0 && index < steps.length - 1) {
      // Swap elements to move the step down
      const temp = steps[index];
      steps[index] = steps[index + 1];
      steps[index + 1] = temp;
    }

    setByte({ ...byte, steps });
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

    updatedByteErrors.completionScreen = undefined;
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

  // Add other

  const addStep = useCallback(() => {
    const uuid = uuidv4();
    setByte((prevByte) => {
      const updatedSteps = [
        ...prevByte.steps,
        {
          uuid: uuid,
          name: `Step ${prevByte.steps.length + 1}`,
          displayMode: ImageDisplayMode.Normal,
          content: '',
          stepItems: [],
          order: prevByte.steps.length,
        },
      ];

      return { ...prevByte, steps: updatedSteps };
    });
  }, []);

  const removeCompletionScreen = useCallback(() => {
    setByte((prevByte) => {
      return { ...prevByte, completionScreen: null };
    });
  }, []);

  const validateByte = useCallback(
    (byte: EditByteType) => {
      const updatedByteErrors = validateByteFn(byte, byteErrors);
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

  const includeSteps = (newSteps: EditByteStep[]) => {
    setByte((prevByte) => ({
      ...prevByte,
      steps: [...prevByte.steps, ...newSteps],
    }));
  };

  const updateByteFunctions: UpdateByteFunctions = {
    addStep,
    moveStepUp: moveStepUpFn,
    moveStepDown: moveStepDownFn,
    removeStep: removeStepFn,
    updateByteErrorField,
    updateByteField,
    updateStep: updateStepFn,
    setByte,
    includeSteps,
    updateCompletionScreen: updateCompletionScreenFn,
    removeCompletionScreen,
    addCallToActionButtonLabel: addCallToActionButtonLabelFn,
    addCallToActionButtonLink: addCallToActionButtonLinkFn,
    removeCallToActionButton: removeCallToActionButtonFn,
  };

  const saveViaMutation = async (mutationFn: () => Promise<Byte>) => {
    setByteUpserting(true);
    try {
      const valid = validateByte(byte);
      setByte({
        ...byte,
        isPristine: false,
      });

      if (!valid) {
        console.log('Byte invalid', valid, byteErrors);
        showNotification({ type: 'error', message: $t('notify.validationFailed') });

        setByteUpserting(false);
        return;
      }
      const response = await mutationFn();

      if (response) {
        showNotification({ type: 'success', message: 'Tidbit saved successfully!' });
        await onUpsert(response.id!);
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
        console.error('Failed to save tidbit');
      }
    } catch (e) {
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      console.error(e);
    }
    setByteUpserting(false);
  };

  const handleByteUpsert = async (byteCollection: ByteCollectionSummary) => {
    await saveViaMutation(async () => {
      const upsertByteInput = getByteInputFn(byte);
      const upsertResponse = await putData<Byte, UpsertByteInput>(
        `${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection.id}/bytes/${upsertByteInput.id}`,
        {
          ...upsertByteInput,
        },
        {
          redirectPath: `/?updated=${Date.now()}`,
          successMessage: 'Tidbit saved successfully!',
          errorMessage: 'Failed to save tidbit',
        }
      );
      return upsertResponse!;
    });
  };

  return {
    byteUpserting,
    byteLoaded,
    byteRef: byte,
    byteErrors,
    updateByteFunctions,
    handleByteUpsert,
    initialize,
  };
}
