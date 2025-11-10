'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { useState, useEffect } from 'react';
import {
  FavouriteTickerResponse,
  UserListResponse,
  UserTickerTagResponse,
  CreateFavouriteTickerRequest,
  UpdateFavouriteTickerRequest,
} from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TagIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import ManageListsModal from '@/components/favourites/ManageListsModal';
import ManageTagsModal from '@/components/favourites/ManageTagsModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

type ModalView = 'main' | 'manage-lists' | 'manage-tags';

interface AddEditFavouriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
  existingFavourite?: FavouriteTickerResponse | null;
  onSuccess?: () => void;
}

export default function AddEditFavouriteModal({
  isOpen,
  onClose,
  tickerId,
  tickerSymbol,
  tickerName,
  existingFavourite,
  onSuccess,
}: AddEditFavouriteModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>('main');

  // Form state
  const [myNotes, setMyNotes] = useState('');
  const [myScore, setMyScore] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

  // Fetch tags and lists
  const {
    data: tagsData,
    loading: tagsLoading,
    reFetchData: refetchTags,
  } = useFetchData<{ tags: UserTickerTagResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-ticker-tags`,
    {},
    'Failed to fetch tags'
  );

  const {
    data: listsData,
    loading: listsLoading,
    reFetchData: refetchLists,
  } = useFetchData<{ lists: UserListResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-lists`,
    {},
    'Failed to fetch lists'
  );

  // Post and Put hooks for favourites
  const { postData: createFavourite, loading: creating } = usePostData<FavouriteTickerResponse, CreateFavouriteTickerRequest>({
    successMessage: 'Added to favourites!',
    errorMessage: 'Failed to add favourite.',
  });

  const { putData: updateFavourite, loading: updating } = usePutData<FavouriteTickerResponse, UpdateFavouriteTickerRequest>({
    successMessage: 'Favourite updated!',
    errorMessage: 'Failed to update favourite.',
  });

  const availableTags = tagsData?.tags || [];
  const availableLists = listsData?.lists || [];
  const loading = creating || updating;

  // Load existing data
  useEffect(() => {
    if (isOpen) {
      if (existingFavourite) {
        setMyNotes(existingFavourite.myNotes || '');
        setMyScore(existingFavourite.myScore?.toString() || '');
        setSelectedTagIds(existingFavourite.tags.map((t) => t.id));
        setSelectedListIds(existingFavourite.lists.map((l) => l.id));
      } else {
        // Reset form for new favourite
        setMyNotes('');
        setMyScore('');
        setSelectedTagIds([]);
        setSelectedListIds([]);
      }
      setCurrentView('main');
    }
  }, [isOpen, existingFavourite]);

  const handleSave = async () => {
    const scoreValue = myScore ? parseFloat(myScore) : undefined;

    if (existingFavourite) {
      // Update existing favourite
      const updateData: UpdateFavouriteTickerRequest = {
        myNotes: myNotes || undefined,
        myScore: scoreValue,
        tagIds: selectedTagIds,
        listIds: selectedListIds,
      };

      const result = await updateFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers?id=${existingFavourite.id}`, updateData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    } else {
      // Create new favourite
      console.log('tickerId', tickerId);
      const createData: CreateFavouriteTickerRequest = {
        tickerId,
        myNotes: myNotes || undefined,
        myScore: scoreValue,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        listIds: selectedListIds.length > 0 ? selectedListIds : undefined,
      };

      const result = await createFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`, createData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  const toggleList = (listId: string) => {
    setSelectedListIds((prev) => (prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]));
  };

  const handleTagsChange = () => {
    refetchTags();
  };

  const handleListsChange = () => {
    refetchLists();
  };

  const renderMainView = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {existingFavourite ? 'Edit' : 'Add'} {tickerName} ({tickerSymbol})
        </h3>
      </div>

      {/* My Notes */}
      <div className="space-y-2">
        <label htmlFor="my-notes" className="block text-sm font-medium">My Notes (Optional)</label>
        <textarea
          id="my-notes"
          value={myNotes}
          onChange={(e) => setMyNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add your notes about this stock..."
        />
      </div>

      {/* My Score */}
      <Input
        modelValue={myScore}
        onUpdate={(value) => setMyScore(value?.toString() || '')}
        number={true}
        min={0}
        max={25}
        placeholder="Enter a score between 0 and 25"
        className="bg-gray-800 border-gray-700 text-white"
      >
        My Score (Optional, 0-25)
      </Input>

      {/* Tags Selection */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Tags</label>
          <Button
            onClick={() => setCurrentView('manage-tags')}
            variant="text"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <TagIcon className="w-4 h-4" />
            Manage Tags
          </Button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableTags.length === 0 ? (
            <p className="text-gray-500 text-sm">No tags available. Create one to get started.</p>
          ) : (
            availableTags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                  className="w-4 h-4"
                />
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.colorHex }}
                />
                <span className="text-sm">{tag.name}</span>
                {tag.description && <span className="text-xs text-gray-500">- {tag.description}</span>}
              </label>
            ))
          )}
        </div>
      </div>

      {/* Lists Selection */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Lists</label>
          <Button
            onClick={() => setCurrentView('manage-lists')}
            variant="text"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <ListBulletIcon className="w-4 h-4" />
            Manage Lists
          </Button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableLists.length === 0 ? (
            <p className="text-gray-500 text-sm">No lists available. Create one to get started.</p>
          ) : (
            availableLists.map((list) => (
              <label key={list.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedListIds.includes(list.id)}
                  onChange={() => toggleList(list.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{list.name}</span>
                {list.description && <span className="text-xs text-gray-500">- {list.description}</span>}
              </label>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading} loading={loading} variant="contained" primary>
          {existingFavourite ? 'Update' : 'Add to'} Favourites
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <FullPageModal
        open={isOpen && currentView === 'main'}
        onClose={onClose}
        title={existingFavourite ? 'Edit Favourite' : 'Add to Favourites'}
        className="w-full max-w-2xl"
      >
        {renderMainView()}
      </FullPageModal>

      <ManageListsModal
        isOpen={currentView === 'manage-lists'}
        onClose={() => setCurrentView('main')}
        lists={availableLists}
        onListsChange={handleListsChange}
      />

      <ManageTagsModal
        isOpen={currentView === 'manage-tags'}
        onClose={() => setCurrentView('main')}
        tags={availableTags}
        onTagsChange={handleTagsChange}
      />
    </>
  );
}

