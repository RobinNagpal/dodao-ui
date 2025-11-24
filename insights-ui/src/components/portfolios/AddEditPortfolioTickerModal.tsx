'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { useState, useEffect } from 'react';
import { PortfolioTicker, CreatePortfolioTickerRequest, UpdatePortfolioTickerRequest } from '@/types/portfolio';
import { TickerBasicsWithFinalScore, UserTickerTagResponse, UserListResponse } from '@/types/ticker-user';
import { TickerV1 } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TagIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import ManageListsModal from '@/components/favourites/ManageListsModal';
import ManageTagsModal from '@/components/favourites/ManageTagsModal';
import SearchBar, { SearchResult } from '@/components/core/SearchBar/SearchBar';
import TickerBadge from '@/components/favourites/TickerBadge';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

type ModalView = 'main' | 'manage-lists' | 'manage-tags';

interface AddEditPortfolioTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  portfolioTicker?: PortfolioTicker | null;
  onSuccess?: () => void;
  portfolioManagerId?: string; // Optional, for using new API routes
}

export default function AddEditPortfolioTickerModal({ isOpen, onClose, portfolioId, portfolioTicker, onSuccess, portfolioManagerId }: AddEditPortfolioTickerModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>('main');

  // Form state
  const [selectedTicker, setSelectedTicker] = useState<TickerBasicsWithFinalScore | null>(null);
  const [allocation, setAllocation] = useState<string>('');
  const [detailedDescription, setDetailedDescription] = useState<string>('');
  const [competitorsConsidered, setCompetitorsConsidered] = useState<TickerBasicsWithFinalScore[]>([]);
  const [betterAlternatives, setBetterAlternatives] = useState<TickerBasicsWithFinalScore[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

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

  // Post and Put hooks for portfolio tickers
  const { postData: createPortfolioTicker, loading: creating } = usePostData<PortfolioTicker, CreatePortfolioTickerRequest>({
    successMessage: 'Ticker added to portfolio successfully!',
    errorMessage: 'Failed to add ticker to portfolio.',
  });

  const { putData: updatePortfolioTicker, loading: updating } = usePutData<PortfolioTicker, UpdatePortfolioTickerRequest>({
    successMessage: 'Portfolio ticker updated successfully!',
    errorMessage: 'Failed to update portfolio ticker.',
  });

  const availableTags = tagsData?.tags || [];
  const availableLists = listsData?.lists || [];
  const loading = creating || updating;

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView('main');

      if (portfolioTicker) {
        // Load existing portfolio ticker data
        setSelectedTicker(
          portfolioTicker.ticker
            ? {
                id: portfolioTicker.ticker.id,
                symbol: portfolioTicker.ticker.symbol || '',
                name: portfolioTicker.ticker.name || '',
                exchange: portfolioTicker.ticker.exchange || '',
                cachedScoreEntry: null, // We'll need to fetch this separately if needed
              }
            : null
        );
        setAllocation(portfolioTicker.allocation.toString());
        setDetailedDescription(portfolioTicker.detailedDescription || '');
        setSelectedTagIds(portfolioTicker.tags?.map((t) => t.id) || []);
        setSelectedListIds(portfolioTicker.lists?.map((l) => l.id) || []);

        // Load competitors and alternatives (already populated as full ticker objects by the API)
        setCompetitorsConsidered(
          portfolioTicker.competitorsConsidered?.map((c) => {
            const tickerWithScore = c as TickerV1 & { cachedScoreEntry?: { finalScore: number } | null };
            return {
              id: tickerWithScore.id,
              symbol: tickerWithScore.symbol,
              name: tickerWithScore.name,
              exchange: tickerWithScore.exchange,
              cachedScoreEntry: tickerWithScore.cachedScoreEntry,
            } as TickerBasicsWithFinalScore;
          }) || []
        );
        setBetterAlternatives(
          portfolioTicker.betterAlternatives?.map((a) => {
            const tickerWithScore = a as TickerV1 & { cachedScoreEntry?: { finalScore: number } | null };
            return {
              id: tickerWithScore.id,
              symbol: tickerWithScore.symbol,
              name: tickerWithScore.name,
              exchange: tickerWithScore.exchange,
              cachedScoreEntry: tickerWithScore.cachedScoreEntry,
            } as TickerBasicsWithFinalScore;
          }) || []
        );
      } else {
        // Reset form for new ticker
        setSelectedTicker(null);
        setAllocation('');
        setDetailedDescription('');
        setCompetitorsConsidered([]);
        setBetterAlternatives([]);
        setSelectedTagIds([]);
        setSelectedListIds([]);
      }
    }
  }, [isOpen, portfolioTicker]);

  const handleSave = async (): Promise<void> => {
    if (!selectedTicker) {
      alert('Please select a ticker');
      return;
    }

    const allocationValue = parseFloat(allocation);
    if (isNaN(allocationValue) || allocationValue <= 0 || allocationValue > 100) {
      alert('Please enter a valid allocation percentage (1-100)');
      return;
    }

    if (portfolioTicker) {
      // Update existing portfolio ticker
      const updateData: UpdatePortfolioTickerRequest = {
        allocation: allocationValue,
        detailedDescription: detailedDescription || undefined,
        competitors: competitorsConsidered.map((c) => c.id),
        alternatives: betterAlternatives.map((b) => b.id),
        tagIds: selectedTagIds,
        listIds: selectedListIds,
      };

      // Use new API route if portfolioManagerId is provided
      const apiUrl = portfolioManagerId
        ? `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolioId}/tickers?id=${portfolioTicker.id}`
        : `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolios/${portfolioId}/tickers?id=${portfolioTicker.id}`;

      const result = await updatePortfolioTicker(apiUrl, updateData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    } else {
      // Create new portfolio ticker
      const createData: CreatePortfolioTickerRequest = {
        tickerId: selectedTicker.id,
        allocation: allocationValue,
        detailedDescription: detailedDescription || undefined,
        competitors: competitorsConsidered.map((c) => c.id),
        alternatives: betterAlternatives.map((b) => b.id),
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        listIds: selectedListIds.length > 0 ? selectedListIds : undefined,
      };

      // Use new API route if portfolioManagerId is provided
      const apiUrl = portfolioManagerId
        ? `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolioId}/tickers`
        : `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolios/${portfolioId}/tickers`;

      const result = await createPortfolioTicker(apiUrl, createData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    }
  };

  const handleTickerSelect = (result: SearchResult): void => {
    const ticker: TickerBasicsWithFinalScore = {
      id: result.id,
      symbol: result.symbol,
      name: result.name,
      exchange: result.exchange,
      cachedScoreEntry: result.cachedScoreEntry,
    };
    setSelectedTicker(ticker);
  };

  const handleAddCompetitor = (result: SearchResult): void => {
    if (!competitorsConsidered.some((c) => c.id === result.id) && result.id !== selectedTicker?.id) {
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
    if (!betterAlternatives.some((b) => b.id === result.id) && result.id !== selectedTicker?.id) {
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
      {/* Ticker Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-left">Select Ticker *</label>
        {!selectedTicker ? (
          <div className="relative">
            <SearchBar variant="navbar" placeholder="Search for a ticker to add..." onResultClick={handleTickerSelect} className="w-full" />
          </div>
        ) : (
          <div className="bg-gray-900 rounded-md p-3">
            <div className="flex items-center justify-between">
              <TickerBadge ticker={selectedTicker} showScore={true} showName={true} onRemove={() => setSelectedTicker(null)} />
            </div>
          </div>
        )}
      </div>

      {/* Allocation */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium whitespace-nowrap">Allocation (%):</label>
        <div className="flex-1 max-w-xs">
          <Input
            modelValue={allocation}
            onUpdate={(value) => setAllocation(value?.toString() || '')}
            number={true}
            min={0}
            max={100}
            placeholder="0-100"
            className="bg-gray-800 border-gray-700 text-white w-full"
          />
        </div>
      </div>

      {/* Detailed Description */}
      <div className="space-y-2">
        <label htmlFor="ticker-description" className="block text-sm font-medium text-left">
          Detailed Description (Optional)
        </label>
        <textarea
          id="ticker-description"
          value={detailedDescription}
          onChange={(e) => setDetailedDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add notes about this holding..."
        />
      </div>

      {/* Competitors Considered */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-left">Competitors Considered</label>
        <div className="relative">
          <SearchBar variant="navbar" placeholder="Search for competitor stocks..." onResultClick={handleAddCompetitor} className="w-full" />
        </div>

        {competitorsConsidered.length > 0 && (
          <div className="bg-gray-900 rounded-md p-3">
            <div className="text-sm text-gray-400 mb-2">Selected competitors:</div>
            <div className="flex flex-wrap gap-2">
              {competitorsConsidered.map((competitor) => (
                <TickerBadge key={competitor.id} ticker={competitor} showScore={true} showName={true} onRemove={() => handleRemoveCompetitor(competitor.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Better Alternatives */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-left">Better Alternatives</label>
        <div className="relative">
          <SearchBar variant="navbar" placeholder="Search for better alternative stocks..." onResultClick={handleAddBetterAlternative} className="w-full" />
        </div>

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

      {/* Tags Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
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
                  (tag: UserTickerTagResponse): CheckboxItem => ({
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
      <div className="space-y-3">
        <div className="flex justify-between items-center">
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
                  (list: UserListResponse): CheckboxItem => ({
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
        <Button onClick={handleSave} disabled={loading || !selectedTicker || !allocation} loading={loading} variant="contained" primary>
          {portfolioTicker ? 'Update Holding' : 'Add to Portfolio'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <FullPageModal
        open={isOpen && currentView === 'main'}
        onClose={onClose}
        title={portfolioTicker ? 'Edit Portfolio Holding' : 'Add Holding to Portfolio'}
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
