'use client';

import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { parseMarkdown } from '@/util/parse-markdown';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EditPageClientProps {
  industryId: string;
  section: string;
  initialContent: string;
}

export default function EditPageClient({ industryId, section, initialContent }: EditPageClientProps) {
  const router = useRouter();
  const [markdownContent, setMarkdownContent] = useState<string>(initialContent);
  const [showPreview, setShowPreview] = useState(false);

  const { postData: saveContent, loading: isSaving } = usePostData<any, any>({
    successMessage: 'Content updated successfully!',
    errorMessage: 'Failed to update the content. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}/${section === 'report-cover' ? '' : section}`,
  });

  const handleSave = async () => {
    await saveContent(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/save-markdown`, {
      section,
      content: markdownContent,
    });
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'executive-summary':
        return 'Executive Summary';
      case 'report-cover':
        return 'Report Cover';
      case 'understand-industry':
        return 'Understand Industry';
      case 'tariff-updates':
        return 'Tariff Updates';
      case 'final-conclusion':
        return 'Final Conclusion';
      default:
        return section.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getRedirectPath = () => {
    if (section === 'report-cover') {
      return `/industry-tariff-report/${industryId}`;
    }
    return `/industry-tariff-report/${industryId}/${section}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Edit {getSectionTitle(section)}</h1>
          <div className="flex gap-3">
            <Button onClick={() => router.push(getRedirectPath())}>Cancel</Button>
            <Button onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Editor' : 'Preview'}</Button>
            <Button primary loading={isSaving} onClick={handleSave} disabled={isSaving}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-[70vh]">
        {showPreview ? (
          <div className="p-6 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="markdown-body text-md prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(markdownContent) }} />
          </div>
        ) : (
          <div className="border rounded-lg bg-white">
            <MarkdownEditor
              label=""
              modelValue={markdownContent}
              placeholder={`Edit ${getSectionTitle(section).toLowerCase()} content...`}
              onUpdate={(value) => setMarkdownContent(value || '')}
              objectId={`edit-${section}`}
              maxHeight="70vh"
              className="border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
} 