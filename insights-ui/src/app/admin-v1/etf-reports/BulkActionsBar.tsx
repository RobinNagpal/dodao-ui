'use client';

import { EtfReportRow } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { revalidateEtfCache } from '@/utils/cache-actions';
import { EtfGenerationRequestPayload } from '@/app/api/[spaceId]/etfs-v1/generation-requests/route';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

type FetchResponse = { success: boolean; etfUrl: string; errors: unknown[] };
type TriggerMorResponse = { success: boolean; message: string; url: string; kind: 'quote' | 'risk' | 'people' | 'portfolio' };

export interface BulkActionsBarProps {
  selectedEtfs: EtfReportRow[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export default function BulkActionsBar({ selectedEtfs, onClearSelection, onRefresh }: BulkActionsBarProps): JSX.Element {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const { postData: fetchFinancialInfo, loading: fetchingFinancialInfo } = usePostData<FetchResponse, unknown>({
    successMessage: 'Fetched financial info successfully!',
    errorMessage: 'Failed to fetch financial info',
  });

  const { postData: triggerMorScrape, loading: triggeringMor } = usePostData<TriggerMorResponse, { kind: 'quote' | 'risk' | 'people' | 'portfolio' }>({
    successMessage: 'Request accepted. Processing in background.',
    errorMessage: 'Failed to queue Morningstar scrape',
  });

  const { postData: createGenerationRequests, loading: creatingGenRequests } = usePostData<unknown, EtfGenerationRequestPayload[]>({
    successMessage: 'Analysis generation requests created!',
    errorMessage: 'Failed to create generation requests',
  });

  const isBusy = fetchingFinancialInfo || triggeringMor || creatingGenRequests || progress !== null;

  async function handleGenerateAnalysis() {
    const payloads: EtfGenerationRequestPayload[] = selectedEtfs.map((etf) => ({
      etf: { symbol: etf.symbol, exchange: etf.exchange },
      regeneratePerformanceAndReturns: true,
      regenerateCostEfficiencyAndTeam: true,
      regenerateRiskAnalysis: true,
    }));
    await createGenerationRequests(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, payloads);
    onRefresh();
  }

  async function runBulk(action: 'financial' | 'morAnalyzer' | 'morRisk' | 'morPeople' | 'morPortfolio' | 'flushCache') {
    const total = selectedEtfs.length;
    setProgress({ done: 0, total });

    for (let i = 0; i < total; i++) {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const etf = selectedEtfs[i];
      const base = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}`;

      if (action === 'financial') {
        await fetchFinancialInfo(`${base}/fetch-financial-info`, {});
      } else if (action === 'morAnalyzer') {
        await triggerMorScrape(`${base}/fetch-mor-info`, { kind: 'quote' });
      } else if (action === 'morRisk') {
        await triggerMorScrape(`${base}/fetch-mor-info`, { kind: 'risk' });
      } else if (action === 'morPeople') {
        await triggerMorScrape(`${base}/fetch-mor-info`, { kind: 'people' });
      } else if (action === 'morPortfolio') {
        await triggerMorScrape(`${base}/fetch-mor-info`, { kind: 'portfolio' });
      } else if (action === 'flushCache') {
        await revalidateEtfCache(etf.symbol, etf.exchange);
      }

      setProgress({ done: i + 1, total });
    }

    setProgress(null);
    onRefresh();
  }

  const buttonClass =
    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-700 text-gray-200 hover:bg-gray-600';

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-indigo-900/40 border-b border-indigo-700/50">
      <span className="text-sm font-medium text-indigo-200">{selectedEtfs.length} selected</span>

      <div className="h-4 w-px bg-indigo-700/60" />

      <button className={`${buttonClass} !bg-indigo-700 !text-indigo-100 hover:!bg-indigo-600`} disabled={isBusy} onClick={handleGenerateAnalysis}>
        Generate Analysis
      </button>

      <div className="h-4 w-px bg-indigo-700/60" />

      <button className={buttonClass} disabled={isBusy} onClick={() => runBulk('financial')}>
        Financial Info
      </button>
      <button className={buttonClass} disabled={isBusy} onClick={() => runBulk('morAnalyzer')}>
        Mor Analyzer
      </button>
      <button className={buttonClass} disabled={isBusy} onClick={() => runBulk('morRisk')}>
        Mor Risk
      </button>
      <button className={buttonClass} disabled={isBusy} onClick={() => runBulk('morPeople')}>
        Mor People
      </button>
      <button className={buttonClass} disabled={isBusy} onClick={() => runBulk('morPortfolio')}>
        Mor Portfolio
      </button>
      <button className={buttonClass} disabled={isBusy} onClick={() => runBulk('flushCache')}>
        Flush Cache
      </button>

      {progress && (
        <span className="text-xs text-indigo-300 ml-2">
          {progress.done}/{progress.total} done…
        </span>
      )}

      <div className="ml-auto">
        <button className="text-xs text-gray-400 hover:text-gray-200 transition-colors" disabled={isBusy} onClick={onClearSelection}>
          Clear selection
        </button>
      </div>
    </div>
  );
}
