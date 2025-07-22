'use client';

import { EvaluateIndustryContent, ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface EvaluateIndustryAreasActionsProps {
  industryId: string;
  sectionName: string;
  headingIndex: number;
  subHeadingIndex: number;
  sectionType?: EvaluateIndustryContent;
  challengerTicker?: string;
  establishedPlayerTicker?: string;
}

export default function EvaluateIndustryAreasActions({
  industryId,
  sectionName,
  headingIndex,
  subHeadingIndex,
  sectionType = EvaluateIndustryContent.ALL,
  challengerTicker,
  establishedPlayerTicker,
}: EvaluateIndustryAreasActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showGenerateSeoModal, setShowGenerateSeoModal] = useState(false);

  // Only allow editing for section-level, not individual players/challengers or the entire area (ALL)
  const allowEdit =
    sectionType !== EvaluateIndustryContent.ALL &&
    sectionType !== EvaluateIndustryContent.ESTABLISHED_PLAYER &&
    sectionType !== EvaluateIndustryContent.NEW_CHALLENGER;

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate ${sectionName}` },
    ...(allowEdit ? [{ key: 'edit', label: `Edit ${sectionName}` }] : []),
    { key: 'generate-seo', label: `Generate SEO for ${sectionName}` },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `${sectionName} regenerated successfully!`,
    errorMessage: `Failed to regenerate ${sectionName}. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingIndex}-${subHeadingIndex}`,
  });

  const { postData: generateSeo, loading: isGeneratingSeo } = usePostData<any, any>({
    successMessage: `SEO for ${sectionName} generated successfully!`,
    errorMessage: `Failed to generate SEO for ${sectionName}. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingIndex}-${subHeadingIndex}`,
  });

  const handleRegenerate = async () => {
    const request = {
      date: new Date().toISOString().split('T')[0],
      headingIndex,
      subHeadingIndex,
      sectionType,
      challengerTicker,
      establishedPlayerTicker,
    };
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, request);
    router.refresh();
    setShowRegenerateModal(false);
  };

  const handleGenerateSeo = async () => {
    // Send data as JSON body instead of URL parameters
    const request = {
      section: ReportType.EVALUATE_INDUSTRY_AREA,
      headingIndex,
      subHeadingIndex,
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
            const sectionParam =
              sectionType === EvaluateIndustryContent.ALL
                ? 'all'
                : sectionType === EvaluateIndustryContent.ESTABLISHED_PLAYERS
                ? 'established-players'
                : sectionType === EvaluateIndustryContent.NEW_CHALLENGERS
                ? 'new-challengers'
                : sectionType === EvaluateIndustryContent.HEADWINDS_AND_TAILWINDS
                ? 'headwinds-and-tailwinds'
                : sectionType === EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE
                ? 'tariff-impact-by-company-type'
                : sectionType === EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY
                ? 'tariff-impact-summary'
                : sectionType === EvaluateIndustryContent.ESTABLISHED_PLAYER
                ? `established-player-${establishedPlayerTicker}`
                : sectionType === EvaluateIndustryContent.NEW_CHALLENGER
                ? `new-challenger-${challengerTicker}`
                : 'all';
            router.push(`/industry-tariff-report/${industryId}/edit/evaluate-industry-areas/${headingIndex}-${subHeadingIndex}/${sectionParam}`);
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
          title={`Regenerate ${sectionName}`}
          confirmationText={`Are you sure you want to regenerate the ${sectionName.toLowerCase()}? This will replace the current content.`}
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
      {showGenerateSeoModal && (
        <ConfirmationModal
          open={showGenerateSeoModal}
          onClose={() => setShowGenerateSeoModal(false)}
          onConfirm={handleGenerateSeo}
          title={`Generate SEO for ${sectionName}`}
          confirmationText={`Are you sure you want to generate SEO metadata for the ${sectionName.toLowerCase()}?`}
          confirming={isGeneratingSeo}
          askForTextInput={false}
        />
      )}
    </>
  );
}
