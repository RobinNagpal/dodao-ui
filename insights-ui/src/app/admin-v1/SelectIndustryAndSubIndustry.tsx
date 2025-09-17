import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import React, { useEffect } from 'react';

export interface SelectIndustryAndSubIndustryProps {
  selectedIndustry?: TickerV1Industry | null;
  selectedSubIndustry?: TickerV1SubIndustry | null;
  setSelectedIndustry: (industry: TickerV1Industry | null) => any;
  setSelectedSubIndustry: (subIndustry: TickerV1SubIndustry | null) => any;
}

function SubIndustriesDropDown(props: {
  loadingSubIndustries: boolean;
  selectedItemId: string | undefined;
  items: StyledSelectItem[];
  setSelectedItemId: (id?: string | null) => '' | null | Promise<void>;
}) {
  console.log('SubIndustriesDropDown: ', props);
  if (!props?.items?.length) return null;

  return (
    <>
      {props.loadingSubIndustries ? (
        <div className="flex justify-center items-center h-full">Loading ...</div>
      ) : (
        <StyledSelect
          label="Sub-Industry"
          selectedItemId={props.selectedItemId}
          items={props.items}
          setSelectedItemId={props.setSelectedItemId}
          className="w-full"
        />
      )}
    </>
  );
}

function IndustriesDropdown(props: {
  loadingIndustries: boolean;
  selectedItemId: string | undefined;
  items: StyledSelectItem[];
  setSelectedItemId: (id?: string | null) => '' | null | Promise<void>;
}) {
  console.log('IndustriesDropdown: ', props);

  if (!props?.items?.length) return null;

  return (
    <>
      {props.loadingIndustries ? (
        <div className="flex justify-center items-center h-full">Loading ...</div>
      ) : (
        <StyledSelect
          label="Industry"
          selectedItemId={props.selectedItemId}
          items={props.items}
          setSelectedItemId={props.setSelectedItemId}
          className="w-full"
        />
      )}
    </>
  );
}

export default function SelectIndustryAndSubIndustry({
  selectedIndustry,
  selectedSubIndustry,
  setSelectedIndustry,
  setSelectedSubIndustry,
}: SelectIndustryAndSubIndustryProps) {
  // Fetch industries using useFetchData hook
  const { data: industries, loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to fetch industries');

  // Fetch sub-industries when industry is selected
  const {
    data: subIndustries = [],
    loading: loadingSubIndustries,
    reFetchData: refetchSubIndustries,
  } = useFetchData<TickerV1SubIndustry[]>(
    `${getBaseUrl()}/api/sub-industries?industryKey=${selectedIndustry?.industryKey}`,
    { skipInitialFetch: !selectedIndustry?.industryKey },
    'Failed to fetch sub-industries'
  );

  useEffect(() => {
    if (selectedIndustry) {
      console.log(`Sub-industries for ${selectedIndustry.name} are:`);
      refetchSubIndustries();
    }
  }, [selectedIndustry]);
  // Filter out archived industries and sub-industries
  const activeIndustries = industries?.filter((industry) => !industry.archived) || [];

  const activeSubIndustries = subIndustries.filter((subIndustry) => !subIndustry.archived) || [];

  const selectIndustry = async (industryKey?: string | null) => {
    if (industryKey) {
      const industry = activeIndustries?.find((i) => i.industryKey === industryKey);
      setSelectedIndustry(industry || null);
    } else {
      setSelectedIndustry(null);
    }
  };

  const selectSubIndustry = async (subIndustryKey?: string | null) => {
    if (subIndustryKey) {
      const subIndustry = activeSubIndustries.find((s) => s.subIndustryKey === subIndustryKey);
      setSelectedSubIndustry(subIndustry || null);
    } else {
      setSelectedSubIndustry(null);
    }
  };

  if (loadingIndustries) {
    return <FullPageLoader />;
  }

  const subIndustryDropdownItems = activeSubIndustries.map((subIndustry) => ({
    id: subIndustry.subIndustryKey,
    label: subIndustry.name,
  }));
  const industriesDropdownItems = activeIndustries?.map((industry) => ({
    id: industry.industryKey,
    label: industry.name,
  }));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Industry Selection */}
        <IndustriesDropdown
          loadingIndustries={loadingIndustries}
          selectedItemId={selectedIndustry?.industryKey}
          items={industriesDropdownItems}
          setSelectedItemId={(id) => selectIndustry(id)}
        />
        <SubIndustriesDropDown
          loadingSubIndustries={loadingSubIndustries}
          selectedItemId={selectedSubIndustry?.subIndustryKey}
          items={subIndustryDropdownItems}
          setSelectedItemId={(id) => selectSubIndustry(id)}
        />{' '}
      </div>
      <div className="mt-2 p-2 border border-gray-300 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Filtering by: {selectedIndustry?.name}
          {' → '}
          {selectedSubIndustry?.name}
        </p>
      </div>{' '}
    </div>
  );
}
