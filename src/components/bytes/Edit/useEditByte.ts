import {
  editByteCommonFunctions,
  EditByteStep,
  EditByteType,
  GeneratedByte,
  KeyOfByteInput,
  UpdateByteFunctions,
} from '@/components/bytes/Edit/editByteHelper';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ByteDetailsFragment, SpaceWithIntegrationsFragment, useQueryByteDetailsQuery, useUpsertByteMutation } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { ByteErrors } from '@/types/errors/byteErrors';
import { emptyByte } from '@/utils/byte/EmptyByte';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { FetchResult } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useEditByte(space: SpaceWithIntegrationsFragment, byteId: string | null) {
  const router = useRouter();
  const emptyByteModel = emptyByte();
  const [byte, setByte] = useState<EditByteType>({
    ...emptyByteModel,
    byteExists: false,
  });
  const [byteErrors, setByteErrors] = useState<ByteErrors>({});
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);

  const [byteUpserting, setByteUpserting] = useState<boolean>(false);

  const { refetch: queryByteDetails } = useQueryByteDetailsQuery({ skip: true });
  const [upsertByteMutation] = useUpsertByteMutation();
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

  const { getByteInputFn, updateStepFn, moveStepUpFn, moveStepDownFn, removeStepFn, validateByteFn } = editByteCommonFunctions(setByte);
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
  };

  const saveViaMutation = async (mutationFn: () => Promise<FetchResult<{ payload: ByteDetailsFragment | undefined }>>) => {
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
    setByteUpserting(false);
  };

  const handleByteUpsert = async () => {
    await saveViaMutation(
      async () =>
        await upsertByteMutation({
          variables: {
            spaceId: space.id,
            input: getByteInputFn(byte),
          },
          errorPolicy: 'all',
        })
    );
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
