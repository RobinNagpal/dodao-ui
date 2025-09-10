import { UpsertAnalysisFactorsRequest } from '@/types/public-equity/analysis-factors-types';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React, { useState } from 'react';

export interface ExportJsonModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  analysisFactors: UpsertAnalysisFactorsRequest;
}

export default function ExportJsonModal({ open, onClose, title, analysisFactors }: ExportJsonModalProps) {
  const [copySuccess, setCopySuccess] = useState<string>('');

  // Format the JSON with indentation for better readability
  const formattedJson = JSON.stringify(analysisFactors, null, 2);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopySuccess('Copied to clipboard!');

      // Reset the success message after 2 seconds
      setTimeout(() => {
        setCopySuccess('');
      }, 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col h-[calc(100vh-120px)] p-4">
        {/* JSON Display */}
        <div className="flex-1 overflow-hidden">
          <TextareaAutosize
            label={''}
            modelValue={formattedJson}
            onUpdate={() => {}} // Read-only, no updates
            className="h-full w-full font-mono text-sm resize-none pb-4"
            fillParent={true}
            readOnly={true}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
          <Button onClick={handleCopyToClipboard} primary variant="contained">
            Copy to Clipboard
          </Button>
          {copySuccess && <span className="text-green-500 ml-2 self-center">{copySuccess}</span>}
        </div>
      </div>
    </FullPageModal>
  );
}
