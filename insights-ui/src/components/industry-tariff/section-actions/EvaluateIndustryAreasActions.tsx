'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface EvaluateIndustryAreasActionsProps {
  industrySlug: string;
  areaIndex?: number;
  areaTitle?: string;
  subSection?: string;
}

export default function EvaluateIndustryAreasActions({ industrySlug, areaIndex, areaTitle, subSection }: EvaluateIndustryAreasActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  let sectionName = areaTitle || 'Industry Area Evaluation';

  if (subSection) {
    if (subSection === 'newChallengers') sectionName = 'New Challengers';
    else if (subSection === 'establishedPlayers') sectionName = 'Established Players';
    else if (subSection === 'headwindsAndTailwinds') sectionName = 'Headwinds & Tailwinds';
    else if (subSection === 'positiveTariffImpactOnCompanyType') sectionName = 'Positive Tariff Impact';
    else if (subSection === 'negativeTariffImpactOnCompanyType') sectionName = 'Negative Tariff Impact';
    else if (subSection === 'tariffImpactSummary') sectionName = 'Tariff Impact Summary';
  }

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate ${sectionName}` },
    { key: 'edit', label: `Edit ${sectionName}` },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `${sectionName} regenerated successfully!`,
    errorMessage: `Failed to regenerate ${sectionName}. Please try again.`,
    redirectPath: `/industry-tariff-report/${industrySlug}/evaluate-industry-areas`,
  });

  const handleRegenerate = async () => {
    const payload: any = {};

    if (areaIndex !== undefined) {
      payload.section = 'evaluateIndustryAreas';
      payload.index = areaIndex;

      if (subSection) {
        payload.subSection = subSection;
      }
    } else {
      payload.section = 'evaluateIndustryAreas';
    }

    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industrySlug}/regenerate-section`, payload);
    router.refresh();
    setShowRegenerateModal(false);
  };

  const getEditPath = () => {
    let path = `/industry-tariff-report/${industrySlug}/edit/evaluate-industry-areas`;

    if (areaIndex !== undefined) {
      path += `/${areaIndex}`;

      if (subSection) {
        path += `/${subSection}`;
      }
    }

    return path;
  };

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'regenerate') {
            setShowRegenerateModal(true);
          } else if (key === 'edit') {
            router.push(getEditPath());
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
    </>
  );
}
