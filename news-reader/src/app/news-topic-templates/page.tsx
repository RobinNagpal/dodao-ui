'use client';

import TemplateManager from '@/components/template-manager';
import { NewsTopicTemplateType } from '@/lib/news-reader-types';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default function TemplatesPage(): React.ReactNode {
  const baseUrl: string = getBaseUrl();

  // Use useFetchData hook to fetch templates from the server
  const {
    data: templates,
    loading: isLoading,
    error: fetchError,
    reFetchData: fetchTemplates,
  } = useFetchData<NewsTopicTemplateType[]>(`${baseUrl}/api/news-topic-templates`, {}, 'Failed to load templates. Please try again later.');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="container mx-auto px-4 py-4"></div>

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

        {(!isLoading && !fetchError && templates && <TemplateManager templates={templates} fetchTemplates={fetchTemplates} />) || null}

        {/* Templates content */}
      </div>
    </div>
  );
}
