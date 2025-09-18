'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import AddTickersForm from '@/components/public-equitiesv1/AddTickersForm';
import EditTickersForm from '@/components/public-equitiesv1/EditTickersForm';
import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { BasicTickersResponse } from '@/types/ticker-typesv1';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import * as Tooltip from '@radix-ui/react-tooltip';
import React, { useEffect, useState } from 'react';
import SelectIndustryAndSubIndustry from '../SelectIndustryAndSubIndustry';

export default function TickerManagementPage() {
  const [showAddTickerForm, setShowAddTickerForm] = useState<boolean>(false);
  const [showEditTickerForm, setShowEditTickerForm] = useState<boolean>(false);

  const [selectedIndustry, setSelectedIndustry] = useState<TickerV1Industry | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<TickerV1SubIndustry | null>(null);

  const {
    data: tickerInfos,
    reFetchData: reFetchTickersForSubIndustry,
    loading: loadingTickers,
  } = useFetchData<BasicTickersResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/industry/${selectedIndustry?.industryKey}/${selectedSubIndustry?.subIndustryKey}?basicOnly=true`,
    { skipInitialFetch: true, cache: 'no-cache' },
    `Failed to fetch tickers`
  );

  const selectIndustry = async (industry: TickerV1Industry | null) => {
    setSelectedIndustry(industry);
    setSelectedSubIndustry(null);
  };

  const selectSubIndustry = async (subIndustry: TickerV1SubIndustry | null) => {
    console.log('selectSubIndustry', subIndustry);
    setSelectedSubIndustry(subIndustry);
  };

  useEffect(() => {
    if (selectedIndustry?.industryKey && selectedSubIndustry?.subIndustryKey) {
      reFetchTickersForSubIndustry();
    }
  }, [selectedIndustry?.industryKey, selectedSubIndustry?.subIndustryKey]);

  return (
    <PageWrapper>
      <AdminNav />
      <SelectIndustryAndSubIndustry
        selectedIndustry={selectedIndustry}
        selectedSubIndustry={selectedSubIndustry}
        setSelectedIndustry={selectIndustry}
        setSelectedSubIndustry={selectSubIndustry}
      />

      <div className="space-y-2">
        {!selectedIndustry || !selectedSubIndustry ? (
          <div className="text-center py-3 text-amber-600 dark:text-amber-400">
            <p>Please select both an Industry and a Sub-Industry to view available tickers.</p>
            {selectedIndustry && !selectedSubIndustry && <p className="mt-1 text-xs">{"You've selected an Industry. Now please select a Sub-Industry."}</p>}
            {!selectedIndustry && selectedSubIndustry && <p className="mt-1 text-xs">{"You've selected a Sub-Industry. Now please select an Industry."}</p>}
          </div>
        ) : (
          <div className="pt-4 flex justify-between items-center">
            <div></div>
            <div className="flex gap-2">
              <Button variant="outlined" disabled={!tickerInfos?.tickers?.length} onClick={() => setShowEditTickerForm(true)}>
                Edit Tickers
              </Button>
              <Button variant="contained" primary onClick={() => setShowAddTickerForm(true)}>
                Add New Ticker
              </Button>
            </div>
          </div>
        )}

        {showAddTickerForm && selectedIndustry?.industryKey && selectedSubIndustry?.subIndustryKey && (
          <AddTickersForm
            onSuccess={async (): Promise<void> => {
              setShowAddTickerForm(false);
              await reFetchTickersForSubIndustry();
            }}
            onCancel={(): void => setShowAddTickerForm(false)}
            selectedIndustryKey={selectedIndustry.industryKey}
            selectedSubIndustryKey={selectedSubIndustry.subIndustryKey}
          />
        )}

        {/* Edit Tickers Form */}
        {selectedIndustry && selectedSubIndustry && showEditTickerForm && (
          <EditTickersForm
            onSuccess={async (): Promise<void> => {
              setShowEditTickerForm(false);
              await reFetchTickersForSubIndustry();
            }}
            onCancel={(): void => setShowEditTickerForm(false)}
            tickers={tickerInfos?.tickers || []}
            selectedIndustryKey={selectedIndustry.industryKey}
            selectedSubIndustryKey={selectedSubIndustry.subIndustryKey}
          />
        )}
        {loadingTickers && <FullPageLoader />}
        {selectedIndustry && selectedSubIndustry && !loadingTickers && (
          <Block title="Selected Tickers" className="dark:bg-gray-800">
            <Tooltip.Provider delayDuration={300}>
              <SubIndustryCard
                subIndustry={selectedSubIndustry.subIndustryKey}
                subIndustryName={selectedSubIndustry?.name}
                tickers={tickerInfos?.tickers || []}
                total={tickerInfos?.tickers?.length || 0}
              />
            </Tooltip.Provider>
          </Block>
        )}
      </div>
    </PageWrapper>
  );
}
