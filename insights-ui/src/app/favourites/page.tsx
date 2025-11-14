'use client';

import AddEditFavouriteModal from '@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import { FavouriteTickerResponse, UserListResponse, UserTickerTagResponse } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsSession } from '@/types/auth';
import { TagIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import ManageListsModal from '@/components/favourites/ManageListsModal';
import ManageTagsModal from '@/components/favourites/ManageTagsModal';
import FavouriteItem from '@/components/favourites/FavouriteItem';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';

type ModalView = 'manage-lists' | 'manage-tags';

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
    'Failed to fetch favourites'
  );

  const { data: listsData, reFetchData: refetchLists } = useFetchData<{ lists: UserListResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-lists`,
    { skipInitialFetch: !session },
    'Failed to fetch lists'
  );

  const { data: tagsData, reFetchData: refetchTags } = useFetchData<{ tags: UserTickerTagResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-ticker-tags`,
    { skipInitialFetch: !session },
    'Failed to fetch tags'
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
    // Sort lists alphabetically
    const sortedLists = [...lists].sort((a, b) => a.name.localeCompare(b.name));

    // Group favourites by list
    const listsMap = new Map<string, ListWithFavourites>();
    sortedLists.forEach((list) => {
      listsMap.set(list.id, { list, favourites: [] });
    });

    const unlisted: FavouriteTickerResponse[] = [];

    favourites.forEach((fav) => {
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
  }, [favourites, lists]);

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

  // Show loading screen only when loading data
  if (favouritesLoading) {
    return <FullPageLoader message="Loading your favourites..." />;
  }

  const handleDelete = async () => {
    if (!deletingFavourite) return;

    const result = await deleteFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers?id=${deletingFavourite.id}`);
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

  // Show loading or redirect if no session
  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <HeartIcon className="w-8 h-8 text-red-500" />
                My Favourites
              </h1>
              <p className="text-gray-400 mt-1">
                {favourites.length} favourite {favourites.length === 1 ? 'stock' : 'stocks'} across{' '}
                {listsWithFavourites.length + (unlistedFavourites.length > 0 ? 1 : 0)}{' '}
                {listsWithFavourites.length + (unlistedFavourites.length > 0 ? 1 : 0) === 1 ? 'list' : 'lists'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center mb-2">
                <ToggleWithIcon label="Show Business Summary" enabled={showBusinessAnalysis} setEnabled={handleToggleBusinessAnalysis} onClickOnLabel={true} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setManageModalView('manage-lists')} variant="outlined" className="inline-flex items-center">
                  <ListBulletIcon className="w-4 h-4 mr-2" />
                  Manage Lists
                </Button>
                <Button onClick={() => setManageModalView('manage-tags')} variant="outlined" className="inline-flex items-center">
                  <TagIcon className="w-4 h-4 mr-2" />
                  Manage Tags
                </Button>
              </div>
            </div>
          </div>

          {/* Lists with Favourites */}
          {favourites.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <HeartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No favourites yet</h3>
              <p className="text-gray-400 mb-4">Start adding stocks to your favourites to see them here.</p>
              <Link href="/stocks" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
                Browse Stocks
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lists with favourites */}
              {listsWithFavourites.map(({ list, favourites: listFavourites }) => {
                const isOpen = openListIds.has(list.id);
                const tickerSymbols = listFavourites.map((f) => f.ticker.symbol).join(', ');
                const label = isOpen ? list.name : `${list.name} (${tickerSymbols})`;

                return (
                  <Accordion key={list.id} isOpen={isOpen} label={label} onClick={(e) => handleAccordionClick(e, list.id)}>
                    <div className="space-y-3">
                      {listFavourites.map((favourite) => (
                        <FavouriteItem
                          key={favourite.id}
                          favourite={favourite}
                          showBusinessAnalysis={showBusinessAnalysis}
                          onEdit={setEditingFavourite}
                          onDelete={setDeletingFavourite}
                        />
                      ))}
                    </div>
                  </Accordion>
                );
              })}

              {/* Unlisted Favourites */}
              {unlistedFavourites.length > 0 && (
                <Accordion
                  isOpen={openListIds.has('unlisted')}
                  label={
                    openListIds.has('unlisted') ? 'Unlisted Favourites' : `Unlisted Favourites (${unlistedFavourites.map((f) => f.ticker.symbol).join(', ')})`
                  }
                  onClick={(e) => handleAccordionClick(e, 'unlisted')}
                >
                  <div className="space-y-3">
                    {unlistedFavourites.map((favourite) => (
                      <FavouriteItem
                        key={favourite.id}
                        favourite={favourite}
                        showBusinessAnalysis={showBusinessAnalysis}
                        onEdit={setEditingFavourite}
                        onDelete={setDeletingFavourite}
                      />
                    ))}
                  </div>
                </Accordion>
              )}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingFavourite && (
          <AddEditFavouriteModal
            isOpen={!!editingFavourite}
            onClose={() => setEditingFavourite(null)}
            tickerId={editingFavourite.tickerId}
            tickerSymbol={editingFavourite.ticker.symbol}
            tickerName={editingFavourite.ticker.name}
            onSuccess={async () => {
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
      </div>
    </PageWrapper>
  );
}
