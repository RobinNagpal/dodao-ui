'use client';

import { GicsIndustryGroup, GicsSector, SectorsData } from '@/types/public-equity/gicsSector';
import { TickerUpsertRequest } from '@/types/public-equity/ticker';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { Ticker } from '@prisma/client';

import { useEffect, useState } from 'react';

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
  const [selectedSector, setSelectedSector] = useState<GicsSector>(initialSector);
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState<GicsIndustryGroup>(
    Object.values(initialSector.industryGroups).find((ig) => ig.id === ticker?.industryGroupId) || Object.values(initialSector.industryGroups)[0]
  );

  const { postData, loading: createLoading } = usePostData<Ticker, TickerUpsertRequest>({
    successMessage: 'Ticker saved successfully!',
    errorMessage: 'Failed to save ticker. Please try again.',
    redirectPath: `/public-equities/tickers`,
  });

  const { putData, loading: updateLoading } = usePutData<Ticker, TickerUpsertRequest>({
    successMessage: 'Ticker updated successfully!',
    errorMessage: 'Failed to update ticker. Please try again.',
    redirectPath: `/public-equities/tickers`,
  });

  useEffect(() => {
    const industryGroups = Object.values(selectedSector.industryGroups);
    setSelectedIndustryGroup(industryGroups[0]);
  }, [selectedSector]);

  const handleSave = async () => {
    if (ticker) {
      await putData(`/api/tickers/${tickerKey}`, {
        tickerKey,
        sectorId: selectedSector.id,
        industryGroupId: selectedIndustryGroup.id,
      });
    } else {
      await postData(`/api/tickers`, {
        tickerKey,
        sectorId: selectedSector.id,
        industryGroupId: selectedIndustryGroup.id,
      });
    }
  };

  return (
    <Block title="Edit Ticker" className="font-semibold text-color">
      <Input modelValue={tickerKey} placeholder="Enter Ticker Key" maxLength={10} className="text-color" onUpdate={(e) => setTickerKey(e as string)}>
        Ticker *
      </Input>

      <StyledSelect
        label="Sector"
        selectedItemId={selectedSector.id.toString()}
        items={sectors.map((sector) => ({ id: sector.id.toString(), label: sector.name }))}
        setSelectedItemId={(value) => setSelectedSector(sectors.find((s) => s.id === parseInt(value || '0')) || sectors[0])}
      />

      {/* ✅ Industry Group Select (Dynamic based on sector) */}
      <StyledSelect
        label="Industry Group"
        selectedItemId={selectedIndustryGroup.id.toString()}
        items={Object.values(selectedSector.industryGroups).map((ig) => ({
          id: ig.id.toString(),
          label: ig.name,
        }))}
        setSelectedItemId={(value) =>
          setSelectedIndustryGroup(
            Object.values(selectedSector.industryGroups).find((ig) => ig.id === parseInt(value || '0')) || Object.values(selectedSector.industryGroups)[0]
          )
        }
      />

      {/* ✅ Save Button */}
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
    </Block>
  );
}
