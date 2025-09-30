import { useRef, useState, type ChangeEvent } from 'react';
import type { ExerciseAttempt } from '@prisma/client';
import { ArrowLeft, CheckCircle, MessageSquare, RotateCcw, Send, Sparkles } from 'lucide-react';
import ViewAiResponseModal from '@/components/student/ViewAiResponseModal';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import type { NavigationData } from '@/components/student/case-study/types';

/* =========================================================
 * Types
 * =======================================================*/

export interface PromptComposerProps {
  exerciseId: string;
  attempts: ExerciseAttempt[] | null | undefined;
  navigationData: NavigationData | null | undefined;
  onNewAttempt: (attempt: ExerciseAttempt) => void;
  promptCharacterLimit: number;
  onMoveToPrevious: () => void;
  onMoveToNext: () => void;
}

interface CreateAttemptRequest {
  prompt: string;
}

interface CreateAttemptResponse {
  attempt: ExerciseAttempt;
}

interface AttemptStats {
  completedAttemptsCount: number;
  hasSuccessAttempt: boolean;
  remainingAttempts: number;
}

type NullableAttempts = ExerciseAttempt[] | null | undefined;

/* =========================================================
 * Constants & Helpers (no memoization)
 * =======================================================*/

const MAX_ATTEMPTS: number = 3;

const isCompletedOrFailed = (a: ExerciseAttempt): boolean => a.status === 'completed' || a.status === 'failed';

const getAttemptStats = (attempts: NullableAttempts): AttemptStats => {
  const list: ExerciseAttempt[] = attempts ?? [];
  const completedAttemptsCount: number = list.filter(isCompletedOrFailed).length;
  const hasSuccessAttempt: boolean = list.some((a: ExerciseAttempt) => a.status === 'completed' && Boolean(a.promptResponse));
  const remainingAttempts: number = Math.max(0, MAX_ATTEMPTS - completedAttemptsCount);

  return { completedAttemptsCount, hasSuccessAttempt, remainingAttempts };
};

const clamp = (val: number, min: number, max: number): number => Math.min(Math.max(val, min), max);

