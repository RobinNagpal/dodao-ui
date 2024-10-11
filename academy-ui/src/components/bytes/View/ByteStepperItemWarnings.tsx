import { UseViewByteHelper } from '@/components/bytes/View/useViewByteInModal';
import { ByteStepDto } from '@/types/bytes/ByteDto';
import ErrorWithAccentBorder from '@dodao/web-core/components/core/errors/ErrorWithAccentBorder';
import { useEffect, useRef } from 'react';

interface ByteStepperItemWarningsProps {
  step: ByteStepDto;
  viewByteHelper: UseViewByteHelper;
}

function ByteStepperItemWarnings({ step, viewByteHelper }: ByteStepperItemWarningsProps) {
  const myDivRef = useRef<HTMLDivElement | null>(null);

  const stepResponsesMapElement = viewByteHelper.byteSubmission.stepResponsesMap[step.uuid];

  useEffect(() => {
    if (!viewByteHelper.isQuestionAnswered(step.uuid)) {
      myDivRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stepResponsesMapElement]);

  return (
    <div className="mb-4">
      {viewByteHelper.isStepTouched(step.uuid) && (
        <>
          {!viewByteHelper.isQuestionAnswered(step.uuid) && (
            <div ref={myDivRef}>
              <ErrorWithAccentBorder error="Answer question to proceed" />
            </div>
          )}
          {!viewByteHelper.isUserInputComplete(step.uuid) && <ErrorWithAccentBorder error="Add information to proceed" />}
          {!viewByteHelper.isDiscordConnected(step.uuid) && <ErrorWithAccentBorder error="Connect your Discord account to proceed" />}
        </>
      )}
    </div>
  );
}

export default ByteStepperItemWarnings;
