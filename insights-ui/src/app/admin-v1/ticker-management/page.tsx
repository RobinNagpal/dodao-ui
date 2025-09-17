'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import AddTickersForm from '@/components/public-equitiesv1/AddTickersForm';
import EditTickersForm from '@/components/public-equitiesv1/EditTickersForm';
import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { IndustryTickersResponse, SubIndustryTickersResponse } from '@/types/ticker-typesv1';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import React, { useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

export default function TickerManagementPage() {
  const [showAddTickerForm, setShowAddTickerForm] = useState<boolean>(false);
  const [showEditTickerForm, setShowEditTickerForm] = useState<boolean>(false);

  const [selectedIndustryKey, setSelectedIndustryKey] = useState<string>('');
  const [selectedSubIndustryKey, setSelectedSubIndustryKey] = useState<string>('');

  // Fetch industries using useFetchData hook
  const { data: industries, loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to fetch industries');

  const { data: tickerInfos, reFetchData: reFetchTickersForSubIndustry } = useFetchData<SubIndustryTickersResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/industry/${selectedIndustryKey}/${selectedSubIndustryKey}`,
    { skipInitialFetch: true },
    `Failed to fetch tickers`
  );

  // Fetch sub-industries when industry is selected
  const {
    data: subIndustries = [],
    loading: loadingSubIndustries,
    reFetchData: refetchSubIndustries,
  } = useFetchData<TickerV1SubIndustry[]>(
    `${getBaseUrl()}/api/sub-industries?industryKey=${selectedIndustryKey}`,
    { skipInitialFetch: !selectedIndustryKey },
    'Failed to fetch sub-industries'
  );

  // Filter out archived industries and sub-industries
  const activeIndustries = industries?.filter((industry) => !industry.archived);

  const activeSubIndustries = subIndustries.filter((subIndustry) => !subIndustry.archived);

  const selectIndustry = async (industryKey: string) => {
    setSelectedIndustryKey(industryKey);
    setSelectedSubIndustryKey('');
    await refetchSubIndustries();
  };

  const selectSubIndustry = async (subIndustryKey: string) => {
    console.log('selectSubIndustry', subIndustryKey);
    setSelectedSubIndustryKey(subIndustryKey);

    await reFetchTickersForSubIndustry();
  };

  if (loadingIndustries) {
    return <FullPageLoader />;
  }

  const selectedIndustryName = activeIndustries?.find((industry) => industry.industryKey === selectedIndustryKey)?.name;
  const selectedSubIndustryName = activeSubIndustries?.find((subIndustry) => subIndustry.subIndustryKey === selectedSubIndustryKey)?.name;

  return (
    <PageWrapper>
      <AdminNav />
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Industry Selection */}
          {loadingIndustries ? (
            <div className="flex justify-center items-center h-full">Loading ...</div>
          ) : (
            <StyledSelect
              label="Industry"
              showPleaseSelect={true}
              selectedItemId={selectedIndustryKey}
              items={
                activeIndustries?.map((industry) => ({
                  id: industry.industryKey,
                  label: industry.name,
                })) || []
              }
              setSelectedItemId={(id) => id && selectIndustry(id)}
              className="w-full"
            />
          )}

          {/* Sub-Industry Selection */}
          {loadingSubIndustries ? (
            <div className="flex justify-center items-center h-full">Loading ...</div>
          ) : (
            <StyledSelect
              showPleaseSelect={true}
              label="Sub-Industry"
              selectedItemId={selectedSubIndustryKey}
              items={
                activeSubIndustries.map((subIndustry) => ({
                  id: subIndustry.subIndustryKey,
                  label: subIndustry.name,
                })) || []
              }
              setSelectedItemId={(id) => id && selectSubIndustry(id)}
              className="w-full"
            />
          )}
        </div>

        {/* Filter Summary */}
        {(selectedIndustryKey || selectedSubIndustryKey) && (
          <div className="mt-2 p-2 border border-gray-300 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Filtering by: {selectedIndustryName || selectedIndustryKey}
              {' → '}
              {selectedSubIndustryName || selectedSubIndustryKey}
            </p>
          </div>
        )}

        {!selectedIndustryKey || !selectedSubIndustryKey ? (
          <div className="text-center py-3 text-amber-600 dark:text-amber-400">
            <p>Please select both an Industry and a Sub-Industry to view available tickers.</p>
            {selectedIndustryKey && !selectedSubIndustryKey && (
              <p className="mt-1 text-xs">{"You've selected an Industry. Now please select a Sub-Industry."}</p>
            )}
            {!selectedIndustryKey && selectedSubIndustryKey && (
              <p className="mt-1 text-xs">{"You've selected a Sub-Industry. Now please select an Industry."}</p>
            )}
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

        {showAddTickerForm && (
          <AddTickersForm
            onSuccess={async (): Promise<void> => {
              setShowAddTickerForm(false);
              await reFetchTickersForSubIndustry();
            }}
            onCancel={(): void => setShowAddTickerForm(false)}
            initialIndustry={selectedIndustryKey}
            initialSubIndustry={selectedSubIndustryKey}
            industries={activeIndustries || []}
            subIndustries={activeSubIndustries}
          />
        )}

        {/* Edit Tickers Form */}
        {selectedIndustryKey && selectedSubIndustryKey && showEditTickerForm && (
          <EditTickersForm
            onSuccess={async (): Promise<void> => {
              setShowEditTickerForm(false);
              await reFetchTickersForSubIndustry();
            }}
            onCancel={(): void => setShowEditTickerForm(false)}
            tickers={tickerInfos?.tickers || []}
            selectedIndustry={selectedIndustryKey}
            selectedSubIndustry={selectedSubIndustryKey}
            industries={activeIndustries || []}
            subIndustries={activeSubIndustries}
          />
        )}
        <Block title="Selected Tickers" className="dark:bg-gray-800">
          <Tooltip.Provider delayDuration={300}>
            <SubIndustryCard
              key={selectedSubIndustryKey}
              subIndustry={selectedIndustryKey}
              subIndustryName={subIndustries.find((subIndustry) => subIndustry.subIndustryKey === selectedSubIndustryKey)?.name}
              tickers={tickerInfos?.tickers || []}
              total={tickerInfos?.tickers?.length || 0}
            />
          </Tooltip.Provider>
        </Block>
      </div>
    </PageWrapper>
  );
}
