'use client';

import { Button } from '@/components/ui/button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { BookOpen } from 'lucide-react';

interface InstructionRequiredModalProps {
  open: boolean;
  onClose: () => void;
  instructionModalData: {
    type: 'case_study' | 'module';
    message: string;
    moduleId?: string;
  } | null;
  handleViewInstructions: () => void;
}

export default function InstructionRequiredModal({ open, onClose, instructionModalData, handleViewInstructions }: InstructionRequiredModalProps) {
  return (
    <FullPageModal
      open={open}
      onClose={onClose}
      title={
        <div className="text-center">
          <span className="text-xl font-bold text-orange-600">Instructions Required</span>
        </div>
      }
      className="w-full max-w-2xl"
    >
      <div className="px-8 text-center mx-auto space-y-6 pb-4">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-200">
          <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-orange-600" />
          </div>

          <h3 className="text-lg font-semibold text-orange-900 mb-4">{instructionModalData?.message}</h3>

          <div className="space-y-3">
            <Button
              onClick={handleViewInstructions}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              View {instructionModalData?.type === 'case_study' ? 'Case Study' : 'Module'} Instructions
            </Button>

            <div className="text-sm text-orange-700">You’ll need to read the instructions before you can continue.</div>
          </div>
        </div>
      </div>
    </FullPageModal>
  );
}
