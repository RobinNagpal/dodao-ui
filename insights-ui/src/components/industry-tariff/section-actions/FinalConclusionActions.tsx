'use client';

import { ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface FinalConclusionActionsProps {
  industryId: string;
}

export default function FinalConclusionActions({ industryId }: FinalConclusionActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showGenerateSeoModal, setShowGenerateSeoModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate Final Conclusion` },
    { key: 'edit', label: `Edit Final Conclusion` },
  ];

  actions.push({ key: 'generate-seo', label: `Generate SEO for Final Conclusion` });

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `Final Conclusion regenerated successfully!`,
    errorMessage: `Failed to regenerate Final Conclusion. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/final-conclusion`,
  });

  const { postData: generateSeo, loading: isGeneratingSeo } = usePostData<any, any>({
    successMessage: `SEO for Final Conclusion generated successfully!`,
    errorMessage: `Failed to generate SEO for Final Conclusion. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/final-conclusion`,
  });

  const handleRegenerate = async () => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-final-conclusion`, {
      industry: industryId,
    });
    router.refresh();
    setShowRegenerateModal(false);
  };

  const handleGenerateSeo = async () => {
    // Send data as JSON body
    const request = {
      section: ReportType.FINAL_CONCLUSION,
    };
    await generateSeo(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-seo-info`, request);
    router.refresh();
    setShowGenerateSeoModal(false);
  };

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'regenerate') {
            setShowRegenerateModal(true);
          } else if (key === 'edit') {
            router.push(`/industry-tariff-report/${industryId}/edit/final-conclusion`);
          } else if (key === 'generate-seo') {
            setShowGenerateSeoModal(true);
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={handleRegenerate}
          title={`Regenerate Final Conclusion`}
          confirmationText={`Are you sure you want to regenerate the Final Conclusion? This will replace the current content.`}
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
      {showGenerateSeoModal && (
        <ConfirmationModal
          open={showGenerateSeoModal}
          onClose={() => setShowGenerateSeoModal(false)}
          onConfirm={handleGenerateSeo}
          title={`Generate SEO for Final Conclusion`}
          confirmationText={`Are you sure you want to generate SEO metadata for the Final Conclusion?`}
          confirming={isGeneratingSeo}
          askForTextInput={false}
        />
      )}
    </>
  );
}
