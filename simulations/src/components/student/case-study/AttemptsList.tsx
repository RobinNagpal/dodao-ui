import AttemptDetailModal from '@/components/shared/AttemptDetailModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { ExerciseAttempt } from '@prisma/client';
import { AlertCircle, CheckCircle, Clock, Eye, Star } from 'lucide-react';
import { useState } from 'react';

/**
 * -----------------------------
 * Child Component: AttemptsList
 * -----------------------------
 * Owns: attempt selection + details modal
 */
interface AttemptsListProps {
  attempts: ExerciseAttempt[];
  exerciseId: string;
  onAttemptsUpdate: (attempts: ExerciseAttempt[]) => void;
}

interface SelectAttemptRequest {
  attemptId: string;
}

interface SelectAttemptResponse {
  attempts: ExerciseAttempt[];
}

export function AttemptsList({ attempts, exerciseId, onAttemptsUpdate }: AttemptsListProps) {
  const [selectedAttempt, setSelectedAttempt] = useState<ExerciseAttempt | null>(null);
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState<boolean>(false);

  const { postData: selectAttempt, loading: selectingAttempt } = usePostData<SelectAttemptResponse, SelectAttemptRequest>({
    successMessage: 'Attempt selected for summary!',
    errorMessage: 'Failed to select attempt. Please try again.',
  });

  const openAttemptModal = (attempt: ExerciseAttempt): void => {
    setSelectedAttempt(attempt);
    setIsAttemptModalOpen(true);
  };

  const closeAttemptModal = (): void => {
    setSelectedAttempt(null);
    setIsAttemptModalOpen(false);
  };

  const getAttemptStatusIcon = (attempt: ExerciseAttempt): JSX.Element => {
    if (attempt.status === 'completed') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (attempt.status === 'failed') return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getAttemptStatusText = (attempt: ExerciseAttempt): string => {
    if (attempt.status === 'completed') return 'Completed';
    if (attempt.status === 'failed') return 'Failed';
    return 'Processing';
  };

  const remainingAttempts: number = Math.max(0, 3 - attempts.filter((a) => a.status === 'completed' || a.status === 'failed').length);

  const handleSelectAttempt = async (attemptId: string): Promise<void> => {
    if (selectingAttempt) return;
    try {
      const result = await selectAttempt(`${getBaseUrl()}/api/student/exercises/${exerciseId}/attempts/select`, { attemptId });
      if (result) onAttemptsUpdate(result.attempts);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error selecting attempt:', err);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          Your Attempts
        </h2>
        <div className="text-sm text-gray-600">
          Remaining Attempts: <span className="font-bold text-blue-600">{remainingAttempts}</span>
        </div>
      </div>

      <div className="space-y-3">
        {attempts.map((attempt: ExerciseAttempt) => (
          <div
            key={attempt.id}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Attempt {attempt.attemptNumber}</span>
                <div className="flex items-center space-x-1">
                  {getAttemptStatusIcon(attempt)}
                  <span
                    className={`text-sm font-medium ${
                      attempt.status === 'completed' ? 'text-green-600' : attempt.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  >
                    {getAttemptStatusText(attempt)}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(attempt.createdAt).toLocaleDateString()} at {new Date(attempt.createdAt).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {attempt.status === 'completed' && attempt.promptResponse ? (
                <button
                  onClick={() => void handleSelectAttempt(attempt.id)}
                  disabled={selectingAttempt}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    attempt.selectedForSummary
                      ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-2 border-yellow-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:border-gray-300'
                  } ${selectingAttempt ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Star className={`h-4 w-4 ${attempt.selectedForSummary ? 'fill-current text-yellow-500' : ''}`} />
                  <span>{attempt.selectedForSummary ? 'Selected for Final Report' : 'Select for Final Report'}</span>
                </button>
              ) : null}
              <button
                onClick={() => openAttemptModal(attempt)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <AttemptDetailModal isOpen={isAttemptModalOpen} onClose={closeAttemptModal} attempt={selectedAttempt} />
    </div>
  );
}
