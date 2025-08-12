'use client';

import TopicList from '@/components/topic-list';
import { useNewsData } from '@/providers/NewsDataProvider';

export default function ManageTopicsPage() {
  const { topics, deleteTopic, folders, getFolderPath } = useNewsData();

  // Fetch token and store it
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <TopicList topics={topics} onDelete={deleteTopic} folders={folders} getFolderPath={getFolderPath} />
      </div>
    </div>
  );
}
