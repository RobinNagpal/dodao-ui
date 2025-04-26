'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface IndustryAreasActionsProps {
  reportId: string;
  areaIndex?: number;
  areaTitle?: string;
}

export default function IndustryAreasActions({ reportId, areaIndex, areaTitle }: IndustryAreasActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const sectionName = areaTitle || 'Industry Areas';

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate ${sectionName}` },
    { key: 'edit', label: `Edit ${sectionName}` },
    { key: 'debug', label: `Debug ${sectionName}` },
  ];

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const response = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}/regenerate-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          areaIndex !== undefined
            ? {
                section: 'industryAreas',
                index: areaIndex,
              }
            : {
                section: 'industryAreas',
              }
        ),
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

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'regenerate') {
            setShowRegenerateModal(true);
          } else if (key === 'edit') {
            if (areaIndex !== undefined) {
              router.push(`/industry-tariff-report/${reportId}/edit/industry-areas/${areaIndex}`);
            } else {
              router.push(`/industry-tariff-report/${reportId}/edit/industry-areas`);
            }
          } else if (key === 'debug') {
            if (areaIndex !== undefined) {
              router.push(`/industry-tariff-report/${reportId}/debug/industry-areas/${areaIndex}`);
            } else {
              router.push(`/industry-tariff-report/${reportId}/debug/industry-areas`);
            }
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
