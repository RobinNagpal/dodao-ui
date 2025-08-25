'use client';

import { Button } from '@/components/ui/button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { parseMarkdown } from '@/utils/parse-markdown';
import { Target, Lightbulb, FileText, Sparkles } from 'lucide-react';
import type { ModuleExercise } from '@/types';

interface ViewExerciseModalProps {
  open: boolean;
  onClose: () => void;
  exercise: ModuleExercise | null;
  moduleTitle?: string;
  moduleNumber?: number;
}

export default function ViewExerciseModal({ open, onClose, exercise, moduleTitle, moduleNumber }: ViewExerciseModalProps) {
  if (!exercise) return null;

  return (
    <FullPageModal
      open={open}
      onClose={onClose}
      title={
        <span className="text-lg font-bold">
          {moduleTitle && moduleNumber && <span className="text-gray-600 text-lg mr-2">Module {moduleNumber}</span>}
          Exercise {exercise.orderNumber}) {exercise.title}
        </span>
      }
    >
      <div className="px-8 text-left mx-auto space-y-6 pb-4">
        {/* Short Description Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-xl">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Exercise Overview</h4>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200/50">
            <p className="text-blue-900 text-base leading-relaxed">{exercise.shortDescription}</p>
          </div>
        </div>

        {/* AI Prompt Hint Section (if exists) */}
        {exercise.promptHint && (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">AI Prompt Hint</h4>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200/50">
              <p className="text-yellow-900 text-sm leading-relaxed font-medium">{exercise.promptHint}</p>
            </div>
          </div>
        )}

        {/* Exercise Details Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Detailed Instructions</h4>
          </div>
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.details) }} />
        </div>
      </div>
    </FullPageModal>
  );
}
