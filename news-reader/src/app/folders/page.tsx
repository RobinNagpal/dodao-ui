'use client';

import FolderManager from '@/components/folder-manager';
import { useNewsData } from '@/providers/NewsDataProvider';

export default function FoldersPage() {
  const { folders, addFolder, deleteFolder, topics } = useNewsData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <FolderManager folders={folders} onAdd={addFolder} onDelete={deleteFolder} topics={topics} />
      </div>
    </div>
  );
}
