'use client';

import AddEditFavouriteModal from '@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import { FavouriteTickerResponse, UserListResponse, UserTickerTagResponse } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsSession } from '@/types/auth';
import React, { useState, useEffect, useMemo } from 'react';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import ManageListsModal from '@/components/favourites/ManageListsModal';
import ManageTagsModal from '@/components/favourites/ManageTagsModal';
import BulkAddTagsModal from '@/components/favourites/BulkAddTagsModal';
import BulkAddListsModal from '@/components/favourites/BulkAddListsModal';
import FavouritesPageHeader from '@/components/favourites/FavouritesPageHeader';
import FavouritesToolbar from '@/components/favourites/FavouritesToolbar';
import FavouritesEmptyState from '@/components/favourites/FavouritesEmptyState';
import FavouritesAccordionSection from '@/components/favourites/FavouritesAccordionSection';
import BulkActionBar from '@/components/favourites/BulkActionBar';
import FavouritesLoadingSkeleton from '@/components/favourites/FavouritesLoadingSkeleton';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

type ModalView = 'manage-lists' | 'manage-tags' | 'bulk-add-tags' | 'bulk-add-lists';

interface ListWithFavourites {
  list: UserListResponse;
  favourites: FavouriteTickerResponse[];
}

export default function FavouritesPage() {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const router = useRouter();

  const [editingFavourite, setEditingFavourite] = useState<FavouriteTickerResponse | null>(null);
  const [deletingFavourite, setDeletingFavourite] = useState<FavouriteTickerResponse | null>(null);
  const [manageModalView, setManageModalView] = useState<ModalView | null>(null);
  const [openListIds, setOpenListIds] = useState<Set<string>>(new Set());
  const [showBusinessAnalysis, setShowBusinessAnalysis] = useState(false);

  // Multi-select state
  const [selectedFavourites, setSelectedFavourites] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState<boolean>(false);

  // Load user preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user_setting');
        if (stored) {
          const settings = JSON.parse(stored);
          if (settings?.favourite_setting?.show_business_analysis !== undefined) {
            setShowBusinessAnalysis(settings.favourite_setting.show_business_analysis);
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    }
  }, []);

  // Save user preference to localStorage
  const handleToggleBusinessAnalysis = (enabled: boolean) => {
    setShowBusinessAnalysis(enabled);
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user_setting');
        const settings = stored ? JSON.parse(stored) : {};
        settings.favourite_setting = {
          ...settings.favourite_setting,
          show_business_analysis: enabled,
        };
        localStorage.setItem('user_setting', JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving user settings:', error);
      }
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (koalaSession === null) {
      router.push('/login');
    }
  }, [koalaSession, router]);

  // Fetch data with custom hooks
  const {
    data: favouritesData,
    loading: favouritesLoading,
    reFetchData: refetchFavourites,
  } = useFetchData<{ favouriteTickers: FavouriteTickerResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`,
    { skipInitialFetch: !session },
    'Failed to fetch favourites',
  );

  const { data: listsData, reFetchData: refetchLists } = useFetchData<{ lists: UserListResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-lists`,
    { skipInitialFetch: !session },
    'Failed to fetch lists',
  );

  const { data: tagsData, reFetchData: refetchTags } = useFetchData<{ tags: UserTickerTagResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-ticker-tags`,
    { skipInitialFetch: !session },
    'Failed to fetch tags',
  );

  const { deleteData: deleteFavourite, loading: isDeleting } = useDeleteData({
    successMessage: 'Favourite deleted successfully!',
    errorMessage: 'Failed to delete favourite.',
  });

  const favourites = favouritesData?.favouriteTickers || [];
  const lists = listsData?.lists || [];
  const tags = tagsData?.tags || [];

  // Group favourites by list
  const { listsWithFavourites, unlistedFavourites } = useMemo(() => {
    const favouriteItems = favouritesData?.favouriteTickers || [];
    const listItems = listsData?.lists || [];

    // Sort lists alphabetically
    const sortedLists = [...listItems].sort((a, b) => a.name.localeCompare(b.name));

    // Group favourites by list
    const listsMap = new Map<string, ListWithFavourites>();
    sortedLists.forEach((list) => {
      listsMap.set(list.id, { list, favourites: [] });
    });

    const unlisted: FavouriteTickerResponse[] = [];

    favouriteItems.forEach((fav) => {
      if (fav.lists.length === 0) {
        unlisted.push(fav);
      } else {
        fav.lists.forEach((list) => {
          const listData = listsMap.get(list.id);
          if (listData) {
            listData.favourites.push(fav);
          }
        });
      }
    });

    // Sort favourites within each list by myScore descending
    listsMap.forEach((listData) => {
      listData.favourites.sort((a, b) => {
        const scoreA = a.myScore ?? -Infinity;
        const scoreB = b.myScore ?? -Infinity;
        return scoreB - scoreA;
      });
    });

    // Sort unlisted favourites by myScore descending
    unlisted.sort((a, b) => {
      const scoreA = a.myScore ?? -Infinity;
      const scoreB = b.myScore ?? -Infinity;
      return scoreB - scoreA;
    });

    return {
      listsWithFavourites: Array.from(listsMap.values()).filter((l) => l.favourites.length > 0),
      unlistedFavourites: unlisted,
    };
  }, [favouritesData, listsData]);

  const toggleList = (listId: string) => {
    setOpenListIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  // Prevent double-click due to event bubbling in Accordion
  const handleAccordionClick = (e: React.MouseEvent<HTMLElement>, listId: string) => {
    e.stopPropagation();
    toggleList(listId);
  };

  // Show a skeleton that mirrors the page layout while data loads
  if (favouritesLoading) {
    return (
      <PageWrapper>
        <FavouritesLoadingSkeleton />
      </PageWrapper>
    );
  }

  const handleDelete = async () => {
    if (!deletingFavourite) return;

    const result = await deleteFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers/${deletingFavourite.id}`);
    if (result) {
      await refetchFavourites();
      setDeletingFavourite(null);
    }
  };

  const handleListsChange = async () => {
    await refetchLists();
    await refetchFavourites(); // Refresh favourites in case they had relations to lists
  };

  const handleTagsChange = async () => {
    await refetchTags();
    await refetchFavourites(); // Refresh favourites in case they had relations to tags
  };

  // Handle selection of a favourite
  const handleFavouriteSelection = (favourite: FavouriteTickerResponse, selected: boolean): void => {
    setSelectedFavourites((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(favourite.id);
      } else {
        newSet.delete(favourite.id);
      }
      return newSet;
    });
  };

  // Toggle bulk action mode
  const toggleBulkActionMode = (): void => {
    const newMode = !bulkActionMode;
    setBulkActionMode(newMode);

    // Clear selections when exiting bulk action mode
    if (!newMode) {
      setSelectedFavourites(new Set());
    }
  };

  // Select all favourites in the current view
  const selectAllFavourites = (): void => {
    const allIds = new Set<string>();
    favourites.forEach((fav) => allIds.add(fav.id));
    setSelectedFavourites(allIds);
  };

  // Deselect all favourites
  const deselectAllFavourites = (): void => {
    setSelectedFavourites(new Set());
  };

  // Show loading or redirect if no session
  if (!session) {
    return null; // Will redirect in useEffect
  }

  const listCount = listsWithFavourites.length + (unlistedFavourites.length > 0 ? 1 : 0);

  const handleEditFavourite = (e: React.MouseEvent, fav: FavouriteTickerResponse) => {
    e.stopPropagation();
    setEditingFavourite(fav);
  };

  const handleDeleteFavourite = (e: React.MouseEvent, fav: FavouriteTickerResponse) => {
    e.stopPropagation();
    setDeletingFavourite(fav);
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-1 sm:px-2">
        <div className="py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <FavouritesPageHeader favouritesCount={favourites.length} listsCount={listCount} />

            <FavouritesToolbar
              showBusinessAnalysis={showBusinessAnalysis}
              onToggleBusinessAnalysis={handleToggleBusinessAnalysis}
              bulkActionMode={bulkActionMode}
              onToggleBulkActionMode={toggleBulkActionMode}
              onSelectAll={selectAllFavourites}
              onDeselectAll={deselectAllFavourites}
              selectedCount={selectedFavourites.size}
              onManageLists={() => setManageModalView('manage-lists')}
              onManageTags={() => setManageModalView('manage-tags')}
            />
          </div>

          {/* Lists with Favourites */}
          {favourites.length === 0 ? (
            <FavouritesEmptyState />
          ) : (
            <div className="space-y-4 pb-24">
              {/* Lists with favourites */}
              {listsWithFavourites.map(({ list, favourites: listFavourites }) => (
                <FavouritesAccordionSection
                  key={list.id}
                  sectionId={list.id}
                  name={list.name}
                  favourites={listFavourites}
                  isOpen={openListIds.has(list.id)}
                  onToggle={handleAccordionClick}
                  showBusinessAnalysis={showBusinessAnalysis}
                  onEdit={handleEditFavourite}
                  onDelete={handleDeleteFavourite}
                  selectable={bulkActionMode}
                  selectedFavouriteIds={selectedFavourites}
                  onSelectChange={handleFavouriteSelection}
                />
              ))}

              {/* Unlisted Favourites */}
              {unlistedFavourites.length > 0 && (
                <FavouritesAccordionSection
                  sectionId="unlisted"
                  name="Unlisted Favourites"
                  favourites={unlistedFavourites}
                  isOpen={openListIds.has('unlisted')}
                  onToggle={handleAccordionClick}
                  showBusinessAnalysis={showBusinessAnalysis}
                  onEdit={handleEditFavourite}
                  onDelete={handleDeleteFavourite}
                  selectable={bulkActionMode}
                  selectedFavouriteIds={selectedFavourites}
                  onSelectChange={handleFavouriteSelection}
                />
              )}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingFavourite && (
          <AddEditFavouriteModal
            isOpen={!!editingFavourite}
            onClose={() => {
              setEditingFavourite(null);
            }}
            tickerId={editingFavourite.tickerId}
            tickerSymbol={editingFavourite.ticker.symbol}
            tickerName={editingFavourite.ticker.name}
            lists={lists}
            tags={tags}
            onManageLists={() => setManageModalView('manage-lists')}
            onManageTags={() => setManageModalView('manage-tags')}
            favouriteTicker={editingFavourite}
            onUpsert={async () => {
              await refetchFavourites();
              setEditingFavourite(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingFavourite && (
          <DeleteConfirmationModal
            open={!!deletingFavourite}
            onClose={() => setDeletingFavourite(null)}
            onDelete={handleDelete}
            deleting={isDeleting}
            title={`Delete ${deletingFavourite.ticker.symbol} from favourites?`}
            deleteButtonText="Delete Favourite"
            confirmationText="DELETE"
          />
        )}

        {/* Manage Modals */}
        <ManageListsModal
          isOpen={manageModalView === 'manage-lists'}
          onClose={() => setManageModalView(null)}
          lists={lists}
          onListsChange={handleListsChange}
        />

        <ManageTagsModal isOpen={manageModalView === 'manage-tags'} onClose={() => setManageModalView(null)} tags={tags} onTagsChange={handleTagsChange} />

        {/* Bulk Action Modals */}
        <BulkAddTagsModal
          isOpen={manageModalView === 'bulk-add-tags'}
          onClose={() => setManageModalView(null)}
          tags={tags}
          selectedFavouriteIds={selectedFavourites}
          onSuccess={async () => {
            await refetchFavourites();
            setManageModalView(null);
            setBulkActionMode(false);
          }}
        />

        <BulkAddListsModal
          isOpen={manageModalView === 'bulk-add-lists'}
          onClose={() => setManageModalView(null)}
          lists={lists}
          selectedFavouriteIds={selectedFavourites}
          onSuccess={async () => {
            await refetchFavourites();
            setManageModalView(null);
            setBulkActionMode(false);
          }}
        />

        {/* Bulk Action Bar - Fixed at bottom when items are selected */}
        {bulkActionMode && selectedFavourites.size > 0 && (
          <BulkActionBar
            selectedCount={selectedFavourites.size}
            onAddTags={() => setManageModalView('bulk-add-tags')}
            onAddLists={() => setManageModalView('bulk-add-lists')}
          />
        )}
      </div>
    </PageWrapper>
  );
}
