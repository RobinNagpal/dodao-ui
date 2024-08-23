'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { RubricCriteria } from '@prisma/client';
import { useState } from 'react';

export interface CommentModalProps {
  open: boolean;
  onSave: (comment: string) => Promise<void>;
  criteria: RubricCriteria;
  onClose: () => void;
}

export default function CommentModal({ open, onClose, onSave, criteria }: CommentModalProps) {
  const [comment, setComment] = useState<string>('');

  return (
    <SingleSectionModal open={open} onClose={onClose} title={'Submit Rating'}>
      <h2 className="text-xl mb-2">Edit Comment for {criteria.title}</h2>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full h-24 p-2 border rounded" />
      <div className="mt-4 flex justify-end space-x-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={async () => {
            await onSave(comment);
            onClose();
          }}
          variant="contained"
          primary
        >
          Save
        </Button>
      </div>
    </SingleSectionModal>
  );
}
