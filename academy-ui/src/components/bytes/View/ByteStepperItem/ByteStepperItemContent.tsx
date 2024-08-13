import UserDiscord from '@/components/app/Form/UserDiscord';
import styles from '@/components/bytes/View/ByteStepperItem/ByteStepperItemWithProgressBar.module.scss';
import { QuestionSection } from '@/components/bytes/View/QuestionSection';
import { UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import {
  ByteDetailsFragment,
  ByteQuestionFragmentFragment,
  ByteStepFragment,
  ByteStepItemFragment,
  ByteUserDiscordConnectFragmentFragment,
  ByteUserInputFragmentFragment,
  ImageDisplayMode,
  SpaceWithIntegrationsFragment,
  UserDiscordInfoInput,
} from '@/graphql/generated/generated-types';
import UserInput from '@dodao/web-core/components/app/Form/UserInput';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { marked } from 'marked';
import { useMemo, useState } from 'react';

interface ByteStepperItemContentProps {
  byte: ByteDetailsFragment;
  step: ByteStepFragment;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseGenericViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
  renderer: marked.Renderer;
  activeStepOrder: number;
  nextButtonClicked: boolean;
  questionsAnsweredCorrectly: boolean;
  questionNotAnswered: boolean;
  width: number;
  height: number;
  isShortScreen: boolean;
}

export default function ByteStepperItemContent({
  step,
  viewByteHelper,
  space,
  renderer,
  byte,
  activeStepOrder,
  nextButtonClicked,
  questionsAnsweredCorrectly,
  questionNotAnswered,
  width,
  height,
  isShortScreen,
}: ByteStepperItemContentProps) {
  const [imageHeight, setImageHeight] = useState('0px');
  const stepItems = step.stepItems;

  const stepContents = useMemo(() => marked.parse(step.content, { renderer }), [step.content]);

  const postSubmissionContent = useMemo(
    () => (byte.postSubmissionStepContent ? marked.parse(byte.postSubmissionStepContent, { renderer }) : null),
    [byte.postSubmissionStepContent]
  );

  const selectAnswer = (questionId: string, selectedAnswers: string[]) => {
    viewByteHelper.selectAnswer(step.uuid, questionId, selectedAnswers);
  };

  const setUserInput = (userInputUuid: string, userInput: string) => {
    viewByteHelper.setUserInput(step.uuid, userInputUuid, userInput);
  };

  const isLongScreen = height >= 900;

  const stepClasses = {
    headingClasses: isShortScreen ? 'text-3xl' : isLongScreen ? 'text-4xl xl:text-5xl' : 'text-3xl',
    contentClasses: isShortScreen ? 'text-lg' : isLongScreen ? 'text-lg xl:text-2xl' : 'text-lg',
  };
  if (!stepItems.some(isQuestion) && step.imageUrl && step.displayMode === ImageDisplayMode.FullScreenImage) {
    return (
      <div className="absolute left-1/2  top-12 transform -translate-x-1/2 w-[100vw] rounded mx-auto">
        {width > height ? (
          <img src={step.imageUrl} alt="byte" style={{ height: imageHeight }} className={`rounded mx-auto ${styles.imgContainer}`} />
        ) : (
          <img src={step.imageUrl} alt="byte" style={{ maxHeight: imageHeight }} className={`rounded mx-auto ${styles.imgContainer}`} />
        )}
        <div id="heading" className="flex justify-center w-full mt-4">
          <h1 className={stepClasses.headingClasses}>{step.name || byte.name}</h1>
        </div>
        <div id="summary" dangerouslySetInnerHTML={{ __html: stepContents }} className={`markdown-body text-center ` + stepClasses.contentClasses} />
      </div>
    );
  }

  return (
    <>
      {!stepItems.some(isQuestion) && !isShortScreen && step.imageUrl && (
        <div className="flex justify-center align-center ">
          <img src={step.imageUrl} alt="byte" className={`max-h-[35vh] rounded ${styles.imgContainer}`} />
        </div>
      )}
      <div className="flex justify-center w-full mt-4">
        <h1 className={stepClasses.headingClasses}>{step.name || byte.name}</h1>
      </div>
      <div className="mt-4 lg:mt-8 text-left">
        <div dangerouslySetInnerHTML={{ __html: stepContents }} className={`markdown-body text-center ` + stepClasses.contentClasses} />
        {stepItems.map((stepItem: ByteStepItemFragment, index) => {
          if (isQuestion(stepItem)) {
            return (
              <div key={index} className="border-2 rounded-lg p-4 border-transparent ">
                <QuestionSection
                  key={index}
                  nextButtonClicked={nextButtonClicked}
                  allQuestionsAnsweredCorrectly={questionsAnsweredCorrectly}
                  allQuestionsAnswered={questionNotAnswered}
                  stepItem={stepItem as ByteQuestionFragmentFragment}
                  stepItemSubmission={viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid)}
                  onSelectAnswer={selectAnswer}
                />
              </div>
            );
          }

          if (isUserDiscordConnect(stepItem)) {
            return (
              <UserDiscord
                key={index}
                userDiscord={stepItem as ByteUserDiscordConnectFragmentFragment}
                discordResponse={viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid) as UserDiscordInfoInput}
                spaceId={space.id}
                guideUuid={byte.id}
                stepUuid={step.uuid}
                stepOrder={activeStepOrder}
              />
            );
          }

          if (isUserInput(stepItem)) {
            const inputFragment = stepItem as ByteUserInputFragmentFragment;
            return (
              <UserInput
                key={index}
                modelValue={viewByteHelper.getStepItemSubmission(step.uuid, inputFragment.uuid) as string}
                label={inputFragment.label}
                required={inputFragment.required}
                setUserInput={(userInput: string) => setUserInput(inputFragment.uuid, userInput)}
              />
            );
          }

          return null;
        })}
        {postSubmissionContent && <div className="mt-4 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: postSubmissionContent }} />}
      </div>
    </>
  );
}
