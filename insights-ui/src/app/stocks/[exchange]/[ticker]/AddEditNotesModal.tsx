'use client';

import { useState, useEffect } from 'react';
import Input from '@dodao/web-core/components/core/input/Input';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CreateTickerNoteRequest } from '@/app/api/[spaceId]/users/ticker-notes/route';
import { UpdateTickerNoteRequest } from '@/app/api/[spaceId]/users/ticker-notes/[noteId]/route';
import { TickerV1Notes } from '@prisma/client';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { parseMarkdown } from '@/util/parse-markdown';

interface AddEditNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
  onSuccess?: () => void;
  existingNote: TickerV1Notes | null;
  onUpsert: () => void;
  viewOnly?: boolean;
}

export default function AddEditNotesModal({
  isOpen,
  onClose,
  tickerId,
  tickerSymbol,
  tickerName,
  onSuccess,
  existingNote,
  onUpsert,
  viewOnly = false,
}: AddEditNotesModalProps) {
  // Form state
  const [notes, setNotes] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Post and Put hooks for notes
  const { postData: createNote, loading: creating } = usePostData<TickerV1Notes, CreateTickerNoteRequest>({
    successMessage: 'Note saved!',
    errorMessage: 'Failed to save note.',
  });

  const { putData: updateNote, loading: updating } = usePutData<TickerV1Notes, UpdateTickerNoteRequest>({
    successMessage: 'Note updated!',
    errorMessage: 'Failed to update note.',
  });

  const { deleteData, loading: deleting } = useDeleteData<{ success: boolean }, void>({
    successMessage: 'Note deleted!',
    errorMessage: 'Failed to delete note.',
  });

  const loading = creating || updating || deleting;

  // Update form when existing note changes
  useEffect(() => {
    if (isOpen) {
      if (existingNote) {
        setNotes(existingNote.notes || '');
        setScore(existingNote.score?.toString() || '');
      } else {
        // Reset form for new note
        setNotes('');
        setScore('');
      }
    }
  }, [isOpen, existingNote]);

  const handleSave = async (): Promise<void> => {
    if (!notes.trim()) {
      return;
    }

    const scoreValue: number | undefined = score ? parseFloat(score) : undefined;

    if (existingNote) {
      // Update existing note
      const updateData: UpdateTickerNoteRequest = {
        notes: notes.trim(),
        score: score === '' ? null : scoreValue,
      };

      const result = await updateNote(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/ticker-notes/${existingNote.id}`, updateData);
      if (result) {
        onUpsert();
        onSuccess?.();
        onClose();
      }
    } else {
      // Create new note
      const createData: CreateTickerNoteRequest = {
        tickerId,
        notes: notes.trim(),
        score: scoreValue,
      };

      const result = await createNote(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/ticker-notes`, createData);
      if (result) {
        onUpsert();
        onSuccess?.();
        onClose();
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!existingNote) return;

    const result = await deleteData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/ticker-notes/${existingNote.id}`);
    if (result) {
      setShowDeleteConfirmation(false);
      onUpsert();
      onSuccess?.();
      onClose();
    }
  };

  return (
    <FullPageModal
      open={isOpen}
      onClose={onClose}
      title={viewOnly ? `Notes for ${tickerName} (${tickerSymbol})` : existingNote ? 'Edit Note' : `Add Note for ${tickerName} (${tickerSymbol})`}
      className="w-full max-w-2xl"
    >
      <div className="px-6 py-4 space-y-6 text-left">
        {/* Notes */}
        <div className="space-y-2">
          {viewOnly ? (
            <div>
              <label className="text-sm font-medium block mb-2">Notes:</label>
              <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(notes) }} />
            </div>
          ) : (
            <MarkdownEditor
              id="notes"
              objectId={tickerId}
              modelValue={notes}
              onUpdate={(value) => setNotes(value)}
              label={
                <>
                  Notes <span className="text-red-500">*</span>
                </>
              }
              placeholder="Add your notes about this stock..."
              maxHeight={300}
            />
          )}
        </div>

        {/* Score */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium whitespace-nowrap">My Score (0-25):</label>
          <div className="flex-1 max-w-xs">
            <Input
              modelValue={score}
              onUpdate={(value) => setScore(value?.toString() || '')}
              number={true}
              min={0}
              max={25}
              placeholder="0-25"
              className="bg-gray-800 border-gray-700 text-white w-full"
              disabled={viewOnly}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-5 mt-2 border-t border-gray-700">
          {viewOnly ? (
            <div />
          ) : (
            <div>
              {existingNote && (
                <Button
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={loading}
                  variant="outlined"
                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  Delete Note
                </Button>
              )}
            </div>
          )}
          <div className="flex gap-3">
            {viewOnly ? (
              <Button onClick={onClose} variant="contained" primary>
                Close
              </Button>
            ) : (
              <>
                <Button onClick={onClose} disabled={loading} variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading || !notes.trim()} loading={loading} variant="contained" primary>
                  {existingNote ? 'Update' : 'Save'} Note
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onDelete={handleDelete}
        deleting={deleting}
        title="Delete Note"
        deleteButtonText="Delete Note"
        confirmationText="Delete Note"
      />
    </FullPageModal>
  );
}
