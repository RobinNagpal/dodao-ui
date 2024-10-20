import { ClickableDemoStepInput, Space, UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import { emptyClickableDemo } from '@/utils/clickableDemos/EmptyClickableDemo';
import { ClickableDemoErrors, ClickableDemoStepError } from '@dodao/web-core/types/errors/clickableDemoErrors';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { createNewEntityId } from '@dodao/web-core/utils/space/createNewEntityId';
import orderBy from 'lodash/orderBy';
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

export function useEditClickableDemo(space: Space, demoId: string | null) {
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
    setClickableDemo((prevClickableDemo) => {
      const stepIndex = prevClickableDemo.steps.findIndex((s) => s.id === stepUuid);
      const updatedSteps = [...prevClickableDemo.steps];
      const stepMovingDown = { ...updatedSteps[stepIndex - 1], order: stepIndex };
      const stepMovingUp = { ...updatedSteps[stepIndex], order: stepIndex - 1 };
      updatedSteps[stepIndex - 1] = stepMovingDown;
      updatedSteps[stepIndex] = stepMovingUp;

      return {
        ...prevClickableDemo,
        steps: orderBy(updatedSteps, 'order'),
      };
    });
  }

  function moveStepDown(stepUuid: string) {
    setClickableDemo((prevClickableDemo) => {
      const stepIndex = prevClickableDemo.steps.findIndex((s) => s.id === stepUuid);
      const updatedSteps = [...prevClickableDemo.steps];
      const stepMovingDown = { ...updatedSteps[stepIndex], order: stepIndex + 1 };
      const stepMovingUp = { ...updatedSteps[stepIndex + 1], order: stepIndex };
      updatedSteps[stepIndex + 1] = stepMovingDown;
      updatedSteps[stepIndex] = stepMovingUp;
      return {
        ...prevClickableDemo,
        steps: orderBy(updatedSteps, 'order'),
      };
    });
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
          placement: 'bottom',
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
    try {
      const valid = validateClickableDemo(clickableDemo);
      setClickableDemo((prevClickableDemo) => ({ ...prevClickableDemo }));
      if (!valid) {
        showNotification({ type: 'error', message: $t('notify.validationFailed') });

        setClickableDemoCreating(false);
        return;
      }
      const input = getClickableDemoInput();
      const response = await fetch(`/api/${space.id}/clickable-demos/${input.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          input,
          byteCollectionId: byteCollection.id,
        }),
      });

      const payload = await response.json();
      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Clickable Demo saved successfully!',
        });

        router.push(`/clickable-demos/view/${payload.id}`);
      } else {
        console.error(response.body);
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    }
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
