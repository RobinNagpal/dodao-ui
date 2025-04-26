'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface EvaluateIndustryAreasActionsProps {
  reportId: string;
  areaIndex?: number;
  areaTitle?: string;
  subSection?: string;
}

export default function EvaluateIndustryAreasActions({ reportId, areaIndex, areaTitle, subSection }: EvaluateIndustryAreasActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

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
    { key: 'debug', label: `Debug ${sectionName}` },
  ];

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);

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

      const response = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}/regenerate-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error('Failed to regenerate section');
      }
    } catch (error) {
      console.error('Error regenerating section:', error);
    } finally {
      setIsRegenerating(false);
      setShowRegenerateModal(false);
    }
  };

  const getEditPath = () => {
    let path = `/industry-tariff-report/${reportId}/edit/evaluate-industry-areas`;

    if (areaIndex !== undefined) {
      path += `/${areaIndex}`;

      if (subSection) {
        path += `/${subSection}`;
      }
    }

    return path;
  };

  const getDebugPath = () => {
    let path = `/industry-tariff-report/${reportId}/debug/evaluate-industry-areas`;

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
          } else if (key === 'debug') {
            router.push(getDebugPath());
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
