'use client';

import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CreateFavouriteEtfRequest, FavouriteEtfResponse, UpdateFavouriteEtfRequest } from '@/types/etf-user';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';
import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { parseMarkdown } from '@/util/parse-markdown';
import ScoreInput from '@/components/favourites/ScoreInput';
import { ETF_MAX_SCORE } from '@/utils/score-validation-utils';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';

interface AddEditEtfFavouriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  etfId: string;
  etfSymbol: string;
  etfName: string;
  onSuccess?: () => void;
  favouriteEtf: FavouriteEtfResponse | null;
  onUpsert: () => void;
  viewOnly?: boolean;
}

export default function AddEditEtfFavouriteModal({
  isOpen,
  onClose,
  etfId,
  etfSymbol,
  etfName,
  onSuccess,
  favouriteEtf,
  onUpsert,
  viewOnly = false,
}: AddEditEtfFavouriteModalProps) {
  // Form state
  const [myNotes, setMyNotes] = useState<string>('');
  const [myScore, setMyScore] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Post and Put hooks for favourites
  const { postData: createFavourite, loading: creating } = usePostData<FavouriteEtfResponse, CreateFavouriteEtfRequest>({
    successMessage: 'Added to favourites!',
    errorMessage: 'Failed to add favourite.',
  });

  const { putData: updateFavourite, loading: updating } = usePutData<FavouriteEtfResponse, UpdateFavouriteEtfRequest>({
    successMessage: 'Favourite updated!',
    errorMessage: 'Failed to update favourite.',
  });

  const { deleteData, loading: deleting } = useDeleteData<{ success: boolean }, void>({
    successMessage: 'Favourite deleted!',
    errorMessage: 'Failed to delete favourite.',
  });

  const loading = creating || updating || deleting;

  // Update form when favourite ETF changes
  useEffect(() => {
    if (isOpen) {
      if (favouriteEtf) {
        setMyNotes(favouriteEtf.myNotes || '');
        setMyScore(favouriteEtf.myScore?.toString() || '');
      } else {
        // Reset form for new favourite
        setMyNotes('');
        setMyScore('');
      }
    }
  }, [isOpen, favouriteEtf]);

  const handleSave = async (): Promise<void> => {
    const scoreValue: number | undefined = myScore ? parseFloat(myScore) : undefined;

    if (favouriteEtf) {
      // Update existing favourite
      const updateData: UpdateFavouriteEtfRequest = {
        myNotes: myNotes === '' ? null : myNotes,
        myScore: myScore === '' ? null : scoreValue,
      };

      const result = await updateFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs/${favouriteEtf.id}`, updateData);
      if (result) {
        onUpsert();
        onSuccess?.();
        onClose();
      }
    } else {
      // Create new favourite
      const createData: CreateFavouriteEtfRequest = {
        etfId,
        myNotes: myNotes || undefined,
        myScore: scoreValue,
      };

      const result = await createFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs`, createData);
      if (result) {
        onUpsert();
        onSuccess?.();
        onClose();
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!favouriteEtf) return;

    const result = await deleteData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs/${favouriteEtf.id}`);
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
      title={viewOnly ? `Favourite: ${etfName} (${etfSymbol})` : favouriteEtf ? 'Edit Favourite' : `Add ${etfName} (${etfSymbol}) to Favourites`}
      className="w-full max-w-2xl"
    >
      <div className="px-6 py-4 space-y-6 text-left">
        {/* My Notes */}
        <div className="space-y-2">
          {viewOnly ? (
            <div>
              <label className="text-sm font-medium block mb-2">My Notes:</label>
              {myNotes ? (
                <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(myNotes) }} />
              ) : (
                <p className="text-muted-3 text-sm">No notes added.</p>
              )}
            </div>
          ) : (
            <MarkdownEditor
              id={`etf-favourite-notes-${etfId}`}
              objectId={etfId}
              modelValue={myNotes}
              onUpdate={(value) => setMyNotes(value)}
              label="My Notes (Optional)"
              placeholder="Add your notes about this ETF..."
              maxHeight={200}
            />
          )}
        </div>

        {/* My Score */}
        <ScoreInput value={myScore} onChange={setMyScore} max={ETF_MAX_SCORE} disabled={viewOnly} />

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-5 mt-2 border-t border-border">
          {viewOnly ? (
            <div />
          ) : (
            <div>
              {favouriteEtf && (
                <Button
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={loading}
                  variant="outlined"
                  className="text-red-500 border-red-500 hover:text-red-500 hover:border-red-600"
                >
                  Delete Favourite
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
                <Button onClick={handleSave} disabled={loading} loading={loading} variant="contained" primary>
                  {favouriteEtf ? 'Update' : 'Add to'} Favourites
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
        title={`Delete ${etfSymbol} from favourites?`}
        deleteButtonText="Delete Favourite"
        confirmationText="DELETE"
      />
    </FullPageModal>
  );
}
