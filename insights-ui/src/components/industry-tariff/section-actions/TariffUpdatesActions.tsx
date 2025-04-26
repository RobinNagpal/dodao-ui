'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface TariffUpdatesActionsProps {
  reportId: string;
  tariffIndex?: number;
  countryName?: string;
}

export default function TariffUpdatesActions({ reportId, tariffIndex, countryName }: TariffUpdatesActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const sectionName = countryName ? `${countryName} Tariffs` : 'Tariff Updates';

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
          tariffIndex !== undefined
            ? {
                section: 'tariffUpdates',
                subSection: 'countrySpecificTariffs',
                index: tariffIndex,
              }
            : {
                section: 'tariffUpdates',
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
            if (tariffIndex !== undefined) {
              router.push(`/industry-tariff-report/${reportId}/edit/tariff-updates/country-specific-tariffs/${tariffIndex}`);
            } else {
              router.push(`/industry-tariff-report/${reportId}/edit/tariff-updates`);
            }
          } else if (key === 'debug') {
            if (tariffIndex !== undefined) {
              router.push(`/industry-tariff-report/${reportId}/debug/tariff-updates/country-specific-tariffs/${tariffIndex}`);
            } else {
              router.push(`/industry-tariff-report/${reportId}/debug/tariff-updates`);
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
