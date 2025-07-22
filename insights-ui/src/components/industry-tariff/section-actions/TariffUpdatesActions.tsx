'use client';

import { ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface TariffUpdatesActionsProps {
  industryId: string;
  tariffIndex?: number;
  countryName?: string;
}

export default function TariffUpdatesActions({ industryId, tariffIndex, countryName }: TariffUpdatesActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showGenerateSeoModal, setShowGenerateSeoModal] = useState(false);

  const sectionName = countryName ? `${countryName} Tariffs` : 'Tariff Updates';

  const actions: EllipsisDropdownItem[] = [];

  if (countryName) {
    actions.push({ key: 'regenerate-country', label: `Regenerate ${countryName} Tariffs` });
  } else {
    actions.push({ key: 'regenerate', label: `Regenerate ${sectionName}` });
  }

  // Only allow editing the whole tariff updates section, not individual countries
  if (!countryName) {
    actions.push({ key: 'edit', label: `Edit ${sectionName}` });
  }
  actions.push({ key: 'generate-seo', label: `Generate SEO for ${sectionName}` });

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `${sectionName} regenerated successfully!`,
    errorMessage: `Failed to regenerate ${sectionName}. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/tariff-updates`,
  });

  const { postData: generateSeo, loading: isGeneratingSeo } = usePostData<any, any>({
    successMessage: `SEO for ${sectionName} generated successfully!`,
    errorMessage: `Failed to generate SEO for ${sectionName}. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/tariff-updates`,
  });

  const handleRegenerate = async (isCountrySpecific: boolean = false) => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-tariff-updates`, {
      industry: industryId,
      date: new Date().toISOString().split('T')[0],
      tariffIndex: tariffIndex,
      countryName: isCountrySpecific ? countryName : undefined,
    });
    router.refresh();
    setShowRegenerateModal(false);
  };

  const handleGenerateSeo = async () => {
    // Send data as JSON body
    const request = {
      section: ReportType.TARIFF_UPDATES,
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
          if (key === 'regenerate' || key === 'regenerate-country') {
            setShowRegenerateModal(true);
          } else if (key === 'edit') {
            // Only allow editing the whole tariff updates section
            router.push(`/industry-tariff-report/${industryId}/edit/tariff-updates`);
          } else if (key === 'generate-seo') {
            setShowGenerateSeoModal(true);
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={() => handleRegenerate(actions[0].key === 'regenerate-country')}
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
