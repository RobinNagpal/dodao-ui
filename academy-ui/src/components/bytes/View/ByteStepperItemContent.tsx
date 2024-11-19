import UserDiscord from '@/components/app/Form/UserDiscord';
import { ByteQuestionItemSection } from '@/components/bytes/View/ByteQuestionItemSection';
import styles from '@/components/bytes/View/ByteStepperItem/ByteStepperItemContent.module.scss';
import ByteStepperItemWarnings from '@/components/bytes/View/ByteStepperItemWarnings';
import { UseViewByteHelper } from '@/components/bytes/View/useViewByteHelper';
import {
  ByteQuestionFragmentFragment,
  ByteUserDiscordConnectFragmentFragment,
  ByteUserInputFragmentFragment,
  ImageDisplayMode,
  UserDiscordInfoInput,
} from '@/graphql/generated/generated-types';
import { ByteDto, ByteStepDto } from '@/types/bytes/ByteDto';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { ByteStepItem } from '@/types/stepItems/stepItemDto';
import UserInput from '@dodao/web-core/components/app/Form/UserInput';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { TextAlign } from '@dodao/web-core/types/ui/TextAlign';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface ByteStepperItemContentProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsDto;
  viewByteHelper: UseViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
  activeStepOrder: number;
  width: number;
  height: number;
  isShortScreen: boolean;
  isSwiper: boolean;
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

interface FullScreenImageProps {
  space: SpaceWithIntegrationsDto;
  imageUrl: string;
  width: number;
  height: number;
  className?: string;
}

export function FullScreenImage({ space, imageUrl, width, height, className = '' }: FullScreenImageProps) {
  const maxHeight = height - 200;
  const maxWidth = width * 0.8;

  const [imageDimensions, setImageDimensions] = useState({ width: maxWidth, height: maxHeight });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='2' height='2'>
      <rect width='100%' height='100%' fill='${space.themeColors?.blockBg || '#ccc'}' opacity='0.6'/>
    </svg>
  `;
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return (
    <>
      <Image
        src={imageUrl}
        alt="byte"
        className={className}
        placeholder="blur"
        blurDataURL={blurDataURL}
        width={imageDimensions.width}
        height={imageDimensions.height}
        onClick={() => setShowFullScreenModal(true)}
        style={{
          transition: 'opacity 500ms ease-in-out',
          cursor: 'zoom-in',
        }}
        onLoadingComplete={({ naturalWidth, naturalHeight }) => {
          const aspectRatio = naturalWidth / naturalHeight;
          let displayWidth = maxWidth;
          let displayHeight = displayWidth / aspectRatio;

          if (displayHeight > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = displayHeight * aspectRatio;
          }

          setImageDimensions({ width: displayWidth, height: displayHeight });
          setIsImageLoaded(true);
        }}
      />

      {showFullScreenModal && (
        <FullScreenModal open={true} onClose={() => setShowFullScreenModal(false)} title={''} showTitleBg={false}>
          <img src={imageUrl} alt="Uploaded file" className="w-full h-[90vh] px-5 object-contain" />
        </FullScreenModal>
      )}
    </>
  );
}

function SwiperFullScreenImageContent(props: ByteStepperItemContentProps) {
  const { step, space, width, height } = props;

  return (
    <div style={{ width: '100vw' }}>
      {step.imageUrl && (
        <div className="flex justify-center align-center">
          <FullScreenImage space={space} width={width} height={height} imageUrl={step.imageUrl} className={`rounded ${styles.imgContainer}`} />
        </div>
      )}
      <div className="flex justify-center w-full mt-4">
        <h3 className="text-lg text-color">
          {step.name} : {step.content}
        </h3>
      </div>
    </div>
  );
}

function NormalFullScreenImageContent(props: ByteStepperItemContentProps) {
  const { step, space, width, height } = props;

  if (!step.imageUrl) return null;

  return createPortal(
    <div className="absolute left-20 right-20 bottom-20 top-20 z-20">
      <FullScreenImage imageUrl={step.imageUrl} space={space} width={width} height={height} className={`rounded z-20 mx-auto ${styles.imgContainer}`} />
      <div className="flex justify-center w-full mt-4">
        <h3 className="text-lg text-color">
          {step.name} : {step.content}
        </h3>
      </div>
    </div>,
    document.body
  );
}

export default function ByteStepperItemContent(props: ByteStepperItemContentProps) {
  const { byte, step, space, viewByteHelper, activeStepOrder, isSwiper, width, height, isShortScreen } = props;

  const stepItems = step.stepItems;

  const renderer = getMarkedRenderer();
  const stepContents = marked.parse(step.content || '', { renderer });

  const postSubmissionContent = useMemo(
    () => (byte.postSubmissionStepContent ? marked.parse(byte.postSubmissionStepContent, { renderer }) : null),
    [byte.postSubmissionStepContent]
  );

  if (!stepItems.some(isQuestion) && step.imageUrl && step.displayMode === ImageDisplayMode.FullScreenImage) {
    if (isSwiper) {
      return <SwiperFullScreenImageContent {...props} />;
    } else {
      return <NormalFullScreenImageContent {...props} />;
    }
  }

  const isLongScreen = height >= 900;

  const stepClasses = {
    headingClasses: isShortScreen ? 'text-3xl' : isLongScreen ? 'text-4xl xl:text-5xl' : 'text-3xl',
    contentClasses: isShortScreen ? 'text-lg' : isLongScreen ? 'text-lg xl:text-2xl' : 'text-lg',
  };

  const textAlignmentClass = getTailwindTextAlignmentClass(step.contentAlign || TextAlign.Center);

  const selectAnswer = (questionId: string, selectedAnswers: string[]) => {
    viewByteHelper.selectAnswer(step.uuid, questionId, selectedAnswers);
  };

  const setUserInput = (userInputUuid: string, userInput: string) => {
    viewByteHelper.setUserInput(step.uuid, userInputUuid, userInput);
  };

  return (
    <div className="w-full">
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
                <ByteQuestionItemSection
                  key={index}
                  question={stepItem as ByteQuestionFragmentFragment}
                  step={step}
                  viewByteHelper={viewByteHelper}
                  stepItemSubmission={viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid)}
                  onSelectAnswer={selectAnswer}
                  isSwiper={isSwiper}
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
        <ByteStepperItemWarnings step={step} viewByteHelper={viewByteHelper} />
      </div>
    </div>
  );
}
