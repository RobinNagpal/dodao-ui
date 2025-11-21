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
  TickerBasicsWithFinalScore,
} from '@/types/ticker-user';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TagIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import ManageListsModal from '@/components/favourites/ManageListsModal';
import ManageTagsModal from '@/components/favourites/ManageTagsModal';
import SearchBar, { SearchResult } from '@/components/core/SearchBar/SearchBar';
import TickerBadge from '@/components/favourites/TickerBadge';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

type ModalView = 'main' | 'manage-lists' | 'manage-tags';

interface AddEditFavouriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
  onSuccess?: () => void;
}

export default function AddEditFavouriteModal({ isOpen, onClose, tickerId, tickerSymbol, tickerName, onSuccess }: AddEditFavouriteModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>('main');
  const [existingFavourite, setExistingFavourite] = useState<FavouriteTickerResponse | null>(null);

  // Form state
  const [myNotes, setMyNotes] = useState<string>('');
  const [myScore, setMyScore] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [competitorsConsidered, setCompetitorsConsidered] = useState<TickerBasicsWithFinalScore[]>([]);
  const [betterAlternatives, setBetterAlternatives] = useState<TickerBasicsWithFinalScore[]>([]);

  // Fetch tags and lists
  const {
    data: tagsData,
    loading: tagsLoading,
    reFetchData: refetchTags,
  } = useFetchData<{ tags: UserTickerTagResponse[] }>(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-ticker-tags`, {}, 'Failed to fetch tags');

  const {
    data: listsData,
    loading: listsLoading,
    reFetchData: refetchLists,
  } = useFetchData<{ lists: UserListResponse[] }>(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-lists`, {}, 'Failed to fetch lists');

  // Fetch existing favourite for this ticker
  const { data: favouritesData, reFetchData: refetchFavourites } = useFetchData<{ favouriteTickers: FavouriteTickerResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`,
    { skipInitialFetch: !isOpen },
    'Failed to fetch favourites'
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

  // Check if current ticker exists in favourites
  useEffect(() => {
    if (favouritesData?.favouriteTickers) {
      const existing = favouritesData.favouriteTickers.find((f) => f.tickerId === tickerId);
      setExistingFavourite(existing || null);
    }
  }, [favouritesData, tickerId]);

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Fetch favourites data when modal opens
      refetchFavourites();
      setCurrentView('main');
    }
  }, [isOpen, refetchFavourites]);

  // Update form when existing favourite changes
  useEffect(() => {
    if (isOpen) {
      if (existingFavourite) {
        setMyNotes(existingFavourite.myNotes || '');
        setMyScore(existingFavourite.myScore?.toString() || '');
        setSelectedTagIds(existingFavourite.tags.map((t) => t.id));
        setSelectedListIds(existingFavourite.lists.map((l) => l.id));
        // Load existing competitors and alternatives
        setCompetitorsConsidered(
          existingFavourite.competitorsConsidered?.map((c) => ({
            id: c.id,
            symbol: c.symbol,
            name: c.name,
            exchange: c.exchange,
            cachedScoreEntry: c.cachedScoreEntry,
          })) || []
        );
        setBetterAlternatives(
          existingFavourite.betterAlternatives?.map((a) => ({
            id: a.id,
            symbol: a.symbol,
            name: a.name,
            exchange: a.exchange,
            cachedScoreEntry: a.cachedScoreEntry,
          })) || []
        );
      } else {
        // Reset form for new favourite
        setMyNotes('');
        setMyScore('');
        setSelectedTagIds([]);
        setSelectedListIds([]);
        setCompetitorsConsidered([]);
        setBetterAlternatives([]);
      }
    }
  }, [isOpen, existingFavourite]);

  const handleSave = async (): Promise<void> => {
    const scoreValue: number | undefined = myScore ? parseFloat(myScore) : undefined;

    if (existingFavourite) {
      // Update existing favourite
      const updateData: UpdateFavouriteTickerRequest = {
        myNotes: myNotes === '' ? null : myNotes || undefined,
        myScore: myScore === '' ? null : scoreValue,
        tagIds: selectedTagIds,
        listIds: selectedListIds,
        competitorsConsidered: competitorsConsidered.map((c) => c.id),
        betterAlternatives: betterAlternatives.map((b) => b.id),
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
        competitorsConsidered: competitorsConsidered.length > 0 ? competitorsConsidered.map((c) => c.id) : undefined,
        betterAlternatives: betterAlternatives.length > 0 ? betterAlternatives.map((b) => b.id) : undefined,
      };

      const result = await createFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`, createData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    }
  };

  const handleAddCompetitor = (result: SearchResult): void => {
    if (!competitorsConsidered.some((c) => c.id === result.id) && result.id !== tickerId) {
      const competitor: TickerBasicsWithFinalScore = {
        id: result.id,
        symbol: result.symbol,
        name: result.name,
        exchange: result.exchange,
        cachedScoreEntry: result.cachedScoreEntry,
      };
      setCompetitorsConsidered((prev) => [...prev, competitor]);
    }
  };

  const handleRemoveCompetitor = (tickerId: string): void => {
    setCompetitorsConsidered((prev) => prev.filter((c) => c.id !== tickerId));
  };

  const handleAddBetterAlternative = (result: SearchResult): void => {
    if (!betterAlternatives.some((b) => b.id === result.id) && result.id !== tickerId) {
      const alternative: TickerBasicsWithFinalScore = {
        id: result.id,
        symbol: result.symbol,
        name: result.name,
        exchange: result.exchange,
        cachedScoreEntry: result.cachedScoreEntry,
      };
      setBetterAlternatives((prev) => [...prev, alternative]);
    }
  };

  const handleRemoveBetterAlternative = (tickerId: string): void => {
    setBetterAlternatives((prev) => prev.filter((b) => b.id !== tickerId));
  };

  const handleTagsChange = (): void => {
    refetchTags();
  };

  const handleListsChange = (): void => {
    refetchLists();
  };

  const renderMainView = (): JSX.Element => (
    <div className="px-6 py-4 space-y-6 text-left">
      {/* My Notes */}
      <div className="space-y-2">
        <label htmlFor="my-notes" className="block text-sm font-medium text-left">
          My Notes (Optional)
        </label>
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
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium whitespace-nowrap">My Score (0-25):</label>
        <div className="flex-1 max-w-xs">
          <Input
            modelValue={myScore}
            onUpdate={(value) => setMyScore(value?.toString() || '')}
            number={true}
            min={0}
            max={25}
            placeholder="0-25"
            className="bg-gray-800 border-gray-700 text-white w-full"
          />
        </div>
      </div>

      {/* Competitors Considered */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-left mb-3">Competitors Considered</label>
        <div className="space-y-3">
          {/* Search bar for adding competitors */}
          <div className="relative">
            <SearchBar variant="navbar" placeholder="Search for competitor stocks..." onResultClick={handleAddCompetitor} className="w-full" />
          </div>

          {/* Selected competitors */}
          {competitorsConsidered.length > 0 && (
            <div className="bg-gray-900 rounded-md p-3">
              <div className="text-sm text-gray-400 mb-2">Selected competitors:</div>
              <div className="flex flex-wrap gap-2">
                {competitorsConsidered.map((competitor) => (
                  <TickerBadge
                    key={competitor.id}
                    ticker={competitor}
                    showScore={true}
                    showName={true}
                    onRemove={() => handleRemoveCompetitor(competitor.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Better Alternatives */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-left mb-3">Better Alternatives</label>
        <div className="space-y-3">
          {/* Search bar for adding alternatives */}
          <div className="relative">
            <SearchBar variant="navbar" placeholder="Search for better alternative stocks..." onResultClick={handleAddBetterAlternative} className="w-full" />
          </div>

          {/* Selected alternatives */}
          {betterAlternatives.length > 0 && (
            <div className="bg-gray-900 rounded-md p-3">
              <div className="text-sm text-gray-400 mb-2">Selected alternatives:</div>
              <div className="flex flex-wrap gap-2">
                {betterAlternatives.map((alternative) => (
                  <TickerBadge
                    key={alternative.id}
                    ticker={alternative}
                    showScore={true}
                    showName={true}
                    onRemove={() => handleRemoveBetterAlternative(alternative.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags Selection */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-left">Tags</label>
          <Button onClick={() => setCurrentView('manage-tags')} variant="text" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <TagIcon className="w-4 h-4" />
            Manage Tags
          </Button>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto bg-gray-900 rounded-md p-1">
          {availableTags.length === 0 ? (
            <p className="text-gray-500 text-sm p-2">No tags available. Create one to get started.</p>
          ) : (
            <div className="ml-2">
              <Checkboxes
                items={availableTags.map(
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
            </div>
          )}
        </div>
      </div>

      {/* Lists Selection */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-left">Lists</label>
          <Button onClick={() => setCurrentView('manage-lists')} variant="text" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <ListBulletIcon className="w-4 h-4" />
            Manage Lists
          </Button>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto bg-gray-900 rounded-md p-1">
          {availableLists.length === 0 ? (
            <p className="text-gray-500 text-sm p-2">No lists available. Create one to get started.</p>
          ) : (
            <div className="ml-2">
              <Checkboxes
                items={availableLists.map(
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
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-700">
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
        title={existingFavourite ? 'Edit Favourite' : `Add ${tickerName} (${tickerSymbol}) to Favourites`}
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

      <ManageTagsModal isOpen={currentView === 'manage-tags'} onClose={() => setCurrentView('main')} tags={availableTags} onTagsChange={handleTagsChange} />
    </>
  );
}
