'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { UserTickerTagResponse, CreateUserTickerTagRequest, UpdateUserTickerTagRequest } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Input from '@dodao/web-core/components/core/input/Input';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

interface ManageTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: UserTickerTagResponse[];
  onTagsChange: () => void;
}

export default function ManageTagsModal({ isOpen, onClose, tags, onTagsChange }: ManageTagsModalProps) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTag, setEditingTag] = useState<UserTickerTagResponse | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagDescription, setEditTagDescription] = useState('');
  const [editTagColor, setEditTagColor] = useState('#3B82F6');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTagId, setDeleteTagId] = useState('');

  const { postData: createTag, loading: creating } = usePostData<UserTickerTagResponse, CreateUserTickerTagRequest>({
    successMessage: 'Tag created successfully!',
    errorMessage: 'Failed to create tag.',
  });

  const { deleteData: deleteTag, loading: deleting } = useDeleteData({
    successMessage: 'Tag deleted successfully!',
    errorMessage: 'Failed to delete tag.',
  });

  const { putData: updateTag, loading: updating } = usePutData<UserTickerTagResponse, UpdateUserTickerTagRequest>({
    successMessage: 'Tag updated successfully!',
    errorMessage: 'Failed to update tag.',
  });

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      return;
    }

    const result = await createTag(`/api/${KoalaGainsSpaceId}/users/user-ticker-tags`, {
      name: newTagName.trim(),
      description: newTagDescription.trim() || undefined,
      colorHex: newTagColor,
    });

    if (result) {
      setNewTagName('');
      setNewTagDescription('');
      setNewTagColor('#3B82F6');
      setShowAddForm(false);
      onTagsChange();
    }
  };

  const handleCancelAdd = () => {
    setNewTagName('');
    setNewTagDescription('');
    setNewTagColor('#3B82F6');
    setShowAddForm(false);
  };

  const handleEditTag = (tag: UserTickerTagResponse) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
    setEditTagDescription(tag.description || '');
    setEditTagColor(tag.colorHex);
    setShowAddForm(false); // Hide add form if open
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editTagName.trim()) {
      return;
    }

    const result = await updateTag(`/api/${KoalaGainsSpaceId}/users/user-ticker-tags?id=${editingTag.id}`, {
      name: editTagName.trim(),
      description: editTagDescription.trim() || undefined,
      colorHex: editTagColor,
    });

    if (result) {
      setEditingTag(null);
      setEditTagName('');
      setEditTagDescription('');
      setEditTagColor('#3B82F6');
      onTagsChange();
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditTagName('');
    setEditTagDescription('');
    setEditTagColor('#3B82F6');
  };

  const handleDeleteTag = (tagId: string) => {
    setDeleteTagId(tagId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const result = await deleteTag(`/api/${KoalaGainsSpaceId}/users/user-ticker-tags?id=${deleteTagId}`);
    if (result) {
      setShowDeleteConfirm(false);
      setDeleteTagId('');
      onTagsChange();
    }
  };

  return (
    <>
      <FullPageModal open={isOpen} onClose={onClose} title="Manage Tags" className="w-full max-w-2xl">
        <div className="p-6 space-y-6">
          {/* Create New Tag Form - Only show when showAddForm is true */}
          {showAddForm && (
            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
              <h4 className="font-medium flex items-center justify-center gap-2">
                <PlusIcon className="w-5 h-5" />
                Create New Tag
              </h4>
              <Input
                modelValue={newTagName}
                onUpdate={(value) => setNewTagName(value?.toString() || '')}
                placeholder="Enter tag name"
                className=" text-white"
              >
                Tag Name *
              </Input>
              <Input
                modelValue={newTagDescription}
                onUpdate={(value) => setNewTagDescription(value?.toString() || '')}
                placeholder="Enter description (optional)"
                className=" text-white"
              >
                Description
              </Input>
              <div className="space-y-2">
                <label htmlFor="tag-color" className="block text-sm font-medium">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    id="tag-color"
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-16 h-10 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                  />
                  <span className="text-sm text-gray-400">{newTagColor}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTag}
                  disabled={creating || !newTagName.trim()}
                  loading={creating}
                  variant="contained"
                  primary
                  className="flex-1"
                >
                  Create Tag
                </Button>
                <Button
                  onClick={handleCancelAdd}
                  disabled={creating}
                  variant="outlined"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Tags */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-center">Your Tags ({tags.length})</h4>
              {!showAddForm && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="contained"
                  primary
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Tag
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-gray-500 text-sm">No tags created yet.</p>
              ) : (
                tags.map((tag) => (
                  <div key={tag.id} className="bg-gray-800 p-3 rounded-lg">
                    {editingTag?.id === tag.id ? (
                      // Edit form
                      <div className="space-y-3">
                        <Input
                          modelValue={editTagName}
                          onUpdate={(value) => setEditTagName(value?.toString() || '')}
                          placeholder="Enter tag name"
                          className="text-white"
                        >
                          Tag Name *
                        </Input>
                        <Input
                          modelValue={editTagDescription}
                          onUpdate={(value) => setEditTagDescription(value?.toString() || '')}
                          placeholder="Enter description (optional)"
                          className="text-white"
                        >
                          Description
                        </Input>
                        <div className="space-y-2">
                          <label htmlFor="edit-tag-color" className="block text-sm font-medium">Color</label>
                          <div className="flex items-center gap-3">
                            <input
                              id="edit-tag-color"
                              type="color"
                              value={editTagColor}
                              onChange={(e) => setEditTagColor(e.target.value)}
                              className="w-16 h-10 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                            />
                            <span className="text-sm text-gray-400">{editTagColor}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUpdateTag}
                            disabled={updating || !editTagName.trim()}
                            loading={updating}
                            variant="contained"
                            primary
                            className="flex-1"
                          >
                            Update
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            disabled={updating}
                            variant="outlined"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.colorHex }} />
                          <div className="flex-1">
                            <p className="font-medium">{tag.name}</p>
                            {tag.description && <p className="text-sm text-gray-400">{tag.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEditTag(tag)}
                            variant="text"
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteTag(tag.id)}
                            variant="text"
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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
        title="Delete Tag"
        confirmationText="Are you sure you want to delete this tag? This action cannot be undone."
        askForTextInput={false}
      />
    </>
  );
}

