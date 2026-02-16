import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';

export interface JsonViewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  jsonData?: any;
}

export default function JsonViewModal({ open, onClose, title, jsonData }: JsonViewModalProps) {
  let formattedJson = '';
  try {
    if (jsonData) {
      formattedJson = JSON.stringify(jsonData, null, 2);
    }
  } catch (error) {
    formattedJson = JSON.stringify({ error: 'Unable to format JSON data' }, null, 2);
  }

  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col h-[calc(100vh-120px)] p-4\">
        <div className="flex-1 overflow-hidden bg-gray-50 rounded-lg border\">
          <pre className="h-full w-full font-mono text-sm p-4 overflow-auto text-gray-800 whitespace-pre-wrap\">{formattedJson}</pre>
        </div>
      </div>
    </FullPageModal>
  );
}
