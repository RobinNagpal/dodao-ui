'use client';

import { Button } from '@/components/ui/button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { parseMarkdown } from '@/utils/parse-markdown';
import { Check } from 'lucide-react';

interface CaseStudyModalProps {
  open: boolean;
  onClose: () => void;
  caseStudy: any;
  hasCaseStudyInstructionsRead: () => boolean;
  handleMarkInstructionAsRead: (type: 'case_study' | 'module', moduleId?: string) => Promise<void>;
  updatingStatus: boolean;
}

export default function CaseStudyModal({
  open,
  onClose,
  caseStudy,
  hasCaseStudyInstructionsRead,
  handleMarkInstructionAsRead,
  updatingStatus,
}: CaseStudyModalProps) {
  return (
    <FullPageModal
      open={open}
      onClose={onClose}
      title={
        <div className="text-center">
          <span className="text-2xl font-bold">Case Study Details</span>
        </div>
      }
    >
      <div className="px-8 text-left mx-auto space-y-6 pb-4">
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(caseStudy?.details || '') }} />

        {/* Read Instructions Button */}
        {!hasCaseStudyInstructionsRead() && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
            <p className="text-blue-900 mb-4 font-medium">Please confirm that you have read and understood the case study instructions.</p>
            <Button
              onClick={() => handleMarkInstructionAsRead('case_study')}
              disabled={updatingStatus}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {updatingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Marking as Read...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />I Have Read the Instructions
                </>
              )}
            </Button>
          </div>
        )}

        {hasCaseStudyInstructionsRead() && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
            <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">You have read the case study instructions</p>
          </div>
        )}
      </div>
    </FullPageModal>
  );
}
