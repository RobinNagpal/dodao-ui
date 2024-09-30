import ErrorWithAccentBorder from '@dodao/web-core/components/core/errors/ErrorWithAccentBorder';
import { useEffect, useRef } from 'react';

interface ByteStepperItemWarningsProps {
  showQuestionsCompletionWarning: boolean;
  isUserInputComplete: () => boolean;
  isQuestionAnswered: () => boolean;
  isDiscordConnected: () => boolean;
}

function ByteStepperItemWarnings({
  showQuestionsCompletionWarning,
  isUserInputComplete,
  isQuestionAnswered,
  isDiscordConnected,
}: ByteStepperItemWarningsProps) {
  const myDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isQuestionAnswered()) {
      myDivRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isQuestionAnswered]);

  return (
    <div className="mb-4">
      {showQuestionsCompletionWarning && (
        <>
          {!isQuestionAnswered() && (
            <div ref={myDivRef}>
              <ErrorWithAccentBorder error="Answer question to proceed" />
            </div>
          )}
          {!isUserInputComplete() && <ErrorWithAccentBorder error="Add information to proceed" />}
          {!isDiscordConnected() && <ErrorWithAccentBorder error="Connect your Discord account to proceed" />}
        </>
      )}
    </div>
  );
}

export default ByteStepperItemWarnings;
