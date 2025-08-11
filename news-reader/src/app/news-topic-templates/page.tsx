'use client';

import TemplateManager from '@/components/template-manager';
import { useNewsData } from '@/providers/NewsDataProvider';

export default function TemplatesPage() {
  const { templates } = useNewsData();

  // Function to refresh templates (this would be a no-op since we're using the context)
  const fetchTemplates = () => {
    // In a real app, this would fetch templates from the server
    console.log('Fetching templates...');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <TemplateManager templates={templates} fetchTemplates={fetchTemplates} />
      </div>
    </div>
  );
}
