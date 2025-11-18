'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { UserTickerTagResponse } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useState } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface BulkAddTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: UserTickerTagResponse[];
  selectedFavouriteIds: Set<string>;
  onSuccess: () => void;
}

export default function BulkAddTagsModal({ isOpen, onClose, tags, selectedFavouriteIds, onSuccess }: BulkAddTagsModalProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'add' | 'replace'>('add');

  const { putData: updateFavouriteTags, loading: updating } = usePutData<any, { favouriteIds: string[]; tagIds: string[]; mode: 'add' | 'replace' }>({
    successMessage: 'Tags updated successfully!',
    errorMessage: 'Failed to update tags.',
  });

  const handleSave = async (): Promise<void> => {
    if (selectedTagIds.length === 0) {
      return;
    }

    const favouriteIds = Array.from(selectedFavouriteIds);
    const result = await updateFavouriteTags(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers?action=bulk-update-tags`, {
      favouriteIds,
      tagIds: selectedTagIds,
      mode,
    });

    if (result) {
      onSuccess();
      handleClose();
    }
  };

  const handleClose = (): void => {
    setSelectedTagIds([]);
    setMode('add');
    onClose();
  };

  return (
    <FullPageModal open={isOpen} onClose={handleClose} title="Add Tags to Selected Favourites" className="w-full max-w-2xl">
      <div className="p-6 space-y-6 text-left">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-white mb-4">
            You are about to update tags for <span className="font-bold">{selectedFavouriteIds.size}</span> selected{' '}
            {selectedFavouriteIds.size === 1 ? 'favourite' : 'favourites'}.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Update Mode</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" name="mode" value="add" checked={mode === 'add'} onChange={() => setMode('add')} className="mr-2" />
                <span>Add to existing tags</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="mode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} className="mr-2" />
                <span>Replace existing tags</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Tags</label>
            <div className="space-y-1 max-h-60 overflow-y-auto bg-gray-900 rounded-md p-2">
              {tags.length === 0 ? (
                <p className="text-gray-500 text-sm p-2">No tags available. Create tags first.</p>
              ) : (
                <Checkboxes
                  items={tags.map(
                    (tag): CheckboxItem => ({
                      id: tag.id,
                      name: tag.name,
                      label: (
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.colorHex }} />
                          <span className="text-sm">
                            {tag.name}
                            {tag.description ? ` - ${tag.description}` : ''}
                          </span>
                        </div>
                      ),
                    })
                  )}
                  selectedItemIds={selectedTagIds}
                  onChange={(ids: string[]) => setSelectedTagIds(ids)}
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
          <Button onClick={handleSave} disabled={updating || selectedTagIds.length === 0} loading={updating} variant="contained" primary>
            {mode === 'add' ? 'Add' : 'Replace'} Tags
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
