'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { UserListResponse, CreateUserListRequest, UpdateUserListRequest } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Input from '@dodao/web-core/components/core/input/Input';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

interface ManageListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: UserListResponse[];
  onListsChange: () => void;
}

export default function ManageListsModal({ isOpen, onClose, lists, onListsChange }: ManageListsModalProps) {
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingList, setEditingList] = useState<UserListResponse | null>(null);
  const [editListName, setEditListName] = useState('');
  const [editListDescription, setEditListDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteListId, setDeleteListId] = useState('');

  const { postData: createList, loading: creating } = usePostData<UserListResponse, CreateUserListRequest>({
    successMessage: 'List created successfully!',
    errorMessage: 'Failed to create list.',
  });

  const { deleteData: deleteList, loading: deleting } = useDeleteData({
    successMessage: 'List deleted successfully!',
    errorMessage: 'Failed to delete list.',
  });

  const { putData: updateList, loading: updating } = usePutData<UserListResponse, UpdateUserListRequest>({
    successMessage: 'List updated successfully!',
    errorMessage: 'Failed to update list.',
  });

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      return;
    }

    const result = await createList(`/api/${KoalaGainsSpaceId}/users/user-lists`, {
      name: newListName.trim(),
      description: newListDescription.trim() || undefined,
    });

    if (result) {
      setNewListName('');
      setNewListDescription('');
      setShowAddForm(false);
      onListsChange();
    }
  };

  const handleCancelAdd = () => {
    setNewListName('');
    setNewListDescription('');
    setShowAddForm(false);
  };

  const handleEditList = (list: UserListResponse) => {
    setEditingList(list);
    setEditListName(list.name);
    setEditListDescription(list.description || '');
    setShowAddForm(false); // Hide add form if open
  };

  const handleUpdateList = async () => {
    if (!editingList || !editListName.trim()) {
      return;
    }

    const result = await updateList(`/api/${KoalaGainsSpaceId}/users/user-lists?id=${editingList.id}`, {
      name: editListName.trim(),
      description: editListDescription.trim(),
    });

    if (result) {
      setEditingList(null);
      setEditListName('');
      setEditListDescription('');
      onListsChange();
    }
  };

  const handleCancelEdit = () => {
    setEditingList(null);
    setEditListName('');
    setEditListDescription('');
  };

  const handleDeleteList = (listId: string) => {
    setDeleteListId(listId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const result = await deleteList(`/api/${KoalaGainsSpaceId}/users/user-lists?id=${deleteListId}`);
    if (result) {
      setShowDeleteConfirm(false);
      setDeleteListId('');
      onListsChange();
    }
  };

  return (
    <>
      <FullPageModal open={isOpen} onClose={onClose} title="Manage Lists" className="w-full max-w-2xl">
        <div className="p-4 space-y-4 text-left">
          {/* Create New List Form - Only show when showAddForm is true */}
          {showAddForm && (
            <div className="bg-surface p-3 rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-heading flex items-center gap-2 text-left">
                <PlusIcon className="w-4 h-4" />
                Create New List
              </h4>
              <Input
                modelValue={newListName}
                onUpdate={(value) => setNewListName(value?.toString() || '')}
                placeholder="Enter list name"
                className="text-heading"
              >
                List Name *
              </Input>
              <Input
                modelValue={newListDescription}
                onUpdate={(value) => setNewListDescription(value?.toString() || '')}
                placeholder="Enter description (optional)"
                className="text-heading"
              >
                Description
              </Input>
              <div className="flex gap-2">
                <Button onClick={handleCreateList} disabled={creating || !newListName.trim()} loading={creating} variant="contained" primary className="flex-1">
                  Create List
                </Button>
                <Button onClick={handleCancelAdd} disabled={creating} variant="outlined" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Edit List Form - Show when editing */}
          {editingList && (
            <div className="bg-surface p-3 rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-heading flex items-center gap-2 text-left">
                <PencilIcon className="w-4 h-4" />
                Edit List
              </h4>
              <Input
                modelValue={editListName}
                onUpdate={(value) => setEditListName(value?.toString() || '')}
                placeholder="Enter list name"
                className="text-heading"
              >
                List Name *
              </Input>
              <Input
                modelValue={editListDescription}
                onUpdate={(value) => setEditListDescription(value?.toString() || '')}
                placeholder="Enter description (optional)"
                className="text-heading"
              >
                Description
              </Input>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateList}
                  disabled={updating || !editListName.trim()}
                  loading={updating}
                  variant="contained"
                  primary
                  className="flex-1"
                >
                  Update
                </Button>
                <Button onClick={handleCancelEdit} disabled={updating} variant="outlined" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Lists */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-heading text-left">Your Lists ({lists.length})</h4>
              {!showAddForm && !editingList && (
                <Button onClick={() => setShowAddForm(true)} variant="contained" primary className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Add List
                </Button>
              )}
            </div>
            <div className="space-y-1.5 max-h-80 overflow-y-auto bg-bg rounded-md p-2">
              {lists.length === 0 ? (
                <p className="text-muted text-sm px-2 py-3 text-center">No lists created yet.</p>
              ) : (
                lists.map((list) => (
                  <div key={list.id} className="bg-surface px-3 py-2 rounded-lg hover:bg-surface-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{list.name}</p>
                        {list.description && <p className="text-xs text-muted leading-snug">{list.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleEditList(list)} variant="text" className="text-link hover:text-link p-1">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteList(list.id)} variant="text" className="text-red-400 hover:text-red-300 p-1">
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </FullPageModal>

      <ConfirmationModal
        open={showDeleteConfirm}
        showSemiTransparentBg={true}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirming={deleting}
        title="Delete List"
        confirmationText="Are you sure you want to delete this list? This action cannot be undone."
        askForTextInput={false}
      />
    </>
  );
}
