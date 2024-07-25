import {
  editByteCommonFunctions,
  EditByteStep,
  EditByteType,
  GeneratedByte,
  KeyOfByteInput,
  UpdateByteFunctions,
} from '@/components/bytes/Edit/editByteHelper';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ByteDetailsFragment, SpaceWithIntegrationsFragment, ByteCollectionFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { ByteErrors } from '@dodao/web-core/types/errors/byteErrors';
import { emptyByte } from '@/utils/byte/EmptyByte';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { FetchResult } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Byte } from '@prisma/client';

export function useEditByte(space: SpaceWithIntegrationsFragment, onUpsert: (byteId: string) => Promise<void>, byteId: string | null) {
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
      const result = await axios.get(`/api/byte/byte`, {
        params: {
          byteId,
          spaceId: space.id,
        },
      });
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

  const handleByteUpsert = async (byteCollection: ByteCollectionFragment) => {
    await saveViaMutation(async () => {
      const upsertResponse = await fetch('/api/byte/upsert-byte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          input: getByteInputFn(byte),
        }),
      });

      // if (!upsertResponse.ok) {
      //   throw new Error('Failed to upsert byte');
      // }
      // console.log('upsert Response: ', upsertResponse);

      const { upsertedByte } = await upsertResponse.json();

      const mappingResponse = await fetch('/api/mapping/upsertByteMapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          byteCollectionId: byteCollection.id,
          itemId: upsertedByte.id,
          itemType: 'Byte',
          order: byteCollection.bytes.length + 1,
        }),
      });

      // if (!mappingResponse.ok) {
      //   throw new Error('Failed to create mapping item');
      // }

      return upsertedByte;
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
