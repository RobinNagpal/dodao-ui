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
    const result = await updateFavouriteLists(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers/bulk-update-lists`, {
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
      <div className="p-6 space-y-6 text-left">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-white mb-4">
            You are about to update lists for <span className="font-bold">{selectedFavouriteIds.size}</span> selected{' '}
            {selectedFavouriteIds.size === 1 ? 'favourite' : 'favourites'}.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Update Mode</label>
            <div className="flex gap-4">
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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Lists</label>
            <div className="space-y-1 max-h-60 overflow-y-auto bg-gray-900 rounded-md p-2">
              {lists.length === 0 ? (
                <p className="text-gray-500 text-sm p-2">No lists available. Create lists first.</p>
              ) : (
                <Checkboxes
                  items={lists.map(
                    (list): CheckboxItem => ({
                      id: list.id,
                      name: list.name,
                      label: (
                        <div className="flex flex-col">
                          <span className="text-sm">{list.name}</span>
                          {list.description && <span className="text-xs text-gray-400 mt-0.5">{list.description}</span>}
                        </div>
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

        <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-700">
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
