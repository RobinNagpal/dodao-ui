'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { parseMarkdown } from '@/utils/parse-markdown';
import { Brain } from 'lucide-react';

interface AiResponseModalProps {
  open: boolean;
  onClose: () => void;
  aiResponse: string;
}

export default function ViewAiResponseModal({ open, onClose, aiResponse }: AiResponseModalProps) {
  return (
    <FullPageModal
      open={open}
      onClose={onClose}
      title={
        <div className="text-center">
          <span className="text-2xl font-bold flex items-center justify-center">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            AI Analysis
          </span>
        </div>
      }
    >
      <div className="px-8 text-left mx-auto space-y-6 pb-4 pt-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
          <div className="markdown-body prose prose-purple prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(aiResponse) }} />
        </div>
      </div>
    </FullPageModal>
  );
}
