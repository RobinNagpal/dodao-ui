import GenerateQuestionUsingAI, { GeneratedQuestionInterface } from '@/components/ai/GenerateQuestionUsingAI';
import FullScreenModal from '@/components/core/modals/FullScreenModal';

import React from 'react';

export interface GenerateQuestionUsingAIModalProps {
  open: boolean;
  onClose: () => void;
  onGenerateContent: (questions: GeneratedQuestionInterface[]) => void;
  modalTitle: string;
  generatePrompt: (topic: string, numberOfQuestion: number, cleanedContent: string) => string;
}

export default function GenerateQuestionUsingAIModal(props: GenerateQuestionUsingAIModalProps) {
  const { open, onClose } = props;

  return (
    <FullScreenModal open={open} onClose={onClose} title={props.modalTitle}>
      <GenerateQuestionUsingAI {...props} />
    </FullScreenModal>
  );
}
