'use client';

import { NewsTopicFolder as FolderType, NewsTopic } from '@/lib/news-reader-types';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, FolderOpen, Plus, Folder, ChevronRight } from 'lucide-react';

interface FolderManagerProps {
  folders: FolderType[];
  onAdd: (newFolder: Partial<FolderType>) => void;
  onDelete: (id: number) => void;
  topics: NewsTopic[];
}

export default function FolderManager({ folders, onAdd, onDelete, topics }: FolderManagerProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [selectedParent, setSelectedParent] = useState<string>('');

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
  const countTopicsInFolder = (folderId: number): number => {
    const getFolderAndChildren = (folders: FolderType[], targetId: number): number[] => {
      let result: number[] = [];
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
    return topics.filter((topic) => folderIds.includes(topic.folderId as number)).length;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAdd({
        name: newFolderName.trim(),
        parentId: selectedParent ? parseInt(selectedParent) : null,
      });
      setNewFolderName('');
      setSelectedParent('');
      setShowAddForm(false);
    }
  };

  const resetForm = (): void => {
    setNewFolderName('');
    setSelectedParent('');
    setShowAddForm(false);
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
              <Button variant="ghost" size="sm" onClick={() => onDelete(folder.id)} className="text-destructive hover:text-destructive">
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
        <div>
          <h2 className="text-2xl font-bold">Folder Manager</h2>
          <p className="text-muted-foreground">Organize your news topics into folders</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Folder
        </Button>
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
                  onChange={(e) => setNewFolderName(e.target.value)}
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
                    <SelectItem value="">Root Level</SelectItem>
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
                <Button type="submit" className="flex-1">
                  Create Folder
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
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
    </div>
  );
}
