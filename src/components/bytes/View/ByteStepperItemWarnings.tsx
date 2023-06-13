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
    <>
      {showUseInputCompletionWarning && (
        <div className="mb-2 text-red">
          <i className="iconfont iconwarning"></i>
          <span className="ml-1">Answer all the questions in guide to complete</span>
        </div>
      )}
      {showQuestionsCompletionWarning && (
        <>
          {!isQuestionAnswered() && (
            <div className="mb-2 text-red">
              <i className="iconfont iconwarning"></i>
              <span className="ml-1">Answer question to proceed</span>
            </div>
          )}

          {!isUserInputComplete() && (
            <div className="mb-2 text-red">
              <i className="iconfont iconwarning"></i>
              <span className="ml-1">Answer question to proceed</span>
            </div>
          )}

          {!isDiscordConnected() && (
            <div className="mb-2 text-red">
              <i className="iconfont iconwarning"></i>
              <span className="ml-1">Connect Discord to proceed</span>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default ByteStepperItemWarnings;
