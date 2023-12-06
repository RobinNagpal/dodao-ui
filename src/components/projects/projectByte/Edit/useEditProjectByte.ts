import {
  editByteCommonFunctions,
  EditByteType,
  EditProjectByteType,
  GeneratedByte,
  KeyOfByteInput,
  UpdateByteFunctions,
} from '@/components/bytes/Edit/editByteHelper';
import { emptyProjectByte } from '@/components/projects/projectByte/Edit/EmptyProjectByte';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ProjectByteFragment, SpaceWithIntegrationsFragment, useProjectByteQuery, useUpsertProjectByteMutation } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useEditProjectByte(space: SpaceWithIntegrationsFragment, projectId: string, byteId: string | null) {
  const router = useRouter();
  const emptyByteModel = emptyProjectByte();
  const [byte, setByte] = useState<EditProjectByteType>({
    ...emptyByteModel,
    byteExists: false,
  });
  const [byteErrors, setByteErrors] = useState<ByteErrors>({});
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);

  const [byteUpserting, setByteUpserting] = useState<boolean>(false);

  const { refetch: queryProjectByte } = useProjectByteQuery({ skip: true });
  const [upsertProjectByteMutation] = useUpsertProjectByteMutation();
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
      const result = await queryProjectByte({ projectId: projectId, id: byteId });
      const byte: ProjectByteFragment = result.data.projectByte;
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
    (byte: EditProjectByteType) => {
      const updatedByteErrors = validateByteFn(byte, byteErrors);
      setByteErrors(updatedByteErrors);
      console.log('updatedByteErrors', updatedByteErrors);
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

  const handleSubmit = async () => {
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
      const response = await upsertProjectByteMutation({
        variables: {
          input: getByteInputFn(byte),
          projectId: projectId,
        },
      });

      const payload = response?.data?.upsertProjectByte;
      if (payload) {
        showNotification({ type: 'success', message: 'Byte Saved', heading: 'Success 🎉' });

        router.push(`/projects/view/${projectId}/tidbits/${payload.id}/0`);
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

  return {
    byteUpserting,
    byteLoaded,
    byteRef: byte,
    byteErrors,
    updateByteFunctions,
    handleSubmit,
    initialize,
  };
}
