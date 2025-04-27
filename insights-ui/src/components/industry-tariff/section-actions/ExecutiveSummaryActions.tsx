'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface ExecutiveSummaryActionsProps {
  reportId: string;
}

export default function ExecutiveSummaryActions({ reportId }: ExecutiveSummaryActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: 'Regenerate Summary' },
    { key: 'edit', label: 'Edit Summary' },
    { key: 'debug', label: 'Debug Summary' },
  ];

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const response = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}/generate-executive-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
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
            router.push(`/industry-tariff-report/${reportId}/edit/executive-summary`);
          } else if (key === 'debug') {
            router.push(`/industry-tariff-report/${reportId}/debug/executive-summary`);
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={handleRegenerate}
          title="Regenerate Executive Summary"
          confirmationText="Are you sure you want to regenerate the executive summary? This will replace the current content."
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
    </>
  );
}
