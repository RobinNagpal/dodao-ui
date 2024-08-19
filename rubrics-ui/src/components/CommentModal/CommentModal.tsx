'use client';

import { RubricCriteria } from '@prisma/client';
import { useState } from 'react';

export interface CommentModalProps {
  onSave: (comment: string) => Promise<void>;
  criteria: RubricCriteria;
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ onClose, onSave, criteria }) => {
  const [comment, setComment] = useState<string>('');

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-xl mb-2">Edit Comment for {criteria.title}</h2>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full h-24 p-2 border rounded" />
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={async () => {
              await onSave(comment);
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
export default CommentModal;
