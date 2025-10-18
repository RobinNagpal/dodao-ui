'use client';

import { NewTickerSubmission, TickerV1VsCompetitionWithRelations } from '@/app/api/[spaceId]/tickers-v1/[ticker]/creation-infos/route';
import TickerFields from '@/components/public-equitiesv1/TickerFields';
import { TickerFieldsValue } from '@/components/public-equitiesv1/types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { isExchangeId, toExchangeId } from '@/utils/exchangeUtils';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1 } from '@prisma/client';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export interface TickerCreationPageProps {
  symbol: string;
  exchange: string;
}

function getCompetitionAnalysis(symbol: string, tickerCompetition: TickerV1VsCompetitionWithRelations): JSX.Element | null {
  const competition = tickerCompetition.competitionAnalysisArray.find((c) => c.companySymbol?.toLowerCase() === symbol.toLowerCase()) || null;

  return (
    competition && (
      <div>
        <div className="font-bold mt-2">
          {competition.companyName} - {competition.companySymbol} ({competition.exchangeName} - {competition.exchangeSymbol})
        </div>
        <div>{competition.detailedComparison}</div>
      </div>
    )
  );
}

export default function TickerCreationPage({ symbol, exchange }: TickerCreationPageProps): JSX.Element {
  const router = useRouter();

  const { data, loading, error } = useFetchData<TickerV1VsCompetitionWithRelations[]>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${symbol}/creation-infos`,
    { cache: 'no-cache' },
    'Fetching Ticker Creation Info Failed'
  );

  // Modal state
  const [open, setOpen] = React.useState<boolean>(false);

  // Which suggestion / card are we creating from?
  const [active, setActive] = React.useState<TickerV1VsCompetitionWithRelations | null>(null);

  // Ticker form state used inside the modal (TickerFieldsValue = { exchange, name, symbol, websiteUrl })
  const [form, setForm] = React.useState<TickerFieldsValue>({
    exchange: toExchangeId(exchange),
    name: '',
    symbol: symbol.toUpperCase(),
    websiteUrl: '',
    stockAnalyzeUrl: '',
  });

  // Post hook to create a ticker (re-using your POST style)
  const {
    postData: createTickersFromCompetition,
    loading: posting,
    error: postError,
  } = usePostData<TickerV1, NewTickerSubmission>({
    successMessage: 'Successfully created ticker',
    errorMessage: 'Failed to create ticker',
  });

  const onOpenFromCard = (tc: TickerV1VsCompetitionWithRelations): void => {
    const tickerToAdd = tc.competitionAnalysisArray.find((c) => c.companySymbol?.toLowerCase() === symbol.toLowerCase()) || null;
    if (!tickerToAdd) return;

    // Seed defaults from the chosen card, fall back to props if needed
    const seededExchange = toExchangeId(tickerToAdd?.exchangeSymbol);
    const seededName = tickerToAdd.companyName ?? '';
    const seededSymbol = tickerToAdd.companySymbol?.toUpperCase() || '';

    setActive(tc);
    setForm({
      exchange: seededExchange,
      name: seededName,
      symbol: seededSymbol,
      websiteUrl: '',
      stockAnalyzeUrl: '',
    });
    setOpen(true);
  };

  const patchForm = (patch: Partial<TickerFieldsValue>): void => {
    setForm((prev: TickerFieldsValue): TickerFieldsValue => {
      const next: TickerFieldsValue = { ...prev, ...patch };
      return next;
    });
  };

  // Simple URL validator for http(s)
  const isValidHttpUrl = (value: string): boolean => {
    try {
      const u = new URL(value.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleCreateTicker = async (): Promise<void> => {
    if (!active) return;

    // Existing basic checks
    if (!form.name.trim() || !form.symbol.trim()) {
      alert('Please provide both Company Name and Symbol.');
      return;
    }
    if (!form.exchange || !isExchangeId(form.exchange)) {
      alert('Please select a valid Exchange.');
      return;
    }

    // NEW: require Website URL
    if (!form.websiteUrl.trim()) {
      alert('Please provide the Company Website URL.');
      return;
    }
    if (!isValidHttpUrl(form.websiteUrl)) {
      alert('Website URL must be a valid http(s) URL.');
      return;
    }

    // NEW: require StockAnalyze URL
    if (!form.stockAnalyzeUrl.trim()) {
      alert('Please provide the StockAnalyze URL.');
      return;
    }
    if (!isValidHttpUrl(form.stockAnalyzeUrl)) {
      alert('StockAnalyze URL must be a valid http(s) URL.');
      return;
    }

    const submission: NewTickerSubmission = {
      name: form.name.trim(),
      symbol: form.symbol.toUpperCase().trim(),
      exchange: form.exchange,
      industryKey: active.ticker.industry.industryKey,
      subIndustryKey: active.ticker.subIndustry.subIndustryKey,
      websiteUrl: form.websiteUrl.trim(),
      stockAnalyzeUrl: form.stockAnalyzeUrl.trim(), // NEW: ensure trimmed
    };

    const resp = await createTickersFromCompetition(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, submission);

    if (resp?.id) {
      setOpen(false);
      router.push(`/admin-v1/generation-requests`);
    }
  };

  if (loading) {
    return <FullPageLoader />;
  }

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return (
    <div>
      {data?.map((tickerCompetition) => {
        const t = tickerCompetition.ticker;
        return (
          <div key={tickerCompetition.tickerId} className="p-4 mb-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">
                {t.symbol} - {t.name}
              </h1>
              <Button variant="contained" primary onClick={(): void => onOpenFromCard(tickerCompetition)}>
                Add Ticker
              </Button>
            </div>

            <p>{t.summary}</p>

            <div className="font-bold mt-2">
              Industry: {t.industry.industryKey} - {t.industry.name}
            </div>
            <p>{t.industry.summary}</p>

            <div className="font-bold mt-2">
              Sub Industry: {t.subIndustry.subIndustryKey} - {t.subIndustry.name}
            </div>
            <p>{t.subIndustry.summary}</p>

            {getCompetitionAnalysis(symbol, tickerCompetition)}
          </div>
        );
      })}

      {/* Full-screen modal with vertical TickerFields and industry metadata */}
      <FullScreenModal open={open} onClose={(): void => setOpen(false)} title="Create Ticker" showCloseButton showTitleBg>
        {active && (
          <div className="mx-auto max-w-4xl px-4 pt-4 text-left">
            {/* Industry & Sub-industry metadata */}
            <div className="mb-4 rounded-md border border-gray-200 dark:border-gray-700 p-3">
              <div className="font-semibold">Industry</div>
              <div className="text-sm">
                <span className="font-mono">{active.ticker.industry.industryKey}</span> — {active.ticker.industry.name}
              </div>
              {active.ticker.industry.summary && <p className="text-sm mt-1">{active.ticker.industry.summary}</p>}
              <div className="mt-3 font-semibold">Sub-Industry</div>
              <div className="text-sm">
                <span className="font-mono">{active.ticker.subIndustry.subIndustryKey}</span> — {active.ticker.subIndustry.name}
              </div>
              {active.ticker.subIndustry.summary && <p className="text-sm mt-1">{active.ticker.subIndustry.summary}</p>}
            </div>

            {/* Ticker fields — vertical layout */}
            <TickerFields value={form} onPatch={patchForm} layout="vertical" />

            {/* Error (if any) */}
            {postError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{postError}</p>
              </div>
            )}

            {/* Action button */}
            <div className="mt-6 flex justify-end">
              <Button variant="contained" primary loading={posting} disabled={posting} onClick={handleCreateTicker}>
                {posting ? 'Adding...' : 'Add Ticker'}
              </Button>
            </div>
          </div>
        )}
      </FullScreenModal>
    </div>
  );
}
