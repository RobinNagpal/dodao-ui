'use client';

import { NewsTopicTemplateType } from '@/lib/news-reader-types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TemplateManager from '@/components/template-manager';
import Link from 'next/link';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';

export default function TemplatesPage(): React.ReactNode {
  const baseUrl: string = getBaseUrl();

  // Use useFetchData hook to fetch templates from the server
  const {
    data: templates,
    loading: isLoading,
    error: fetchError,
  } = useFetchData<NewsTopicTemplateType[]>(`${baseUrl}/api/news-topic-templates`, {}, 'Failed to load templates. Please try again later.');

  // Add a new template
  const addTemplate = async (newTemplate: Partial<NewsTopicTemplateType>): Promise<void> => {
    try {
      const response: Response = await fetch(`${baseUrl}/api/news-topic-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTemplate,
          isDefault: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      // Refetch templates after adding a new one
      // refetchTemplates();
    } catch (error: unknown) {
      console.error('Error adding template:', error);
    }
  };

  // Delete a template by ID
  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      const response: Response = await fetch(`${baseUrl}/api/news-topic-templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Refetch templates after deleting one
      // refetchTemplates();
    } catch (error: unknown) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2" type="button">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Templates</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <FullPageLoader />
          </div>
        )}

        {/* Error state */}
        {fetchError && (
          <div className="flex justify-center items-center h-40">
            <div className="text-red-500">{fetchError}</div>
          </div>
        )}

        {/* Templates content */}
        {(!isLoading && !fetchError && templates && <TemplateManager templates={templates} onAdd={addTemplate} onDelete={deleteTemplate} />) || null}
      </div>
    </div>
  );
}
