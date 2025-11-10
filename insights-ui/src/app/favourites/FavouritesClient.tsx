'use client';

import AddEditFavouriteModal from '@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import { FavouriteTickerResponse, UserListResponse, UserTickerTagResponse } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PencilIcon, TrashIcon, TagIcon, ListBulletIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import ManageListsModal from '@/components/favourites/ManageListsModal';
import ManageTagsModal from '@/components/favourites/ManageTagsModal';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import Button from '@dodao/web-core/components/core/buttons/Button';

interface FavouritesClientProps {
  initialFavourites: FavouriteTickerResponse[];
  initialLists: UserListResponse[];
  initialTags: UserTickerTagResponse[];
}

type ModalView = 'manage-lists' | 'manage-tags';

export default function FavouritesClient({ initialFavourites, initialLists, initialTags }: FavouritesClientProps) {
  const [editingFavourite, setEditingFavourite] = useState<FavouriteTickerResponse | null>(null);
  const [deletingFavourite, setDeletingFavourite] = useState<FavouriteTickerResponse | null>(null);
  const [manageModalView, setManageModalView] = useState<ModalView | null>(null);
  
  // Local state initialized with server data
  const [favourites, setFavourites] = useState<FavouriteTickerResponse[]>(initialFavourites);
  const [lists, setLists] = useState<UserListResponse[]>(initialLists);
  const [tags, setTags] = useState<UserTickerTagResponse[]>(initialTags);
  
  // Filters
  const [selectedFilterListId, setSelectedFilterListId] = useState<string>('');
  const [selectedFilterTagId, setSelectedFilterTagId] = useState<string>('');

  // Fetch data with custom hooks (skip initial fetch since we have server data)
  const {
    data: favouritesData,
    reFetchData: refetchFavourites,
  } = useFetchData<{ favouriteTickers: FavouriteTickerResponse[] }>(
    `/api/${KoalaGainsSpaceId}/users/favourite-tickers`,
    { skipInitialFetch: true },
    'Failed to fetch favourites'
  );

  const {
    data: listsData,
    reFetchData: refetchLists,
  } = useFetchData<{ lists: UserListResponse[] }>(
    `/api/${KoalaGainsSpaceId}/users/user-lists`,
    { skipInitialFetch: true },
    'Failed to fetch lists'
  );

  const {
    data: tagsData,
    reFetchData: refetchTags,
  } = useFetchData<{ tags: UserTickerTagResponse[] }>(
    `/api/${KoalaGainsSpaceId}/users/user-ticker-tags`,
    { skipInitialFetch: true },
    'Failed to fetch tags'
  );

  const { deleteData: deleteFavourite, loading: isDeleting } = useDeleteData({
    successMessage: 'Favourite deleted successfully!',
    errorMessage: 'Failed to delete favourite.',
  });

  // Update local state when refetch happens
  useEffect(() => {
    if (favouritesData?.favouriteTickers) {
      setFavourites(favouritesData.favouriteTickers);
    }
  }, [favouritesData]);

  useEffect(() => {
    if (listsData?.lists) {
      setLists(listsData.lists);
    }
  }, [listsData]);

  useEffect(() => {
    if (tagsData?.tags) {
      setTags(tagsData.tags);
    }
  }, [tagsData]);

  const handleDelete = async () => {
    if (!deletingFavourite) return;

    const result = await deleteFavourite(`/api/${KoalaGainsSpaceId}/users/favourite-tickers?id=${deletingFavourite.id}`);
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

  // Filter favourites
  const filteredFavourites = favourites.filter((fav) => {
    if (selectedFilterListId && !fav.lists.some((l) => l.id === selectedFilterListId)) {
      return false;
    }
    if (selectedFilterTagId && !fav.tags.some((t) => t.id === selectedFilterTagId)) {
      return false;
    }
    return true;
  });


  return (
    <>
      <div className="py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <HeartIcon className="w-8 h-8 text-red-500" />
              My Favourites
            </h1>
            <p className="text-gray-400 mt-1">
              {filteredFavourites.length} favourite {filteredFavourites.length === 1 ? 'stock' : 'stocks'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setManageModalView('manage-lists')}
              variant="outlined"
              className="inline-flex items-center"
            >
              <ListBulletIcon className="w-4 h-4 mr-2" />
              Manage Lists
            </Button>
            <Button
              onClick={() => setManageModalView('manage-tags')}
              variant="outlined"
              className="inline-flex items-center"
            >
              <TagIcon className="w-4 h-4 mr-2" />
              Manage Tags
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StyledSelect
              label="Filter by List"
              selectedItemId={selectedFilterListId || null}
              setSelectedItemId={(id) => setSelectedFilterListId(id || '')}
              items={[
                { id: '', label: 'All Lists' },
                ...lists.map((list) => ({ id: list.id, label: list.name }))
              ]}
              showPleaseSelect={false}
            />
            <StyledSelect
              label="Filter by Tag"
              selectedItemId={selectedFilterTagId || null}
              setSelectedItemId={(id) => setSelectedFilterTagId(id || '')}
              items={[
                { id: '', label: 'All Tags' },
                ...tags.map((tag) => ({ id: tag.id, label: tag.name }))
              ]}
              showPleaseSelect={false}
            />
          </div>
          {(selectedFilterListId || selectedFilterTagId) && (
            <button
              onClick={() => {
                setSelectedFilterListId('');
                setSelectedFilterTagId('');
              }}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Favourites Grid */}
        {filteredFavourites.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <HeartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favourites yet</h3>
            <p className="text-gray-400 mb-4">Start adding stocks to your favourites to see them here.</p>
            <Link href="/stocks" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
              Browse Stocks
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFavourites.map((favourite) => (
              <div key={favourite.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <Link
                    href={`/stocks/${favourite.ticker.exchange}/${favourite.ticker.symbol}`}
                    className="flex-1 hover:text-blue-400"
                  >
                    <h3 className="text-lg font-bold">{favourite.ticker.symbol}</h3>
                    <p className="text-sm text-gray-400">{favourite.ticker.name}</p>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingFavourite(favourite)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeletingFavourite(favourite)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {favourite.myScore !== null && favourite.myScore !== undefined && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-400">My Score:</span>
                    <span className="ml-2 text-sm font-bold" style={{ color: 'var(--primary-color, #3B82F6)' }}>
                      {favourite.myScore.toFixed(1)}
                    </span>
                  </div>
                )}

                {favourite.myNotes && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-300 line-clamp-2">{favourite.myNotes}</p>
                  </div>
                )}

                {/* Tags */}
                {favourite.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {favourite.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: tag.colorHex }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Lists */}
                {favourite.lists.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {favourite.lists.map((list) => (
                      <span
                        key={list.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-700 text-gray-300"
                      >
                        <ListBulletIcon className="w-3 h-3" />
                        {list.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
          existingFavourite={editingFavourite}
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

      <ManageTagsModal
        isOpen={manageModalView === 'manage-tags'}
        onClose={() => setManageModalView(null)}
        tags={tags}
        onTagsChange={handleTagsChange}
      />
    </>
  );
}

