'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface UnderstandIndustryActionsProps {
  reportId: string;
  sectionIndex?: number;
  sectionTitle?: string;
}

export default function UnderstandIndustryActions({ reportId, sectionIndex, sectionTitle }: UnderstandIndustryActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const sectionName = sectionTitle || 'Industry Understanding';

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
          sectionIndex !== undefined
            ? {
                section: 'understandIndustry',
                subSection: 'sections',
                index: sectionIndex,
              }
            : {
                section: 'understandIndustry',
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
            if (sectionIndex !== undefined) {
              router.push(`/industry-tariff-report/${reportId}/edit/understand-industry/sections/${sectionIndex}`);
            } else {
              router.push(`/industry-tariff-report/${reportId}/edit/understand-industry`);
            }
          } else if (key === 'debug') {
            if (sectionIndex !== undefined) {
              router.push(`/industry-tariff-report/${reportId}/debug/understand-industry/sections/${sectionIndex}`);
            } else {
              router.push(`/industry-tariff-report/${reportId}/debug/understand-industry`);
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
