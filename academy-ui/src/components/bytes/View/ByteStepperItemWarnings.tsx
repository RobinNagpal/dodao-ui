import ErrorWithAccentBorder from '@dodao/web-core/components/core/errors/ErrorWithAccentBorder';
import { useEffect, useRef } from 'react';

interface ByteStepperItemWarningsProps {
  showUseInputCompletionWarning: boolean;
  showQuestionsCompletionWarning: boolean;
  isUserInputComplete: () => boolean;
  isQuestionAnswered: () => boolean;
  isDiscordConnected: () => boolean;
}

function ByteStepperItemWarnings({
  showUseInputCompletionWarning,
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
      {showUseInputCompletionWarning && <ErrorWithAccentBorder error="Answer all the questions in guide to complete" />}
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
