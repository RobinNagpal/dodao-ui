import { EditGuideType } from '@/components/guides/Edit/editGuideType';
import {
  GuideInput,
  GuideQuestionFragment,
  GuideStepFragment,
  GuideStepInput,
  GuideUserInputFragment,
  QuestionChoiceInput,
  StepItemInputGenericInput,
  useGuideQueryQuery,
  useUpsertGuideMutation,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { validateQuestion, validateUserInput } from '@/utils/stepItems/validateItems';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isQuestion, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { InputType } from '@dodao/web-core/types/deprecated/models/enums';
import { GuideType } from '@dodao/web-core/types/deprecated/models/GuideModel';
import { GuideError, KeyOfGuideIntegration, StepError } from '@dodao/web-core/types/errors/error';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import orderBy from 'lodash/orderBy';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { emptyGuide } from './EmptyGuide';

const stepContentLimit = 14400;
const guideExceptContentLimit = 64;
const nameLimit = 32;

type KeyOfGuideInput = keyof EditGuideType;

export type UpdateGuideFunctions = {
  moveStepDown: (stepUuid: string) => void;
  addStep: () => void;
  updateGuideErrorField: (field: KeyOfGuideInput, value: any) => void;
  updateGuideField: (field: KeyOfGuideInput, value: any) => void;
  updateGuideIntegrationErrorField: (field: KeyOfGuideIntegration, value: any) => void;
  updateGuideIntegrationField: (field: KeyOfGuideIntegration, value: any) => void;
  updateStep: (step: GuideStepFragment) => void;
  removeStep: (stepUuid: string) => void;
  moveStepUp: (stepUuid: string) => void;
  setActiveStep: (uuid: string) => void;
};

export interface UseEditGuideHelper {
  guide: EditGuideType;
  guideErrors: GuideError;
  guideLoaded: boolean;
  guideCreating: boolean;
  handleSubmit: () => Promise<void>;
  activeStepId?: string | null;
  initialize: () => Promise<void>;
  updateGuideFunctions: UpdateGuideFunctions;
}

export function useEditGuide(space: SpaceWithIntegrationsDto, uuid: string | null): UseEditGuideHelper {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  const emptyGuideModel = emptyGuide(session?.username || '', space, GuideType.Onboarding);
  const initialState: EditGuideType = { ...emptyGuideModel, guideExists: false };
  const [guide, setGuide] = useState<EditGuideType>(initialState);
  const [guideErrors, setGuideErrors] = useState<GuideError>({});
  const [guideLoaded, setGuideLoaded] = useState<boolean>(false);
  const [activeStepId, setActiveStepId] = useState<string | null>();

  const [guideCreating, setGuideCreating] = useState(false);
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();
  const router = useRouter();

  const { refetch: queryGuideDetails } = useGuideQueryQuery({ skip: true });
  const [upsertGuideMutation] = useUpsertGuideMutation();

  const initialize = async () => {
    if (uuid) {
      const response = await axios.get(`${getBaseUrl()}/api/guide/` + uuid);
      const guide = response.data.guide;
      setGuide({
        ...guide,
        guideExists: true,
        isPristine: true,
        postSubmissionStepContent: guide.postSubmissionStepContent || undefined,
        thumbnail: guide.thumbnail || undefined,
        guideIntegrations: { discordRoleIds: guide.discordRoleIds || [] },
      });
      const minOrder = Math.min(...guide.steps.map((step: GuideStepFragment) => step.stepOrder));
      setActiveStepId(guide.steps.find((step: GuideStepFragment) => step.stepOrder === minOrder)?.uuid);
      setGuideLoaded(true);
    } else {
      setActiveStepId(emptyGuideModel.steps[0].uuid);
      setGuideLoaded(true);
    }
  };

  function setActiveStep(uuid: string) {
    setActiveStepId(uuid);
  }

  function updateStep(step: GuideStepFragment) {
    setGuide((prevGuide: EditGuideType): EditGuideType => {
      return {
        ...prevGuide,
        steps: prevGuide.steps.map((s: GuideStepFragment) => {
          if (s.uuid === step.uuid) {
            return step;
          } else {
            return s;
          }
        }),
      };
    });
  }

  function moveStepUp(stepUuid: string) {
    const stepIndex = guide.steps.findIndex((s) => s.uuid === stepUuid);
    const steps = guide.steps.map((s) => ({ ...s }));
    steps[stepIndex - 1].stepOrder = stepIndex;
    steps[stepIndex].stepOrder = stepIndex - 1;
    setGuide((prevGuide: EditGuideType) => ({
      ...prevGuide,
      steps: orderBy(steps, 'order'),
    }));
  }

  function moveStepDown(stepUuid: string) {
    const stepIndex = guide.steps.findIndex((s) => s.uuid === stepUuid);
    const steps = [...guide.steps];
    steps[stepIndex + 1].stepOrder = stepIndex;
    steps[stepIndex].stepOrder = stepIndex + 1;
    setGuide((prevGuide: EditGuideType) => ({
      ...prevGuide,
      steps: orderBy(steps, 'order'),
    }));
  }

  function removeStep(stepUuid: string) {
    const steps = [...guide.steps];
    if (activeStepId === stepUuid) {
      const stepIndex = steps.findIndex((step) => step.uuid === stepUuid);
      if (stepIndex === steps.length - 1) {
        setActiveStepId(steps[stepIndex - 1].uuid);
      } else {
        setActiveStepId(steps[stepIndex + 1].uuid);
      }
    }
    setGuide((prevGuide: EditGuideType) => ({
      ...prevGuide,
      steps: steps
        .filter((s) => s.uuid !== stepUuid)
        .map((step, index) => ({
          ...step,
          order: index,
        })),
    }));
  }

  function addStep() {
    const uuid = uuidv4();

    setGuide((prevGuide: EditGuideType) => ({
      ...prevGuide,
      steps: [
        ...guide.steps,
        {
          id: uuid,
          uuid: uuid,
          stepName: `Step ${guide.steps.length + 1}`,
          content: '',
          stepItems: [],
          stepOrder: guide.steps.length,
        },
      ],
    }));
  }

  function validateGuide(guide: EditGuideType) {
    const errors: GuideError = { ...guideErrors };

    errors.guideName = undefined;
    if (!guide.guideName || guide.guideName.length > nameLimit) {
      errors.guideName = true;
    }
    errors.content = undefined;
    if (!guide.content || guide.content?.length > guideExceptContentLimit) {
      errors.content = true;
    }
    errors.steps = undefined;
    guide.steps.forEach((step: GuideStepInput) => {
      const stepError: StepError = {};
      if (!(step.stepOrder + 1) || step.stepName.length > nameLimit) {
        stepError.stepName = true;
      }
      if (step.content?.length > stepContentLimit) {
        stepError.content = true;
      }
      step.stepItems.forEach((item: StepItemInputGenericInput) => {
        if (isQuestion(item)) {
          validateQuestion(item as GuideQuestionFragment, stepError);
        } else if (isUserInput(item)) {
          validateUserInput(item as GuideUserInputFragment & { type: InputType }, stepError);
        }
      });
      if (Object.keys(stepError).length > 0) {
        if (!errors.steps) {
          errors.steps = {};
        }
        errors.steps[step.uuid] = stepError;
      }
      return errors;
    });

    setGuideErrors(errors);
    return Object.values(errors).filter((v) => !!v).length === 0;
  }

  function convertToGuideInput(model: EditGuideType): GuideInput {
    return {
      id: model.id || model.uuid,
      categories: model.categories,
      content: model.content,
      from: session?.username || '',
      guideIntegrations: {
        discordRoleIds: [],
        projectGalaxyCredentialId: model.guideIntegrations.projectGalaxyCredentialId,
        projectGalaxyOatPassingCount: model.guideIntegrations.projectGalaxyOatPassingCount,
        projectGalaxyOatMintUrl: model.guideIntegrations.projectGalaxyOatMintUrl,
      },
      guideSource: model.guideSource,
      guideType: model.guideType,
      name: model.guideName,
      postSubmissionStepContent: model.postSubmissionStepContent,
      space: space.id,
      priority: model.priority,
      steps: model.steps.map((step) => {
        return {
          id: step.id,
          content: step.content,
          stepName: step.stepName,
          stepOrder: step.stepOrder,
          stepItems: step.stepItems.map((item, index) => {
            const stepItem = item as StepItemInputGenericInput;
            return {
              type: stepItem.type,
              uuid: stepItem.uuid,
              answerKeys: stepItem.answerKeys,
              choices: stepItem.choices?.map(
                (choice: QuestionChoiceInput): QuestionChoiceInput => ({
                  key: choice.key,
                  content: choice.content,
                })
              ),
              content: stepItem.content,
              explanation: stepItem.explanation,
              questionType: stepItem.questionType,
              label: stepItem.label,
              required: stepItem.required,
            };
          }),
          uuid: step.uuid,
        };
      }),
      publishStatus: model.publishStatus,
      thumbnail: model.thumbnail,
      uuid: model.uuid,
    };
  }

  async function handleSubmit() {
    setGuideCreating(true);
    try {
      const valid = validateGuide(guide);
      setGuide((prevGuide: EditGuideType) => ({
        ...prevGuide,
        isPristine: false,
      }));

      if (!valid) {
        console.log('Guide invalid', guideErrors);
        showNotification({ type: 'error', message: $t('notify.validationFailed') });
        setGuideCreating(false);
        return;
      }
      const response = await fetch(`${getBaseUrl()}/api/guide/upsert-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          guideInput: convertToGuideInput(guide),
        }),
      });

      const payload = (await response.json()).guide;
      if (payload) {
        showNotification({ type: 'success', message: 'Guide Saved', heading: 'Success 🎉' });
        router.push(`/guides/view/${payload.id}/0`);
      } else {
        console.error(response.body);
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    }
    setGuideCreating(false);
  }

  const updateGuideField = useCallback((field: KeyOfGuideInput, value: any) => {
    setGuide((prevGuide: EditGuideType) => ({
      ...prevGuide,
      [field]: value,
    }));
  }, []);

  const updateGuideIntegrationField = useCallback((field: KeyOfGuideIntegration, value: any) => {
    setGuide((prevGuide: EditGuideType) => ({
      ...prevGuide,
      guideIntegrations: {
        ...prevGuide.guideIntegrations,
        [field]: value,
      },
    }));
  }, []);

  const updateGuideErrorField = useCallback((field: KeyOfGuideInput, value: any) => {
    setGuideErrors((prevGuideErrors: GuideError) => ({
      ...prevGuideErrors,
      [field]: value,
    }));
  }, []);

  const updateGuideIntegrationErrorField = useCallback((field: KeyOfGuideIntegration, value: boolean | undefined) => {
    setGuideErrors((prevGuideErrors: GuideError) => {
      let guideIntegrations: Partial<Record<KeyOfGuideIntegration, boolean | undefined>> | undefined = {
        ...prevGuideErrors.guideIntegrations,
        [field]: value,
      };

      if (Object.values(guideIntegrations).every((value) => !value)) {
        guideIntegrations = undefined;
      }

      return {
        ...prevGuideErrors,
        guideIntegrations,
      };
    });
  }, []);

  const updateGuideFunctions: UpdateGuideFunctions = {
    addStep,
    moveStepUp,
    moveStepDown,
    removeStep,
    setActiveStep,
    updateGuideErrorField,
    updateGuideField,
    updateGuideIntegrationErrorField,
    updateGuideIntegrationField,
    updateStep,
  };

  return {
    initialize,
    activeStepId,
    guideCreating,
    guideLoaded,
    guide,
    guideErrors,
    handleSubmit,
    updateGuideFunctions,
  };
}
