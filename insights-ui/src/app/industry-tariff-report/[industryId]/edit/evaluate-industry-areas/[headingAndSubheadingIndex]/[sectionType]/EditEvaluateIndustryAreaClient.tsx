'use client';

import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { parseMarkdown } from '@/util/parse-markdown';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EditEvaluateIndustryAreaClientProps {
  industryId: string;
  headingAndSubheadingIndex: string;
  sectionType: string;
  initialContent: string;
}

export default function EditEvaluateIndustryAreaClient({
  industryId,
  headingAndSubheadingIndex,
  sectionType,
  initialContent,
}: EditEvaluateIndustryAreaClientProps) {
  const router = useRouter();
  const [markdownContent, setMarkdownContent] = useState<string>(initialContent);
  const [showPreview, setShowPreview] = useState(false);

  const { postData: saveContent, loading: isSaving } = usePostData<any, any>({
    successMessage: 'Content updated successfully!',
    errorMessage: 'Failed to update the content. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingAndSubheadingIndex}`,
  });

  const handleSave = async () => {
    await saveContent(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/save-markdown`, {
      section: 'evaluate-industry-areas',
      headingAndSubheadingIndex,
      sectionType,
      content: markdownContent,
    });
  };

  const getSectionTitle = (sectionType: string) => {
    switch (sectionType) {
      case 'all':
        return 'Entire Industry Area';
      case 'about':
        return 'About Section';
      case 'established-players':
        return 'Established Players';
      case 'new-challengers':
        return 'New Challengers';
      case 'headwinds-and-tailwinds':
        return 'Headwinds & Tailwinds';
      case 'tariff-impact-by-company-type':
        return 'Tariff Impact by Company Type';
      case 'tariff-impact-summary':
        return 'Tariff Impact Summary';
      default:
        if (sectionType.startsWith('established-player-')) {
          const ticker = sectionType.replace('established-player-', '');
          return `Established Player: ${ticker}`;
        } else if (sectionType.startsWith('new-challenger-')) {
          const ticker = sectionType.replace('new-challenger-', '');
          return `New Challenger: ${ticker}`;
        }
        return sectionType.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getRedirectPath = () => {
    return `/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingAndSubheadingIndex}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Edit {getSectionTitle(sectionType)}</h1>
            <p className="text-gray-600 mt-2">Industry Area: {headingAndSubheadingIndex}</p>
          </div>
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
              placeholder={`Edit ${getSectionTitle(sectionType).toLowerCase()} content...`}
              onUpdate={(value) => setMarkdownContent(value || '')}
              objectId={`edit-evaluate-industry-area-${headingAndSubheadingIndex}-${sectionType}`}
              maxHeight="70vh"
              className="border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
