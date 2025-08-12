'use client';

import AddTopicForm from '@/components/add-topic-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNewsData } from '@/providers/NewsDataProvider';

export default function AddTopicPage() {
  const { addTopic, templates, addTemplate, folders, getFolderPath } = useNewsData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add New News Topic</CardTitle>
              <CardDescription>Configure a new topic to track news articles. You can use a template or create your own configuration.</CardDescription>
            </CardHeader>
            <CardContent>
              <AddTopicForm onAdd={addTopic} templates={templates} onAddTemplate={addTemplate} folders={folders} getFolderPath={getFolderPath} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
