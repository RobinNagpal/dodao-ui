'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface CountrySpecificImportActionsProps {
  reportId: string;
  importIndex: number;
  countryName: string;
}

export default function CountrySpecificImportActions({ reportId, importIndex, countryName }: CountrySpecificImportActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate ${countryName} Import` },
    { key: 'edit', label: `Edit ${countryName} Import` },
    { key: 'debug', label: `Debug ${countryName} Import` },
    { key: 'delete', label: `Delete ${countryName} Import` },
  ];

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const response = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/generate-introduction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: reportId,
          date: new Date().toISOString().split('T')[0],
          subSection: 'countrySpecificImports',
          index: importIndex,
          countryName: countryName,
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
            router.push(`/industry-tariff-report/${reportId}/edit/introduction/country-specific-imports/${importIndex}`);
          } else if (key === 'debug') {
            router.push(`/industry-tariff-report/${reportId}/debug/introduction/country-specific-imports/${importIndex}`);
          } else if (key === 'delete') {
            // Handle delete action
            // This would need another confirmation modal
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={handleRegenerate}
          title={`Regenerate ${countryName} Import`}
          confirmationText={`Are you sure you want to regenerate the ${countryName} import information? This will replace the current content.`}
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
    </>
  );
}
