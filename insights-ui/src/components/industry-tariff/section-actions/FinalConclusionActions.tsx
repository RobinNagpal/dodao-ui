'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface FinalConclusionActionsProps {
  reportId: string;
  sectionKey?: string;
}

export default function FinalConclusionActions({ reportId, sectionKey }: FinalConclusionActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const sectionName = sectionKey
    ? sectionKey === 'positiveImpacts'
      ? 'Positive Impacts'
      : sectionKey === 'negativeImpacts'
      ? 'Negative Impacts'
      : 'Final Statements'
    : 'Final Conclusion';

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate ${sectionName}` },
    { key: 'edit', label: `Edit ${sectionName}` },
    { key: 'debug', label: `Debug ${sectionName}` },
  ];

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const response = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/generate-final-conclusion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: reportId,
          sectionKey: sectionKey,
        }),
      });

      if (response.ok) {
        // Refresh the page to show the regenerated content
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
            router.push(
              sectionKey
                ? `/industry-tariff-report/${reportId}/edit/final-conclusion/${sectionKey}`
                : `/industry-tariff-report/${reportId}/edit/final-conclusion`
            );
          } else if (key === 'debug') {
            router.push(
              sectionKey
                ? `/industry-tariff-report/${reportId}/debug/final-conclusion/${sectionKey}`
                : `/industry-tariff-report/${reportId}/debug/final-conclusion`
            );
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
