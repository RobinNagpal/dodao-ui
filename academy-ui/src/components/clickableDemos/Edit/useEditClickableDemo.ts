import { ClickableDemoStepInput, UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { ClickableDemoDto, TooltipPlacement } from '@/types/clickableDemos/ClickableDemoDto';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import { emptyClickableDemo } from '@/utils/clickableDemos/EmptyClickableDemo';
import { ClickableDemoErrors, ClickableDemoStepError } from '@dodao/web-core/types/errors/clickableDemoErrors';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import { createNewEntityId } from '@dodao/web-core/utils/space/createNewEntityId';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const titleLimit = 32;
const excerptLimit = 64;

type KeyOfClickableDemoInput = keyof UpsertClickableDemoInput;

export type UpdateClickableDemoFunctions = {
  initialize: () => Promise<void>;
  moveStepDown: (stepUuid: string) => void;
  addStep: () => void;
  updateClickableDemoField: (field: KeyOfClickableDemoInput, value: any) => void;
  updateClickableDemoErrorField: (field: KeyOfClickableDemoInput, value: any) => void;
  updateStep: (step: ClickableDemoStepInput) => void;
  removeStep: (stepUuid: string) => void;
  moveStepUp: (stepUuid: string) => void;
};

export function useEditClickableDemo(space: SpaceWithIntegrationsDto, demoId: string | null) {
  const router = useRouter();
  const emptyClickableDemoModel = emptyClickableDemo();
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();

  const [clickableDemo, setClickableDemo] = useState<UpsertClickableDemoInput>({
    ...emptyClickableDemoModel,
  });
  const [clickableDemoErrors, setClickableDemoErrors] = useState<ClickableDemoErrors>({});
  const [clickableDemoLoaded, setClickableDemoLoaded] = useState<boolean>(false);
  const [clickableDemoCreating, setClickableDemoCreating] = useState<boolean>(false);

  const { postData } = useFetchUtils();

  async function initialize() {
    if (demoId) {
      const response = await fetch(`/api/${space.id}/clickable-demos/${demoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          tags: [TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString()],
        },
      });
      if (response.ok) {
        const fetchedClickableDemo = await response.json();
        setClickableDemo({
          ...fetchedClickableDemo,
        });
      }
      setClickableDemoLoaded(true);
    } else {
      setClickableDemoLoaded(true);
    }
  }

  function updateStep(step: ClickableDemoStepInput) {
    setClickableDemo((prevClickableDemo) => ({
      ...prevClickableDemo,
      steps: prevClickableDemo.steps.map((s) => {
        if (s.id === step.id) {
          return step;
        } else {
          return s;
        }
      }),
    }));
  }

  function moveStepUp(stepUuid: string) {
    const steps = [...clickableDemo.steps];
    const index = steps.findIndex((step) => step.id === stepUuid);
    if (index >= 0 && index < steps.length - 1) {
      // Swap elements to move the step up
      const temp = steps[index];
      steps[index] = steps[index - 1];
      steps[index - 1] = temp;
    }

    setClickableDemo({ ...clickableDemo, steps });
  }

  function moveStepDown(stepUuid: string) {
    const steps = [...clickableDemo.steps];
    const index = steps.findIndex((step) => step.id === stepUuid);
    if (index >= 0 && index < steps.length - 1) {
      // Swap elements to move the step down
      const temp = steps[index];
      steps[index] = steps[index + 1];
      steps[index + 1] = temp;
    }

    setClickableDemo({ ...clickableDemo, steps });
  }

  function removeStep(stepUuid: string) {
    setClickableDemo((prevClickableDemo) => {
      const updatedSteps = prevClickableDemo.steps.filter((s) => s.id !== stepUuid);
      const updatedStepsWithOrder = updatedSteps.map((step, index) => ({
        ...step,
        order: index,
      }));
      return {
        ...prevClickableDemo, // Copy all other properties from previous state
        steps: updatedStepsWithOrder,
      };
    });
  }

  function addStep() {
    const uuid = uuidv4();
    setClickableDemo((prevClickableDemo) => ({
      ...prevClickableDemo,
      steps: [
        ...prevClickableDemo.steps,
        {
          id: uuid,
          url: ``,
          tooltipInfo: ``,
          selector: '',
          order: prevClickableDemo.steps.length,
          placement: TooltipPlacement.bottom,
        },
      ],
    }));
  }

  function validateClickableDemo(clickableDemo: UpsertClickableDemoInput) {
    const newClickableDemoErrors: ClickableDemoErrors = { ...clickableDemoErrors };

    newClickableDemoErrors.title = !clickableDemo.title.trim() || clickableDemo.title.length > titleLimit;

    newClickableDemoErrors.excerpt = !clickableDemo.excerpt.trim() || clickableDemo.excerpt.length > excerptLimit;

    newClickableDemoErrors.steps = clickableDemo.steps.reduce((acc: any, step: ClickableDemoStepInput) => {
      const stepError: ClickableDemoStepError = {};
      if (!step.selector) {
        stepError.selector = true;
      }
      if (!step.url?.trim()) {
        stepError.url = true;
      }
      if (!step.tooltipInfo?.trim()) {
        stepError.tooltipInfo = true;
      }

      if (Object.keys(stepError).length > 0) {
        acc[step.order] = stepError;
      }
      return acc;
    }, {});

    setClickableDemoErrors(newClickableDemoErrors);

    const isValid =
      !newClickableDemoErrors.title && !newClickableDemoErrors.excerpt && Object.values(newClickableDemoErrors?.steps || {}).filter((v) => !!v).length === 0;
    return isValid;
  }

  function getClickableDemoInput(): UpsertClickableDemoInput {
    return {
      title: clickableDemo.title,
      excerpt: clickableDemo.excerpt,
      id: clickableDemo.id || createNewEntityId(clickableDemo.title, space.id),
      steps: clickableDemo.steps.map((s) => ({
        url: s.url,
        selector: s.selector,
        tooltipInfo: s.tooltipInfo,
        screenImgUrl: s.screenImgUrl,
        elementImgUrl: s.elementImgUrl,
        id: s.id,
        order: s.order,
        placement: s.placement,
      })),
    };
  }

  async function handleSubmit(byteCollection: ByteCollectionSummary) {
    setClickableDemoCreating(true);

    const valid = validateClickableDemo(clickableDemo);
    setClickableDemo((prevClickableDemo) => ({ ...prevClickableDemo }));
    if (!valid) {
      showNotification({ type: 'error', message: $t('notify.validationFailed') });

      setClickableDemoCreating(false);
      return;
    }
    const input = getClickableDemoInput();
    const response = await postData<ClickableDemoDto, any>(
      `/api/${space.id}/clickable-demos/${input.id}`,
      {
        spaceId: space.id,
        input,
        byteCollectionId: byteCollection.id,
      },
      {
        successMessage: 'Clickable Demo saved successfully!',
        errorMessage: 'Something went wrong while saving the Clickable Demo',
        redirectPath: `/clickable-demos/view/${input.id}`,
      }
    );

    setClickableDemoCreating(false);
  }

  function updateClickableDemoField(field: KeyOfClickableDemoInput, value: any) {
    setClickableDemo((prevClickableDemo) => ({
      ...prevClickableDemo,
      [field]: value,
    }));
  }

  function updateClickableDemoErrorField(field: KeyOfClickableDemoInput, value: any) {
    setClickableDemoErrors((prevClickableDemoErrors) => ({
      ...prevClickableDemoErrors,
      [field]: value,
    }));
  }

  const updateClickableDemoFunctions: UpdateClickableDemoFunctions = {
    initialize,
    addStep,
    moveStepUp,
    moveStepDown,
    removeStep,
    updateClickableDemoErrorField,
    updateClickableDemoField,
    updateStep,
  };

  // Return the necessary values and functions
  return {
    clickableDemoCreating,
    clickableDemoLoaded,
    clickableDemo,
    clickableDemoErrors,
    updateClickableDemoFunctions,
    handleSubmit,
  };
}
