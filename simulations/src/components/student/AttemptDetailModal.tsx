'use client';

import { Eye, Brain, MessageSquare, Sparkles, X } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import type { ExerciseAttempt } from '@prisma/client';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';

interface AttemptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempt: ExerciseAttempt | null;
}

export default function AttemptDetailModal({ isOpen, onClose, attempt }: AttemptDetailModalProps) {
  if (!attempt) return null;

  return (
    <FullPageModal
      open={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Attempt {attempt.attemptNumber} Details</span>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                attempt.status === 'completed' ? 'bg-green-500' : attempt.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
              }`}
            ></div>
            <span className="text-sm text-gray-600 font-medium capitalize">{attempt.status}</span>
          </div>
        </div>
      }
    >
      <div className="px-8 text-left mx-auto space-y-6 pb-4">
        {/* Your Prompt */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 p-2 rounded-xl">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span>Your Prompt</span>
          </h3>
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200/50">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{attempt.prompt}</p>
          </div>
        </div>

        {/* AI Response */}
        {attempt.promptResponse && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span>AI Response</span>
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50">
              <div
                className="markdown-body prose prose-purple prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(attempt.promptResponse) }}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {attempt.error && (
          <div className="space-y-3">
            <h3 className="font-semibold text-red-900 flex items-center space-x-2">
              <div className="bg-red-500 p-2 rounded-xl">
                <X className="h-4 w-4 text-white" />
              </div>
              <span>Error</span>
            </h3>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-red-700">{attempt.error}</p>
            </div>
          </div>
        )}
      </div>
    </FullPageModal>
  );
}
