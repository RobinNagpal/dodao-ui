import GenerateQuestionsUsingAI, { GeneratedQuestionInterface } from '@/components/ai/questions/GenerateQuestionsUsingAI';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';

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
    <FullPageModal open={open} onClose={onClose} title={props.modalTitle}>
      <div className="p-4">
        <GenerateQuestionsUsingAI {...props} />
      </div>
    </FullPageModal>
  );
}
