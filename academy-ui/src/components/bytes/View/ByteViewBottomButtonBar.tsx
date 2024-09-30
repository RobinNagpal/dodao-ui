import styles from '@/components/bytes/View/ByteStepperItem/ByteStepperItemView.module.scss';
import { LAST_STEP_UUID, UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { ByteDto, ByteStepDto } from '@/types/bytes/ByteDto';
import { ByteStepItem, Question } from '@/types/stepItems/stepItemDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isQuestion } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import isEqual from 'lodash/isEqual';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface ByteStepperItemWithProgressBarProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseGenericViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;

  setShowCorrectAnswerForQuestion: (show: boolean) => void;
  setShowQuestionsCompletionWarning: (show: boolean) => void;
  isUserInputComplete: () => boolean;
  isQuestionAnswered: () => boolean;
  isDiscordConnected: () => boolean;
}
export function ByteViewBottomButtonBar({
  viewByteHelper,
  step,
  byte,
  space,
  setByteSubmitted,
  isUserInputComplete,
  isQuestionAnswered,
  isDiscordConnected,
  setShowCorrectAnswerForQuestion,
  setShowQuestionsCompletionWarning,
}: ByteStepperItemWithProgressBarProps) {
  const { activeStepOrder } = viewByteHelper;
  const { $t: t } = useI18();
  const { showNotification } = useNotificationContext();

  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;

  const isNotFirstStep = activeStepOrder !== 0;

  const isLastStep = byte.steps.length - 2 === activeStepOrder;

  const isByteCompletedStep = step.uuid === LAST_STEP_UUID;

  const [nextButtonClicked, setNextButtonClicked] = useState(false);

  const [questionNotAnswered, setQuestionNotAnswered] = useState(false);

  const [questionsAnsweredCorrectly, setQuestionsAnsweredCorrectly] = useState(false);

  const { setShowLoginModal } = useLoginModalContext();

  useEffect(() => {
    setShowCorrectAnswerForQuestion(nextButtonClicked && !questionsAnsweredCorrectly && questionNotAnswered);

    const showQuestionsCompletionWarning = nextButtonClicked && (!isQuestionAnswered() || !isDiscordConnected() || !isUserInputComplete());
    setShowQuestionsCompletionWarning(showQuestionsCompletionWarning);
  }, [nextButtonClicked, questionsAnsweredCorrectly, questionNotAnswered]);

  const navigateToNextStep = async () => {
    setNextButtonClicked(true);

    if (isQuestionAnswered() && isDiscordConnected() && isUserInputComplete()) {
      setQuestionNotAnswered(true);

      const answeredCorrectly = step.stepItems.filter(isQuestion).every((stepItem: ByteStepItem) => {
        const question = stepItem as Question;
        return isEqual(question.answerKeys.sort(), ((viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid) as string[]) || []).sort());
      });

      if (!answeredCorrectly) {
        setQuestionsAnsweredCorrectly(false);
        showNotification({
          type: 'info',
          message: t('Your answer is wrong! Give correct answer to proceed.'),
          heading: 'Hint',
        });
        return;
      } else {
        setQuestionsAnsweredCorrectly(true);
      }
      setNextButtonClicked(false);

      if (isLastStep) {
        if (!viewByteHelper.isValidToSubmit()) {
          showNotification({
            type: 'error',
            message: "You haven't completed all the steps yet",
            heading: 'Error',
          });
          return;
        }

        if (!session?.username && space.authSettings.enableLogin && space.byteSettings.askForLoginToSubmit) {
          setShowLoginModal(true);
          return;
        } else {
          const byteSubmitted = await viewByteHelper.submitByte();
          if (!byteSubmitted) {
            showNotification({
              type: 'error',
              message: t('notify.somethingWentWrong'),
              heading: 'Error',
            });
            return;
          }
        }
        setByteSubmitted(true);
      }

      setTimeout(async () => {
        viewByteHelper.goToNextStep(step);
      }, 300);
    }
  };

  return (
    <div id="bottom-buttons" className={`absolute bottom-0 w-full z-10 ${styles.bottomActionBar}`}>
      <div className="py-4 px-4 w-full relative z-20">
        {isNotFirstStep && (
          <Button onClick={() => viewByteHelper.goToPreviousStep(step)} className="float-left pb-6 ml-2 sm:ml-0">
            <span className="mr-2 font-bold">&#8592;</span>
            Back
          </Button>
        )}
        {!isByteCompletedStep && (
          <Button
            onClick={navigateToNextStep}
            disabled={viewByteHelper.byteSubmitting}
            variant="contained"
            className="float-right w-[150px] mr-2 sm:mr-0"
            primary={true}
          >
            <span>{isLastStep ? 'Complete' : 'Next'}</span>
            <span className="ml-2 font-bold">&#8594;</span>
          </Button>
        )}
      </div>
    </div>
  );
}
