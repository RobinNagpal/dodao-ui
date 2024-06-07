import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';

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
  return (
    <div className="mb-4">
      {showUseInputCompletionWarning && <ErrorWithAccentBorder error="Answer all the questions in guide to complete" />}
      {showQuestionsCompletionWarning && (
        <>
          {!isQuestionAnswered() && <ErrorWithAccentBorder error="Answer question to proceed" />}

          {!isUserInputComplete() && <ErrorWithAccentBorder error="Add information to proceed" />}

          {!isDiscordConnected() && <ErrorWithAccentBorder error="Connect your Discord account to proceed" />}
        </>
      )}
    </div>
  );
}

export default ByteStepperItemWarnings;
