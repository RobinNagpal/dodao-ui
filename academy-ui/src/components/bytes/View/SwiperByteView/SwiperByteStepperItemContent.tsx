import UserDiscord from '@/components/app/Form/UserDiscord';
import { QuestionSection } from '@/components/bytes/View/QuestionSection';
import { UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import {
  ByteQuestionFragmentFragment,
  ByteUserDiscordConnectFragmentFragment,
  ByteUserInputFragmentFragment,
  ImageDisplayMode,
  SpaceWithIntegrationsFragment,
  UserDiscordInfoInput,
} from '@/graphql/generated/generated-types';
import { ByteDto, ByteStepDto } from '@/types/bytes/ByteDto';
import { ByteStepItem } from '@/types/stepItems/stepItemDto';
import UserInput from '@dodao/web-core/components/app/Form/UserInput';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { TextAlign } from '@dodao/web-core/types/ui/TextAlign';
import { marked } from 'marked';
import { useMemo } from 'react';
import styles from './SwiperByteStepperItemContent.module.scss';

interface ByteStepperItemContentProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseGenericViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
  renderer: marked.Renderer;
  activeStepOrder: number;
  width: number;
  height: number;
  isShortScreen: boolean;
  showCorrectAnswerForQuestion: boolean;
}

function getTailwindTextAlignmentClass(textAlignment: TextAlign) {
  switch (textAlignment) {
    case TextAlign.Center:
      return 'text-center';
    case TextAlign.Left:
      return 'text-left';
    case TextAlign.Right:
      return 'text-right';
    case TextAlign.Justify:
      return 'text-justify';
    default:
      return 'text-left';
  }
}

function ByteMainContent({
  step,
  stepItems,
  isShortScreen,
  isLongScreen,
  renderer,
  width,
  height,
}: {
  stepItems: Array<ByteStepItem>;
  isShortScreen: boolean;
  isLongScreen: boolean;
  step: ByteStepDto;
  renderer: marked.Renderer;
  width: number;
  height: number;
}) {
  const stepClasses = {
    headingClasses: isShortScreen ? 'text-3xl' : isLongScreen ? 'text-4xl xl:text-5xl' : 'text-3xl',
    contentClasses: isShortScreen ? 'text-lg' : isLongScreen ? 'text-lg xl:text-2xl' : 'text-lg',
  };

  const textAlignmentClass = getTailwindTextAlignmentClass(step.contentAlign || TextAlign.Center);
  const stepContents = useMemo(() => marked.parse(step.content || '', { renderer }), [step.content]);
  if (step.displayMode === ImageDisplayMode.FullScreenImage) {
    return (
      <div style={{ width: '100vw' }}>
        {step.imageUrl && (
          <div className="flex justify-center align-center ">
            <img src={step.imageUrl} alt="byte" className={`rounded ${styles.imgContainer}`} style={{ width: width * 0.8 }} />
          </div>
        )}
        <div className="flex justify-center w-full mt-4">
          <h3 className="text-lg">
            {step.name} : {step.content}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!stepItems.some(isQuestion) && !isShortScreen && step.imageUrl && (
        <div className="flex justify-center align-center ">
          <img src={step.imageUrl} alt="byte" className={`max-h-[35vh] rounded ${styles.imgContainer}`} />
        </div>
      )}
      <div className="flex justify-center w-full mt-4">
        <h1 className={stepClasses.headingClasses}>{step.name}</h1>
      </div>
      <div className="mt-4 px-4 lg:mt-8 text-left">
        <div dangerouslySetInnerHTML={{ __html: stepContents }} className={`markdown-body ${textAlignmentClass} ` + stepClasses.contentClasses} />
      </div>
    </div>
  );
}

export default function SwiperByteStepperItemContent({
  step,
  viewByteHelper,
  space,
  renderer,
  byte,
  activeStepOrder,
  width,
  height,
  isShortScreen,
  showCorrectAnswerForQuestion,
}: ByteStepperItemContentProps) {
  const stepItems = step.stepItems;

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

  return (
    <div className={`flex flex-col flex-grow justify-center align-center px-4`}>
      <ByteMainContent
        stepItems={stepItems}
        isShortScreen={isShortScreen}
        isLongScreen={isLongScreen}
        step={step}
        renderer={renderer}
        width={width}
        height={height}
      />
      <div className="mt-4 px-4 lg:mt-8 text-left">
        {stepItems.map((stepItem: ByteStepItem, index) => {
          if (isQuestion(stepItem)) {
            return (
              <div key={index} className="border-2 rounded-lg p-4 border-transparent ">
                <QuestionSection
                  key={index}
                  showCorrectAnswerAlso={showCorrectAnswerForQuestion}
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
    </div>
  );
}
