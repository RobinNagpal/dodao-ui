'use client';

import { NewsTopicFolderType, NewsTopicTemplateType, NewsTopicType } from '@/lib/news-reader-types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, Filter, LayoutTemplateIcon as Template, FolderOpen, Plus, ArrowLeft } from 'lucide-react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import Link from 'next/link';
import AddTopicForm from './add-topic-form';

// Define types for API requests and responses
interface CreateTopicPayload {
  topic: string;
  description: string;
  filters: string[];
  templateUsed: string;
  folderId: string | null;
}

interface TopicManagerProps {
  topics: NewsTopicType[];
  templates: NewsTopicTemplateType[];
  folders: NewsTopicFolderType[];
  getFolderPath: (folderId: string | null, folders: NewsTopicFolderType[], path?: string[]) => string[];
  fetchTopics: () => void;
}

export default function TopicManager({ topics, templates, folders, getFolderPath, fetchTopics }: TopicManagerProps): JSX.Element {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [topicToDelete, setTopicToDelete] = useState<NewsTopicType | null>(null);

  const baseUrl: string = getBaseUrl();
  const { showNotification } = useNotificationContext();

  // Use the usePostData hook for creating topics
  const { postData: createTopic, loading: creatingTopic } = usePostData<NewsTopicType, CreateTopicPayload>({
    successMessage: 'Topic created successfully',
    errorMessage: 'Failed to create topic',
  });

  // Use the usePostData hook for creating templates
  const { postData: createTemplate, loading: creatingTemplate } = usePostData<NewsTopicTemplateType, Partial<NewsTopicTemplateType>>({
    successMessage: 'Template created successfully',
    errorMessage: 'Failed to create template',
  });

  // Use the useDeleteData hook for deleting topics
  const { deleteData: deleteTopic, loading: deletingTopic } = useDeleteData<NewsTopicType, void>({
    successMessage: 'Topic deleted successfully',
    errorMessage: 'Failed to delete topic',
  });

  const handleAddTopic = async (newTopic: Partial<NewsTopicType>): Promise<void> => {
    if (!newTopic.topic || !newTopic.description || !newTopic.filters || !newTopic.templateUsed) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Missing required fields: topic, description, filters, and templateUsed are required',
      });
      return;
    }

    const payload: CreateTopicPayload = {
      topic: newTopic.topic,
      description: newTopic.description,
      filters: newTopic.filters,
      templateUsed: newTopic.templateUsed,
      folderId: newTopic.folderId || null,
    };

    // Use the createTopic function from usePostData
    const success = await createTopic(`${baseUrl}/api/news-topics`, payload);

    if (success) {
      setShowAddForm(false);
      fetchTopics();
    }
  };

  const handleAddTemplate = async (newTemplate: Partial<NewsTopicTemplateType>): Promise<void> => {
    if (!newTemplate.name || !newTemplate.description) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Template name and description are required',
      });
      return;
    }

    // Use the createTemplate function from usePostData
    await createTemplate(`${baseUrl}/api/news-topic-templates`, newTemplate);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!topicToDelete) return;

    try {
      // Use the deleteTopic function from useDeleteData
      const success = await deleteTopic(`${baseUrl}/api/news-topics/${topicToDelete.id}`);

      if (success) {
        fetchTopics();
      }
    } catch (error) {
      // Handle specific error for topics with articles
      if (error instanceof Error && error.message.includes('articles')) {
        showNotification({
          type: 'error',
          heading: 'Cannot Delete Topic',
          message: error.message,
        });
      } else {
        throw error; // Re-throw other errors to be handled by useDeleteData
      }
    } finally {
      // Close the modal
      setTopicToDelete(null);
    }
  };

  // Render the topic list
  const renderTopicList = (): JSX.Element => {
    if (topics.length === 0) {
      return (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No News Topics Configured</h3>
          <p className="text-muted-foreground mb-4">Add your first news topic to start tracking articles</p>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Add News Topic
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage News Topics</h2>
          <Badge variant="outline">
            {topics.length} topic{topics.length !== 1 ? 's' : ''} configured
          </Badge>
        </div>

        <div className="grid gap-4">
          {topics.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.topic}</CardTitle>
                    <CardDescription className="mt-1">{item.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTopicToDelete(item)}
                    className="text-destructive hover:text-destructive"
                    disabled={deletingTopic}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created on {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Template className="h-4 w-4" />
                      Template: {item.templateUsed}
                    </div>
                    {item.folderId && (
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Folder: {getFolderPath(item.folderId, folders).join(' / ')}
                      </div>
                    )}
                  </div>

                  {item.filters.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Active Filters:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.filters.map((filter) => (
                          <Badge key={filter} variant="secondary" className="text-xs">
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          className="flex items-center gap-2 border-primary"
          disabled={creatingTopic || deletingTopic}
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? 'Cancel' : 'Add News Topic'}
        </Button>
      </div>

      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New News Topic</CardTitle>
            <CardDescription>Configure a new topic to track news articles. You can use a template or create your own configuration.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddTopicForm onAdd={handleAddTopic} templates={templates} onAddTemplate={handleAddTemplate} folders={folders} getFolderPath={getFolderPath} />
          </CardContent>
        </Card>
      ) : (
        renderTopicList()
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={topicToDelete !== null}
        onClose={() => setTopicToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Topic"
        confirmationText={`Are you sure you want to delete the topic "${topicToDelete?.topic}"? This action cannot be undone.`}
        confirming={deletingTopic}
        askForTextInput={false}
        showSemiTransparentBg={true}
      />
    </div>
  );
}
