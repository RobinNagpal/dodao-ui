import { editByteCommonFunctions, GeneratedByte, KeyOfByteInput, UpdateByteFunctions } from '@/components/bytes/Edit/editByteHelper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { ByteDto, ImageDisplayMode } from '@/types/bytes/ByteDto';
import { EditByteStep, EditByteType } from '@/types/request/ByteRequests';
import { emptyByte } from '@/utils/byte/EmptyByte';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { ByteErrors } from '@dodao/web-core/types/errors/byteErrors';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Byte } from '@prisma/client';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useEditByte(
  space: SpaceWithIntegrationsFragment,
  onUpsert: (byteId: string) => Promise<void>,
  byteCollectionId: string,
  byteId: string | null
) {
  const emptyByteModel = emptyByte();
  const [byte, setByte] = useState<EditByteType>({
    ...emptyByteModel,
    byteExists: false,
  });
  const [byteErrors, setByteErrors] = useState<ByteErrors>({});
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);

  const [byteUpserting, setByteUpserting] = useState<boolean>(false);

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

  const {
    getByteInputFn,
    updateStepFn,
    moveStepUpFn,
    moveStepDownFn,
    removeStepFn,
    validateByteFn,
    updateCompletionScreenFn,
    addCallToActionButtonLabelFn,
    addCallToActionButtonLinkFn,
    removeCallToActionButtonFn,
  } = editByteCommonFunctions(setByte);
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
        showNotification({ type: 'error', message: "Validation Error: Can't Save Byte" });

        setByteUpserting(false);
        return;
      }
      const response = await mutationFn();

      if (response) {
        showNotification({ type: 'success', message: 'Byte Saved', heading: 'Success 🎉' });
        await onUpsert(response.id!);
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
        console.error('Failed to save byte');
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
      const upsertResponse = await fetch(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection.id}/bytes/${upsertByteInput.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: upsertByteInput,
        }),
      });

      return await upsertResponse.json();
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
