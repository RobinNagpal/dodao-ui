import UserDiscord from '@/components/app/Form/UserDiscord';
import styles from '@/components/bytes/View/ByteStepperItem/ByteStepperItemContent.module.scss';
import { QuestionSection } from '@/components/bytes/View/QuestionSection';
import { UseViewByteHelper } from '@/components/bytes/View/useViewByteInModal';
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
import Image from 'next/image';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';

interface ByteStepperItemContentProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseViewByteHelper;
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

export default function ByteStepperItemContent({
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

  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='2' height='2'>
    <rect width='100%' height='100%' fill='${space.themeColors?.blockBg || '#ccc'}' opacity='0.6'/>
  </svg>
`;

  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  const stepContents = useMemo(() => marked.parse(step.content || '', { renderer }), [step.content]);

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
  const maxHeight = height - 200;
  const maxWidth = (width * 9) / 10;

  if (!stepItems.some(isQuestion) && step.imageUrl && step.displayMode === ImageDisplayMode.FullScreenImage) {
    return createPortal(
      <div className="absolute left-20 right-20 bottom-20 top-20 z-20">
        {width > height ? (
          <Image
            src={step.imageUrl}
            alt="byte"
            style={{ width: maxWidth, maxHeight: maxHeight }}
            height={maxHeight}
            width={maxWidth}
            className={`rounded z-20 mx-auto ${styles.imgContainer}`}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
        ) : (
          <Image
            src={step.imageUrl}
            alt="byte"
            style={{ maxHeight: maxHeight }}
            height={maxHeight}
            width={width}
            className={`rounded z-20 mx-auto ${styles.imgContainer}`}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
        )}
        <div id="heading" className={`flex justify-center w-full mt-1 ${styles.fullScreenContent}`}>
          <h1 className="text-lg">
            {step.name || byte.name} : {step.content}
          </h1>
        </div>
      </div>,
      document.body
    );
  }

  const textAlignmentClass = getTailwindTextAlignmentClass(step.contentAlign || TextAlign.Center);
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
      <div className="mt-4 px-4 lg:mt-8 text-left">
        <div dangerouslySetInnerHTML={{ __html: stepContents }} className={`markdown-body ${textAlignmentClass} ` + stepClasses.contentClasses} />
        {stepItems.map((stepItem: ByteStepItem, index) => {
          if (isQuestion(stepItem)) {
            return (
              <div key={index} className="border-2 rounded-lg p-4 border-transparent ">
                <QuestionSection
                  key={index}
                  stepItem={stepItem as ByteQuestionFragmentFragment}
                  stepItemSubmission={viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid)}
                  onSelectAnswer={selectAnswer}
                  showCorrectAnswerAlso={showCorrectAnswerForQuestion}
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
