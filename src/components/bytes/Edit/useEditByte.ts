import { editByteCommonFunctions, EditByteType, GeneratedByte, KeyOfByteInput, UpdateByteFunctions } from '@/components/bytes/Edit/editByteHelper';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ByteDetailsFragment,
  SpaceWithIntegrationsFragment,
  usePublishByteMutation,
  useQueryByteDetailsQuery,
  useSaveByteMutation,
  useUpsertByteMutation,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { PublishStatus } from '@/types/deprecated/models/enums';
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
  const [byteSaving, setByteSaving] = useState<boolean>(false);
  const [bytePublishing, setBytePublishing] = useState<boolean>(false);

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

  const updateByteFunctions: UpdateByteFunctions = {
    addStep,
    moveStepUp: moveStepUpFn,
    moveStepDown: moveStepDownFn,
    removeStep: removeStepFn,
    updateByteErrorField,
    updateByteField,
    updateStep: updateStepFn,
    setByte,
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

  const handleSubmit = async () => {
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

  const handleSave = async () => {
    setByteSaving(true);
    await saveViaMutation(
      async () =>
        await saveByteMutation({
          variables: {
            spaceId: space.id,
            input: { ...getByteInputFn(byte), publishStatus: PublishStatus.Draft },
          },
          errorPolicy: 'all',
        })
    );
    setBytePublishing(false);
  };
  const handlePublish = async () => {
    setBytePublishing(true);
    await saveViaMutation(
      async () =>
        await publishByteMutation({
          variables: {
            spaceId: space.id,
            input: { ...getByteInputFn(byte), publishStatus: PublishStatus.Live },
          },
          errorPolicy: 'all',
        })
    );
    setBytePublishing(false);
  };

  return {
    byteUpserting,
    byteSaving,
    bytePublishing,
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
