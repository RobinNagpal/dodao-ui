'use client';

import { NewsTopicFolderType as FolderType, NewsTopicType, ROOT_FOLDER } from '@/lib/news-reader-types';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, FolderOpen, Plus, Folder, ChevronRight, ArrowLeft } from 'lucide-react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { NewsTopicFolder } from '@prisma/client';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import Link from 'next/link';

// Define types for API requests and responses
interface CreateFolderPayload {
  name: string;
  parentId: string | null;
}

interface CreateFolderResponse extends NewsTopicFolder {}

interface FolderManagerProps {
  folders: FolderType[];
  topics: NewsTopicType[];
  fetchFolders: () => void;
}

export default function FolderManager({ folders, topics, fetchFolders }: FolderManagerProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [selectedParent, setSelectedParent] = useState<string>(ROOT_FOLDER);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);

  const baseUrl: string = getBaseUrl();
  const { showNotification } = useNotificationContext();

  // Use the usePostData hook for creating folders
  const { postData: createFolder, loading: creatingFolder } = usePostData<CreateFolderResponse, CreateFolderPayload>({
    successMessage: 'Folder created successfully',
    errorMessage: 'Failed to create folder',
  });

  // Use the useDeleteData hook for deleting folders
  const { deleteData: deleteFolder, loading: deletingFolder } = useDeleteData<NewsTopicFolder, void>({
    successMessage: 'Folder deleted successfully',
    errorMessage: 'Failed to delete folder',
  });

  // Flatten folders for parent selection
  const flattenFolders = (folders: FolderType[], level = 0): (FolderType & { level: number })[] => {
    let result: (FolderType & { level: number })[] = [];
    folders.forEach((folder) => {
      result.push({ ...folder, level });
      if (folder.children.length > 0) {
        result = result.concat(flattenFolders(folder.children, level + 1));
      }
    });
    return result;
  };

  const flatFolders = flattenFolders(folders);

  // Count topics in folder and subfolders
  const countTopicsInFolder = (folderId: string): number => {
    const getFolderAndChildren = (folders: FolderType[], targetId: string): string[] => {
      let result: string[] = [];
      folders.forEach((folder) => {
        if (folder.id === targetId) {
          result.push(folder.id);
          const getChildIds = (children: FolderType[]): void => {
            children.forEach((child) => {
              result.push(child.id);
              if (child.children.length > 0) {
                getChildIds(child.children);
              }
            });
          };
          getChildIds(folder.children);
        } else if (folder.children.length > 0) {
          result = result.concat(getFolderAndChildren(folder.children, targetId));
        }
      });
      return result;
    };

    const folderIds = getFolderAndChildren(folders, folderId);
    return topics.filter((topic) => topic.folderId !== null && folderIds.includes(topic.folderId)).length;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmedName: string = newFolderName.trim();

    if (trimmedName) {
      const payload: CreateFolderPayload = {
        name: trimmedName,
        parentId: selectedParent === ROOT_FOLDER ? null : selectedParent,
      };

      // Use the createFolder function from usePostData
      const success = await createFolder(`${baseUrl}/api/news-topic-folders`, payload);

      if (success) {
        setNewFolderName('');
        setSelectedParent(ROOT_FOLDER);
        setShowAddForm(false);
        fetchFolders();
      }
    } else {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Folder name is required',
      });
    }
  };

  const resetForm = (): void => {
    setNewFolderName('');
    setSelectedParent(ROOT_FOLDER);
    setShowAddForm(false);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!folderToDelete) return;

    // Use the deleteFolder function from useDeleteData
    const success = await deleteFolder(`${baseUrl}/api/news-topic-folders/${folderToDelete.id}`);

    if (success) {
      fetchFolders();
    }

    // Close the modal
    setFolderToDelete(null);
  };

  const renderFolder = (folder: FolderType, level = 0): JSX.Element => {
    const topicCount = countTopicsInFolder(folder.id);

    return (
      <div key={folder.id}>
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center gap-2">
                  {level > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <span className="font-medium">{folder.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {topicCount} topic{topicCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(): void => setFolderToDelete(folder)}
                className="text-destructive hover:text-destructive"
                disabled={deletingFolder}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        {folder.children.map((child) => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2" type="button">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Button
          onClick={(): void => setShowAddForm(!showAddForm)}
          variant="outline"
          className="flex items-center gap-2 border-primary"
          disabled={creatingFolder || deletingFolder}
        >
          <Plus className="h-4 w-4" />
          Create Folder
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Folder Manager</h2>
          <p className="text-muted-foreground">Organize your news topics into folders</p>
        </div>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Folder</CardTitle>
            <CardDescription>Create a new folder to organize your news topics</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setNewFolderName(e.target.value)}
                  placeholder="e.g., Technology, Finance, Healthcare"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent-folder">Parent Folder (Optional)</Label>
                <Select value={selectedParent} onValueChange={setSelectedParent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent folder or leave empty for root" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROOT_FOLDER}>Root Level</SelectItem>
                    {flatFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span style={{ marginLeft: `${folder.level * 12}px` }}>
                            {'  '.repeat(folder.level)}
                            {folder.level > 0 && '└ '}
                            {folder.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={creatingFolder}>
                  {creatingFolder ? 'Creating...' : 'Create Folder'}
                </Button>
                <Button type="button" variant="outline" onClick={(): void => resetForm()} disabled={creatingFolder}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Folder Structure</h3>
        {folders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Folders Created</h3>
              <p className="text-muted-foreground">Create your first folder to organize your news topics</p>
            </CardContent>
          </Card>
        ) : (
          <div>{folders.map((folder) => renderFolder(folder))}</div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={folderToDelete !== null}
        onClose={() => setFolderToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Folder"
        confirmationText={`Are you sure you want to delete the folder "${folderToDelete?.name}"? This action cannot be undone.${
          folderToDelete && countTopicsInFolder(folderToDelete.id) > 0 ? ' Note: This folder contains topics that will be moved to the root level.' : ''
        }${folderToDelete && folderToDelete.children.length > 0 ? ' Note: This folder contains subfolders that will be deleted as well.' : ''}`}
        confirming={deletingFolder}
        askForTextInput={false}
        showSemiTransparentBg={true}
      />
    </div>
  );
}
