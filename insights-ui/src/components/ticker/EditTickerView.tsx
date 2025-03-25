'use client';

import { GicsSector, SectorsData } from '@/types/public-equity/gicsSector';
import { TickerCreateRequest } from '@/types/public-equity/ticker-request-response';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';

import { useState } from 'react';
import PrivateWrapper from '../auth/PrivateWrapper';

interface EditTickerViewProps {
  gicsData: SectorsData;
  ticker?: Ticker;
}

export default function EditTickerView({ gicsData, ticker }: EditTickerViewProps) {
  const sectors: GicsSector[] = Object.values(gicsData);

  const [tickerKey, setTickerKey] = useState(ticker?.tickerKey || '');

  const initialSector = sectors.find((s) => s.id === ticker?.sectorId) || sectors[0];
  console.log('initialSector', initialSector);
  console.log('sectors', sectors);

  const [tickerForm, setTickerForm] = useState<TickerCreateRequest>({
    tickerKey: ticker?.tickerKey || '',
    sectorId: ticker?.sectorId || initialSector.id,
    industryGroupId: ticker?.industryGroupId || Object.values(initialSector.industryGroups)[0].id,
    companyName: ticker?.companyName || '',
    shortDescription: ticker?.shortDescription || '',
  });

  const [selectedSector, setSelectedSector] = useState<GicsSector>(initialSector);

  const { postData, loading: createLoading } = usePostData<Ticker, TickerCreateRequest>({
    successMessage: 'Ticker saved successfully!',
    errorMessage: 'Failed to save ticker. Please try again.',
    redirectPath: `/public-equities/tickers`,
  });

  const { putData, loading: updateLoading } = usePutData<Ticker, TickerCreateRequest>({
    successMessage: 'Ticker updated successfully!',
    errorMessage: 'Failed to update ticker. Please try again.',
    redirectPath: `/public-equities/tickers`,
  });

  const handleSave = async () => {
    if (ticker) {
      await putData(`${getBaseUrl()}/api/tickers/${tickerKey}`, {
        tickerKey: tickerForm.tickerKey,
        sectorId: tickerForm.sectorId,
        industryGroupId: tickerForm.industryGroupId,
        companyName: tickerForm.companyName,
        shortDescription: tickerForm.shortDescription,
      });
    } else {
      await postData(`${getBaseUrl()}/api/tickers`, {
        tickerKey: tickerForm.tickerKey,
        sectorId: tickerForm.sectorId,
        industryGroupId: tickerForm.industryGroupId,
        companyName: tickerForm.companyName,
        shortDescription: tickerForm.shortDescription,
      });
    }
  };

  return (
    <Block title={ticker ? 'Edit Ticker' : 'Create Ticker'} className="font-semibold text-color">
      <Input
        modelValue={tickerForm.tickerKey}
        placeholder="Enter Ticker Key"
        maxLength={10}
        className="text-color"
        onUpdate={(e) => setTickerForm({ ...tickerForm, tickerKey: e as string })}
      >
        Ticker *
      </Input>

      <Input
        modelValue={tickerForm.companyName}
        placeholder="Enter Company Name"
        className="text-color"
        onUpdate={(e) => setTickerForm({ ...tickerForm, companyName: e as string })}
      >
        Company Name
      </Input>

      <Input
        modelValue={tickerForm.shortDescription}
        placeholder="Enter Short Description"
        className="text-color"
        onUpdate={(e) => setTickerForm({ ...tickerForm, shortDescription: e as string })}
      >
        Short Description
      </Input>

      <StyledSelect
        label="Sector"
        selectedItemId={selectedSector.id.toString()}
        items={sectors.map((sector) => ({ id: sector.id.toString(), label: sector.name }))}
        setSelectedItemId={(value) => {
          const selected = sectors.find((s) => s.id === parseInt(value || '0'))!;
          setSelectedSector(selected);
          setTickerForm({ ...tickerForm, sectorId: selected.id, industryGroupId: Object.values(selected?.industryGroups)[0].id });
        }}
      />

      <StyledSelect
        label="Industry Group"
        selectedItemId={tickerForm.industryGroupId.toString()}
        items={Object.values(selectedSector.industryGroups).map((ig) => ({
          id: ig.id.toString(),
          label: ig.name,
        }))}
        setSelectedItemId={(value) => {
          setTickerForm({ ...tickerForm, industryGroupId: parseInt(value || '0') });
        }}
      />
      {/* ✅ Save Button */}
      <PrivateWrapper>
        <div className="flex justify-center items-center mt-6">
          <Button
            onClick={handleSave}
            className="block"
            variant="contained"
            primary
            loading={createLoading || updateLoading}
            disabled={createLoading || updateLoading}
          >
            {createLoading || updateLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </PrivateWrapper>
    </Block>
  );
}
