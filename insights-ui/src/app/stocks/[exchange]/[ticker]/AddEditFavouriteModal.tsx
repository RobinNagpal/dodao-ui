'use client';

import SearchBar, { SearchResult } from '@/components/core/SearchBar/SearchBar';
import TickerBadge from '@/components/favourites/TickerBadge';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  CreateFavouriteTickerRequest,
  FavouriteTickerResponse,
  TickerBasicsWithFinalScore,
  UpdateFavouriteTickerRequest,
  UserListResponse,
  UserTickerTagResponse,
} from '@/types/ticker-user';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ListBulletIcon, TagIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { parseMarkdown } from '@/util/parse-markdown';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';

interface AddEditFavouriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
  onSuccess?: () => void;
  lists: UserListResponse[];
  tags: UserTickerTagResponse[];
  onManageLists: () => void;
  onManageTags: () => void;
  favouriteTicker: FavouriteTickerResponse | null;
  onUpsert: () => void;
  viewOnly?: boolean;
}

export default function AddEditFavouriteModal({
  isOpen,
  onClose,
  tickerId,
  tickerSymbol,
  tickerName,
  onSuccess,
  lists,
  tags,
  onManageLists,
  onManageTags,
  favouriteTicker,
  onUpsert,
  viewOnly = false,
}: AddEditFavouriteModalProps) {
  // Form state
  const [myNotes, setMyNotes] = useState<string>('');
  const [myScore, setMyScore] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [competitorsConsidered, setCompetitorsConsidered] = useState<TickerBasicsWithFinalScore[]>([]);
  const [betterAlternatives, setBetterAlternatives] = useState<TickerBasicsWithFinalScore[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Post and Put hooks for favourites
  const { postData: createFavourite, loading: creating } = usePostData<FavouriteTickerResponse, CreateFavouriteTickerRequest>({
    successMessage: 'Added to favourites!',
    errorMessage: 'Failed to add favourite.',
  });

  const { putData: updateFavourite, loading: updating } = usePutData<FavouriteTickerResponse, UpdateFavouriteTickerRequest>({
    successMessage: 'Favourite updated!',
    errorMessage: 'Failed to update favourite.',
  });

  const { deleteData, loading: deleting } = useDeleteData<{ success: boolean }, void>({
    successMessage: 'Favourite deleted!',
    errorMessage: 'Failed to delete favourite.',
  });

  const loading = creating || updating || deleting;

  // Update form when favourite ticker changes
  useEffect(() => {
    if (isOpen) {
      if (favouriteTicker) {
        setMyNotes(favouriteTicker.myNotes || '');
        setMyScore(favouriteTicker.myScore?.toString() || '');
        setSelectedTagIds(favouriteTicker.tags?.map((t) => t.id) || []);
        setSelectedListIds(favouriteTicker.lists?.map((l) => l.id) || []);
        // Load existing competitors and alternatives
        setCompetitorsConsidered(
          favouriteTicker.competitorsConsidered?.map((c) => ({
            id: c.id,
            symbol: c.symbol,
            name: c.name,
            exchange: c.exchange,
            cachedScoreEntry: c.cachedScoreEntry,
          })) || []
        );
        setBetterAlternatives(
          favouriteTicker.betterAlternatives?.map((a) => ({
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
  }, [isOpen, favouriteTicker]);

  const handleSave = async (): Promise<void> => {
    const scoreValue: number | undefined = myScore ? parseFloat(myScore) : undefined;

    if (favouriteTicker) {
      // Update existing favourite
      const updateData: UpdateFavouriteTickerRequest = {
        myNotes: myNotes === '' ? null : myNotes || undefined,
        myScore: myScore === '' ? null : scoreValue,
        tagIds: selectedTagIds,
        listIds: selectedListIds,
        competitorsConsidered: competitorsConsidered.map((c) => c.id),
        betterAlternatives: betterAlternatives.map((b) => b.id),
      };

      const result = await updateFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers/${favouriteTicker.id}`, updateData);
      if (result) {
        onUpsert();
        onSuccess?.();
        onClose();
      }
    } else {
      // Create new favourite
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
        onUpsert();
        onSuccess?.();
        onClose();
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!favouriteTicker) return;

    const result = await deleteData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers/${favouriteTicker.id}`);
    if (result) {
      setShowDeleteConfirmation(false);
      onUpsert();
      onSuccess?.();
      onClose();
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

  const renderMainView = (): JSX.Element => (
    <div className="px-6 py-4 space-y-6 text-left">
      {/* My Notes */}
      <div className="space-y-2">
        {viewOnly ? (
          <div>
            <label className="text-sm font-medium block mb-2">My Notes:</label>
            {myNotes ? (
              <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(myNotes) }} />
            ) : (
              <p className="text-gray-500 text-sm">No notes added.</p>
            )}
          </div>
        ) : (
          <MarkdownEditor
            id="my-notes"
            objectId={tickerId}
            modelValue={myNotes}
            onUpdate={(value) => setMyNotes(value)}
            label="My Notes (Optional)"
            placeholder="Add your notes about this stock..."
            maxHeight={200}
          />
        )}
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
            disabled={viewOnly}
          />
        </div>
      </div>

      {/* Competitors Considered */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-left mb-3">Competitors Considered</label>
        <div className="space-y-3">
          {/* Search bar for adding competitors */}
          {!viewOnly && (
            <div className="relative">
              <SearchBar variant="navbar" placeholder="Search for competitor stocks..." onResultClick={handleAddCompetitor} className="w-full" />
            </div>
          )}

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
                    onRemove={viewOnly ? undefined : () => handleRemoveCompetitor(competitor.id)}
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
          {!viewOnly && (
            <div className="relative">
              <SearchBar variant="navbar" placeholder="Search for better alternative stocks..." onResultClick={handleAddBetterAlternative} className="w-full" />
            </div>
          )}

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
                    onRemove={viewOnly ? undefined : () => handleRemoveBetterAlternative(alternative.id)}
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
          {!viewOnly && (
            <Button onClick={onManageTags} variant="text" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <TagIcon className="w-4 h-4" />
              Manage Tags
            </Button>
          )}
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto bg-gray-900 rounded-md p-1">
          {viewOnly && selectedTagIds.length === 0 ? (
            <p className="text-gray-500 text-sm p-2">No tags selected.</p>
          ) : tags.length === 0 && !viewOnly ? (
            <p className="text-gray-500 text-sm p-2">No tags available. Create one to get started.</p>
          ) : (
            <div className="ml-2">
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
                onChange={viewOnly ? () => {} : (ids: string[]) => setSelectedTagIds(ids)}
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
          {!viewOnly && (
            <Button onClick={onManageLists} variant="text" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <ListBulletIcon className="w-4 h-4" />
              Manage Lists
            </Button>
          )}
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto bg-gray-900 rounded-md p-1">
          {viewOnly && selectedListIds.length === 0 ? (
            <p className="text-gray-500 text-sm p-2">No lists selected.</p>
          ) : lists.length === 0 && !viewOnly ? (
            <p className="text-gray-500 text-sm p-2">No lists available. Create one to get started.</p>
          ) : (
            <div className="ml-2">
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
                onChange={viewOnly ? () => {} : (ids: string[]) => setSelectedListIds(ids)}
                className="bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-between gap-3 pt-5 mt-2 border-t border-gray-700">
        {viewOnly ? (
          <div />
        ) : (
          <div>
            {favouriteTicker && (
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
                {favouriteTicker ? 'Update' : 'Add to'} Favourites
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <FullPageModal
      open={isOpen}
      onClose={onClose}
      title={viewOnly ? `Favourite: ${tickerName} (${tickerSymbol})` : favouriteTicker ? 'Edit Favourite' : `Add ${tickerName} (${tickerSymbol}) to Favourites`}
      className="w-full max-w-2xl"
    >
      {renderMainView()}

      <DeleteConfirmationModal
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onDelete={handleDelete}
        deleting={deleting}
        title={`Delete ${tickerSymbol} from favourites?`}
        deleteButtonText="Delete Favourite"
        confirmationText="DELETE"
      />
    </FullPageModal>
  );
}
