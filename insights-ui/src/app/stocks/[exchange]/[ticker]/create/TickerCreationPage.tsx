'use client';

import { TickerV1VsCompetitionWithRelations } from '@/app/api/[spaceId]/tickers-v1/[ticker]/creation-infos/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { UpsertCustomCriteriaRequest } from '@/types/public-equity/ticker-request-response';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1 } from '@prisma/client';

export interface TickerCreationPageProps {
  symbol: string;
  exchange: string;
}

function getCompetitionAnalysis(symbol: string, tickerCompetition: TickerV1VsCompetitionWithRelations) {
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

export default function TickerCreationPage({ symbol, exchange }: TickerCreationPageProps) {
  const { data, loading, error } = useFetchData<TickerV1VsCompetitionWithRelations[]>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${symbol}/creation-infos`,
    { cache: 'no-cache' },
    'Fetching Ticker Creation Info Failed'
  );

  const {
    postData,
    loading: creatingTicker,
    error: savingError,
  } = usePostData<TickerV1, UpsertCustomCriteriaRequest>({
    successMessage: 'Successfully created ticker based on competition',
    errorMessage: 'Failed to create ticker',
  });

  if (loading) {
    return <FullPageLoader />;
  }

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  return (
    <div>
      {data?.map((tickerCompetition) => {
        return (
          <div key={tickerCompetition.tickerId} className="p-4 mb-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">
                {tickerCompetition.ticker.symbol} - {tickerCompetition.ticker.name}
              </h1>
              <Button variant="contained" primary>
                Add Ticker
              </Button>
            </div>
            <p>{tickerCompetition.ticker.summary}</p>
            <div className="font-bold mt-2">
              Industry: {tickerCompetition.ticker.industry.industryKey} - {tickerCompetition.ticker.industry.name}
            </div>
            <p>{tickerCompetition.ticker.industry.summary}</p>
            <div className="font-bold mt-2">
              Sub Industry: {tickerCompetition.ticker.subIndustry.subIndustryKey} - {tickerCompetition.ticker.subIndustry.name}
            </div>
            <p>{tickerCompetition.ticker.subIndustry.summary}</p>
            {getCompetitionAnalysis(symbol, tickerCompetition)}
          </div>
        );
      })}
    </div>
  );
}
