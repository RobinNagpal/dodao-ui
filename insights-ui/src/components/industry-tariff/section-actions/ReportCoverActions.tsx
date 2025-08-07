'use client';

import { ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface ReportCoverActionsProps {
  industryId: string;
}

export default function ReportCoverActions({ industryId }: ReportCoverActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showGenerateSeoModal, setShowGenerateSeoModal] = useState(false);
  const [showGenerateExecutiveSummaryModal, setShowGenerateExecutiveSummaryModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'generate-all', label: 'Generate All Sections of Report' },
    { key: 'regenerate', label: 'Regenerate Cover' },
    { key: 'generate-executive-summary', label: 'Regenerate Summary' },
    { key: 'edit', label: 'Edit Cover' },
    { key: 'generate-seo', label: 'Generate SEO for Cover' },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: 'Report cover regenerated successfully!',
    errorMessage: 'Failed to regenerate report cover. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}`,
  });

  const { postData: generateSeo, loading: isGeneratingSeo } = usePostData<any, any>({
    successMessage: 'SEO for report cover generated successfully!',
    errorMessage: 'Failed to generate SEO for report cover. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}`,
  });

  const { postData: generateExecutiveSummary, loading: isGeneratingExecutiveSummary } = usePostData<any, any>({
    successMessage: 'Executive summary generated successfully!',
    errorMessage: 'Failed to generate executive summary. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}`,
  });

  const handleRegenerate = async () => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-report-cover`, {});
    router.refresh();
    setShowRegenerateModal(false);
  };

  const handleGenerateSeo = async () => {
    // Send data as JSON body
    const request = {
      section: ReportType.REPORT_COVER,
    };
    await generateSeo(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-seo-info`, request);
    router.refresh();
    setShowGenerateSeoModal(false);
  };

  const handleGenerateExecutiveSummary = async () => {
    await generateExecutiveSummary(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-executive-summary`, {});
    router.refresh();
    setShowGenerateExecutiveSummaryModal(false);
  };

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'regenerate') {
            setShowRegenerateModal(true);
          } else if (key === 'edit') {
            router.push(`/industry-tariff-report/${industryId}/edit/report-cover`);
          } else if (key === 'generate-seo') {
            setShowGenerateSeoModal(true);
          } else if (key === 'generate-executive-summary') {
            setShowGenerateExecutiveSummaryModal(true);
          } else if (key === 'generate-all') {
            router.push(`/industry-tariff-report/${industryId}/generate-all`);
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={handleRegenerate}
          title="Regenerate Report Cover"
          confirmationText="Are you sure you want to regenerate the report cover? This will replace the current content."
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
      {showGenerateSeoModal && (
        <ConfirmationModal
          open={showGenerateSeoModal}
          onClose={() => setShowGenerateSeoModal(false)}
          onConfirm={handleGenerateSeo}
          title="Generate SEO for Report Cover"
          confirmationText="Are you sure you want to generate SEO metadata for the report cover?"
          confirming={isGeneratingSeo}
          askForTextInput={false}
        />
      )}
      {showGenerateExecutiveSummaryModal && (
        <ConfirmationModal
          open={showGenerateExecutiveSummaryModal}
          onClose={() => setShowGenerateExecutiveSummaryModal(false)}
          onConfirm={handleGenerateExecutiveSummary}
          title="Generate Executive Summary"
          confirmationText="Are you sure you want to generate the executive summary? This process may take a few minutes."
          confirming={isGeneratingExecutiveSummary}
          askForTextInput={false}
        />
      )}
    </>
  );
}
