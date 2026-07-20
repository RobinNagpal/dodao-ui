'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { UserListResponse } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useState } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface BulkAddListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: UserListResponse[];
  selectedFavouriteIds: Set<string>;
  onSuccess: () => void;
}

export default function BulkAddListsModal({ isOpen, onClose, lists, selectedFavouriteIds, onSuccess }: BulkAddListsModalProps) {
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'add' | 'replace'>('add');

  const { putData: updateFavouriteLists, loading: updating } = usePutData<any, { favouriteIds: string[]; listIds: string[]; mode: 'add' | 'replace' }>({
    successMessage: 'Lists updated successfully!',
    errorMessage: 'Failed to update lists.',
  });

  const handleSave = async (): Promise<void> => {
    if (selectedListIds.length === 0) {
      return;
    }

    const favouriteIds = Array.from(selectedFavouriteIds);
    const result = await updateFavouriteLists(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`, {
      favouriteIds,
      listIds: selectedListIds,
      mode,
    });

    if (result) {
      onSuccess();
      handleClose();
    }
  };

  const handleClose = (): void => {
    setSelectedListIds([]);
    setMode('add');
    onClose();
  };

  return (
    <FullPageModal open={isOpen} onClose={handleClose} title="Add to Lists" className="w-full max-w-2xl">
      <div className="p-4 space-y-4 text-left">
        <div className="bg-surface p-3 rounded-lg">
          <p className="text-sm text-muted mb-3">
            You are about to update lists for <span className="font-semibold text-heading">{selectedFavouriteIds.size}</span> selected{' '}
            {selectedFavouriteIds.size === 1 ? 'favourite' : 'favourites'}.
          </p>

          <div className="mb-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Update Mode</label>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center">
                <input type="radio" name="mode" value="add" checked={mode === 'add'} onChange={() => setMode('add')} className="mr-2" />
                <span>Add to existing lists</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="mode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} className="mr-2" />
                <span>Replace existing lists</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Select Lists</label>
            <div className="space-y-0.5 max-h-52 overflow-y-auto bg-bg rounded-md p-1.5">
              {lists.length === 0 ? (
                <p className="text-muted text-sm px-2 py-1.5">No lists available. Create lists first.</p>
              ) : (
                <Checkboxes
                  items={lists.map(
                    (list): CheckboxItem => ({
                      id: list.id,
                      name: list.name,
                      label: (
                        <span className="text-sm">
                          {list.name}
                          {list.description ? ` - ${list.description}` : ''}
                        </span>
                      ),
                    })
                  )}
                  selectedItemIds={selectedListIds}
                  onChange={(ids: string[]) => setSelectedListIds(ids)}
                  className="bg-transparent"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button onClick={handleClose} disabled={updating} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updating || selectedListIds.length === 0} loading={updating} variant="contained" primary>
            {mode === 'add' ? 'Add to' : 'Replace'} Lists
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
