'use client';

import { EtfGenerationRequestPayload, EtfIdentifier } from '@/app/api/[spaceId]/etfs-v1/generation-requests/route';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { KoalaGainsSession } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { revalidateEtfCache } from '@/utils/cache-actions';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface EtfActionsProps {
  etf: EtfIdentifier;
  session?: KoalaGainsSession;
}

type GenerateKey =
  | 'generate-all'
  | 'performance-and-returns'
  | 'cost-efficiency-and-team'
  | 'risk-analysis'
  | 'future-performance-outlook'
  | 'key-facts'
  | 'competition'
  | 'final-summary';

const REPORT_OPTIONS: Array<{ key: GenerateKey; label: string }> = [
  { key: 'generate-all', label: 'Generate All Reports' },
  { key: 'performance-and-returns', label: 'Generate Performance & Returns' },
  { key: 'cost-efficiency-and-team', label: 'Generate Cost, Efficiency & Team' },
  { key: 'risk-analysis', label: 'Generate Risk Analysis' },
  { key: 'future-performance-outlook', label: 'Generate Future Outlook' },
  { key: 'key-facts', label: 'Generate Key Facts' },
  { key: 'competition', label: 'Generate Competition' },
  { key: 'final-summary', label: 'Generate Final Summary' },
];

function buildPayload(etf: EtfIdentifier, key: GenerateKey): EtfGenerationRequestPayload {
  const all = key === 'generate-all';
  return {
    etf,
    regeneratePerformanceAndReturns: all || key === 'performance-and-returns',
    regenerateCostEfficiencyAndTeam: all || key === 'cost-efficiency-and-team',
    regenerateRiskAnalysis: all || key === 'risk-analysis',
    regenerateFuturePerformanceOutlook: all || key === 'future-performance-outlook',
    regenerateKeyFacts: all || key === 'key-facts',
    regenerateCompetition: all || key === 'competition',
    regenerateFinalSummary: all || key === 'final-summary',
  };
}

export default function EtfActions({ etf, session }: EtfActionsProps): JSX.Element {
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flushing, setFlushing] = useState(false);

  const { postData: createGenerationRequest, loading: creatingGenRequest } = usePostData<unknown, EtfGenerationRequestPayload[]>({
    successMessage: 'Analysis generation request created!',
    errorMessage: 'Failed to create generation request',
  });

  const dropdownItems: EllipsisDropdownItem[] = [
    { key: 'generate-report', label: 'Generate Report' },
    { key: 'invalidate-cache', label: flushing ? 'Invalidating…' : 'Invalidate Cache', disabled: flushing },
  ];

  const handleDropdownSelect = async (key: string) => {
    if (key === 'generate-report') {
      setIsModalOpen(true);
    } else if (key === 'invalidate-cache') {
      setFlushing(true);
      try {
        const result = await revalidateEtfCache(etf.symbol, etf.exchange);
        showNotification({ type: result.success ? 'success' : 'error', message: result.message });
        router.refresh();
      } finally {
        setFlushing(false);
      }
    }
  };

  const handleModalSelect = async (key: GenerateKey) => {
    setIsModalOpen(false);
    try {
      await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [buildPayload(etf, key)]);
      router.push('/admin-v1/etf-generation-requests');
    } catch (error) {
      console.error('Error generating ETF report:', error);
    }
  };

  return (
    <>
      <PrivateWrapper session={session}>
        <EllipsisDropdown items={dropdownItems} className="px-2 py-2 z-10" onSelect={handleDropdownSelect} />
      </PrivateWrapper>

      <FullPageModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Report">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPORT_OPTIONS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleModalSelect(item.key)}
                disabled={creatingGenRequest}
                className="text-left px-3 py-2 bg-surface hover:bg-surface-2 rounded-md transition-colors duration-200 border border-surface-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-heading">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </FullPageModal>
    </>
  );
}