const getBarColorClass = (percentUsed: number): string => {
  if (percentUsed >= 95) return 'bg-red-500';
  if (percentUsed >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

/* =========================================================
 * Presentational Components
 * =======================================================*/

interface HeaderProps {
  remainingAttempts: number;
  show: boolean;
}
const PromptHeader = ({ remainingAttempts, show }: HeaderProps): JSX.Element | null => {
  if (!show) return null;
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <div className="bg-gradient-to-br from-green-500 to-teal-600 p-2 rounded-xl mr-3">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        Your Prompt
        <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
      </h2>
      <div className="text-sm text-gray-600">
        Remaining Attempts: <span className="font-bold text-blue-600">{remainingAttempts}</span>
      </div>
    </div>
  );
};

interface NavButtonProps {
  onMoveToPrevious: () => void;
  show: boolean;
}
const PreviousButton = ({ onMoveToPrevious, show }: NavButtonProps): JSX.Element | null => {
  if (!show) return null;
  return (
    <button
      onClick={onMoveToPrevious}
      className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Previous Exercise</span>
    </button>
  );
};

interface SuccessStateProps {
  navigationData: NavigationData | null | undefined;
  onMoveToPrevious: () => void;
  onMoveToNextLocal: () => void;
  onRetry: () => void;
  showPrev: boolean;
}
const SuccessStateWithRetry = ({ navigationData, onMoveToPrevious, onMoveToNextLocal, onRetry, showPrev }: SuccessStateProps): JSX.Element => {
  const nextCta: string = navigationData?.isComplete ? 'Continue to Report' : navigationData?.isNextExerciseInDifferentModule ? 'Next Module' : 'Next Exercise';

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
      <div className="text-center">
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Great work!</h3>
        <p className="text-gray-600 mb-4 text-base">You can continue to the next exercise or try again.</p>

        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            {showPrev && (
              <button
                onClick={onMoveToPrevious}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Previous Exercise</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onMoveToNextLocal}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {nextCta}
            </button>

            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Attempt Again
            </button>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
};

interface AttemptsUsedProps {
  navigationData: NavigationData | null | undefined;
  onMoveToPrevious: () => void;
  onMoveToNextLocal: () => void;
  showPrev: boolean;
}
const AllAttemptsUsed = ({ navigationData, onMoveToPrevious, onMoveToNextLocal, showPrev }: AttemptsUsedProps): JSX.Element => {
  const nextCta: string = navigationData?.isComplete
    ? 'Continue to Report'
    : navigationData?.isNextExerciseInDifferentModule
    ? 'Next Module'
    : 'Continue to Next Exercise';

  return (
    <div className="text-center">
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">All Attempts Completed</h3>
      <p className="text-gray-600 mb-4 text-base">You have used all {MAX_ATTEMPTS} attempts for this exercise.</p>

      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          {showPrev && (
            <button
              onClick={onMoveToPrevious}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Previous Exercise</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={onMoveToNextLocal}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {nextCta}
          </button>
        </div>

        <div className="flex-1" />
      </div>
    </div>
  );
};

/* =========================================================
 * Input Area (owns its own prompt + modals + submission)
 * =======================================================*/

export default function PromptComposer({
  exerciseId,
  attempts,
  navigationData,
  onNewAttempt,
  onMoveToPrevious,
  onMoveToNext,
  promptCharacterLimit,
}: PromptComposerProps): JSX.Element {
  // Local UI state
  const [prompt, setPrompt] = useState<string>('');
  const [hasMovedToNext, setHasMovedToNext] = useState<boolean>(false);
  const [showRetryPrompt, setShowRetryPrompt] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [showAiResponseModal, setShowAiResponseModal] = useState<boolean>(false);
  const [currentAiResponse, setCurrentAiResponse] = useState<string>('');

  // Character limit (ensure a sensible minimum of 1)
  const charLimit: number = Math.max(1, promptCharacterLimit);
  const usedChars: number = prompt.length;
  const remainingChars: number = clamp(charLimit - usedChars, 0, charLimit);
  const percentUsed: number = (usedChars / charLimit) * 100;
  const barColorClass: string = getBarColorClass(percentUsed);
  const isAtLimit: boolean = usedChars >= charLimit;

  // API
  const { postData: createAttempt, loading: submittingAttempt } = usePostData<CreateAttemptResponse, CreateAttemptRequest>({
    successMessage: 'Response generated successfully!',
    errorMessage: 'Failed to generate AI response. Please try again.',
  });

  // Textarea auto-resize
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autoResize = (): void => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 160), 800)}px`;
  };

  // Derived attempt stats (simple function each render)
  const { completedAttemptsCount, hasSuccessAttempt, remainingAttempts } = getAttemptStats(attempts);

  // Permissions + view logic (plain booleans)
  const canSubmitNewAttempt: boolean = !hasMovedToNext && completedAttemptsCount < MAX_ATTEMPTS;

  const shouldShowPromptInput: boolean = (() => {
    if (!attempts) return true;
    if (hasSuccessAttempt && completedAttemptsCount < MAX_ATTEMPTS && !showRetryPrompt && !submittingAttempt) {
      return false;
    }
    return !hasMovedToNext && (completedAttemptsCount < MAX_ATTEMPTS || submittingAttempt || showRetryPrompt);
  })();

  const shouldShowAllAttemptsUsed: boolean = Boolean(attempts) && !hasMovedToNext && completedAttemptsCount >= MAX_ATTEMPTS && !submittingAttempt;

  const shouldShowSuccessStateWithRetry: boolean =
    Boolean(attempts) && !hasMovedToNext && !submittingAttempt && !showRetryPrompt && hasSuccessAttempt && completedAttemptsCount < MAX_ATTEMPTS;

  // Handlers (no useCallback)
  const clearPrompt = (): void => {
    setPrompt('');
    setTimeout(() => autoResize(), 0);
  };

  const handleSubmitClick = (): void => {
    if (!prompt.trim() || submittingAttempt || !canSubmitNewAttempt || isAtLimit) return;
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = (): void => {
    (async () => {
      if (!prompt.trim() || submittingAttempt || !canSubmitNewAttempt || isAtLimit) return;
      try {
        const result = await createAttempt(`/api/student/exercises/${exerciseId}/attempts`, {
          prompt: prompt.trim(),
        });

        if (!result) return;

        onNewAttempt(result.attempt);
        setPrompt('');
        setShowRetryPrompt(false);
        setShowConfirmationModal(false);

        if (result.attempt.promptResponse) {
          setCurrentAiResponse(result.attempt.promptResponse);
          setShowAiResponseModal(true);
        }

        setTimeout(() => autoResize(), 0);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error submitting prompt:', err);
      }
    })();
  };

  const handleMoveToNextLocal = (): void => {
    setHasMovedToNext(true);
    onMoveToNext();
  };

  // Render branches
  if (shouldShowSuccessStateWithRetry) {
    return (
      <>
        <SuccessStateWithRetry
          navigationData={navigationData}
          onMoveToPrevious={onMoveToPrevious}
          onMoveToNextLocal={handleMoveToNextLocal}
          onRetry={(): void => setShowRetryPrompt(true)}
          showPrev={!navigationData?.isFirstExercise}
        />
        <ViewAiResponseModal open={showAiResponseModal} onClose={(): void => setShowAiResponseModal(false)} aiResponse={currentAiResponse} />
      </>
    );
  }

  if (shouldShowAllAttemptsUsed) {
    return (
      <>
        <AllAttemptsUsed
          navigationData={navigationData}
          onMoveToPrevious={onMoveToPrevious}
          onMoveToNextLocal={handleMoveToNextLocal}
          showPrev={!navigationData?.isFirstExercise}
        />
        <ViewAiResponseModal open={showAiResponseModal} onClose={(): void => setShowAiResponseModal(false)} aiResponse={currentAiResponse} />
      </>
    );
  }

  // Default: prompt input
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
      <PromptHeader remainingAttempts={remainingAttempts} show={shouldShowPromptInput} />

      <div className="space-y-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => setPrompt(e.target.value)}
            onInput={(): void => autoResize()}
            maxLength={charLimit}
            aria-describedby="char-limit-hint"
            placeholder="Write your prompt here... Ask the AI to help you analyze the case study, provide insights, or guide you through the business concepts."
            className="w-full min-h-[160px] max-h-[800px] p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-base leading-relaxed transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-y-auto"
            disabled={submittingAttempt}
            style={{ height: '160px' }}
          />
          {/* Removed the old bottom-right raw counter in favor of the bar below */}
        </div>

        {/* Character limit bar + counts */}
        {promptCharacterLimit > 0 && (
          <div className="mt-1" aria-live="polite" id="char-limit-hint">
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
              <span>{remainingChars} characters left</span>
              <span>
                {usedChars} / {charLimit}
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div className={`h-2 rounded-full ${barColorClass} transition-all duration-200`} style={{ width: `${clamp(percentUsed, 0, 100)}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PreviousButton onMoveToPrevious={onMoveToPrevious} show={!navigationData?.isFirstExercise} />

            {!!prompt.trim() && (
              <button
                onClick={clearPrompt}
                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <button
            onClick={handleSubmitClick}
            disabled={!prompt.trim() || submittingAttempt || !canSubmitNewAttempt}
            title={isAtLimit ? 'You have reached the character limit' : undefined}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {submittingAttempt ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span className="font-medium">Processing...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span className="font-medium">Submit Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modals owned by the input area */}
      <ConfirmationModal
        open={showConfirmationModal}
        onClose={(): void => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSubmit}
        confirming={submittingAttempt}
        title="Submit Prompt Confirmation"
        content={
          <div className="mb-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                <span className="text-gray-700">Have you added all necessary context (Case Study and Module details)?</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                <span className="text-gray-700">Have you reviewed the prompt hint provided above for guidance?</span>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4 italic">Adding context helps the AI provide more relevant and accurate responses for this exercise.</p>
          </div>
        }
        askForTextInput={false}
        showSemiTransparentBg={true}
      />

      <ViewAiResponseModal open={showAiResponseModal} onClose={(): void => setShowAiResponseModal(false)} aiResponse={currentAiResponse} />
    </div>
  );
}
