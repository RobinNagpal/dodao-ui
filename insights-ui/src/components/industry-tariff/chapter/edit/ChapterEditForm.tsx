'use client';

import type { UpdateChapterContentRequest } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/content/route';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ReportContentEditor, { type ContentValue } from '@/components/industry-tariff/chapter/edit/ReportContentEditor';
import { Card, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/Heading';
import Stack from '@/components/ui/containers/Stack';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { EDIT_FIELD_LABELS, type EditableReportContent, type EditableReportField } from '@/utils/tariff-reports/chapter-edit-fields';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ChapterEditFormProps {
  chapterSlug: string;
  pageSlug: string;
  pageTitle: string;
  // Page to return to on cancel / after saving.
  backHref: string;
  initialContent: EditableReportContent;
}

export default function ChapterEditForm({ chapterSlug, pageSlug, pageTitle, backHref, initialContent }: ChapterEditFormProps): JSX.Element {
  const router = useRouter();
  const [content, setContent] = useState<EditableReportContent>(initialContent);
  const { putData, loading } = usePutData<IndustryTariffReport, UpdateChapterContentRequest>({
    successMessage: 'Report saved.',
    errorMessage: 'Failed to save the report.',
  });

  const handleSave = async (): Promise<void> => {
    // countryNames is derived from the per-country entries so the two never drift apart, and
    // lastUpdated is re-stamped the same way the generation pipeline does on every write.
    const tariffUpdates = content.tariffUpdates;
    const payload: EditableReportContent = tariffUpdates
      ? {
          ...content,
          tariffUpdates: {
            ...tariffUpdates,
            countryNames: tariffUpdates.countrySpecificTariffs.map((c) => c.countryName),
            lastUpdated: new Date().toISOString(),
          },
        }
      : content;
    const result = await putData(`${getBaseUrl()}/api/industry-tariff-reports/chapters/${chapterSlug}/content`, { page: pageSlug, content: payload });
    if (result) {
      router.push(backHref);
      router.refresh();
    }
  };

  const fields = Object.keys(content) as EditableReportField[];

  return (
    <PrivateWrapper>
      <Stack gap="xl">
        <Stack direction="row" justify="between" align="center" gap="md" wrap>
          <Heading as="h1" size="2xl" weight="bold" tone="white">
            Edit: {pageTitle}
          </Heading>
          <Stack direction="row" gap="sm">
            <Button variant="outlined" disabled={loading} onClick={() => router.push(backHref)}>
              Cancel
            </Button>
            <Button variant="contained" primary loading={loading} disabled={loading} onClick={handleSave}>
              Save
            </Button>
          </Stack>
        </Stack>
        {fields.map((field) => (
          <Card key={field}>
            <CardContent>
              <Stack gap="lg">
                <Heading as="h2" size="xl">
                  {EDIT_FIELD_LABELS[field]}
                </Heading>
                <ReportContentEditor
                  name={field}
                  path={field}
                  value={content[field] as unknown as ContentValue}
                  onChange={(next) => setContent((prev) => ({ ...prev, [field]: next }))}
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PrivateWrapper>
  );
}
