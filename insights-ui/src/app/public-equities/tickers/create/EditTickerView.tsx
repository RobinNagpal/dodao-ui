'use client';

import { useEffect, useState } from 'react';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import Input from '@dodao/web-core/components/core/input/Input';
import { SectorsData } from '@/types/public-equity/sector';
import axios from 'axios';

interface EditTickerViewProps {
  gicsData: SectorsData;
  tickerKey?: string; // Optional ticker key
}

export default function EditTickerView({ gicsData, tickerKey }: EditTickerViewProps) {
  const sectorKeys = Object.keys(gicsData);

  // ✅ State management
  const [ticker, setTicker] = useState(tickerKey || ''); // Prefill if tickerKey exists
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedSector, setSelectedSector] = useState(sectorKeys[0]);
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState(() => {
    const industryGroups = Object.keys(gicsData[selectedSector]?.industryGroups || {});
    return industryGroups[0] || '';
  });

  // ✅ Fetch ticker details if `tickerKey` is provided
  useEffect(() => {
    if (!tickerKey) return;
    console.log('Fetching ticker details for:', tickerKey);
    const fetchTickerDetails = async () => {
      try {
        const response = await axios.get(`/api/ticker/${tickerKey}`);
        const tickerData = response.data.ticker;
        console.log('Fetched ticker:', tickerData);

        if (tickerData) {
          setTicker(tickerData.tickerKey);
          setSelectedSector(sectorKeys.find((key) => gicsData[key].name === tickerData.sector) || sectorKeys[0]);
          setSelectedIndustryGroup(
            Object.keys(gicsData[selectedSector]?.industryGroups || {}).find(
              (key) => gicsData[selectedSector]?.industryGroups[key].name === tickerData.industryGroup
            ) || ''
          );
        }
      } catch (error) {
        console.error('Error fetching ticker:', error);
        alert('Failed to load ticker details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickerDetails();
  }, [gicsData]);

  // ✅ Update industry group when sector changes
  useEffect(() => {
    const industryGroups = Object.keys(gicsData[selectedSector]?.industryGroups || {});
    setSelectedIndustryGroup(industryGroups[0] || '');
  }, [selectedSector]);

  const handleSave = async () => {
    if (!ticker.trim()) {
      setError('Ticker is required');
      return;
    }

    const tickerData = {
      sector: gicsData[selectedSector].name,
      industryGroup: gicsData[selectedSector].industryGroups[selectedIndustryGroup]?.name || '',
    };

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`/api/ticker/${ticker}`, tickerData);
      alert('Ticker saved successfully!');
      console.log('API Response:', response.data);
    } catch (error) {
      console.error('Error saving ticker:', error);
      alert('Failed to save ticker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Block title="Edit Ticker" className="font-semibold text-color">
      {/* ✅ Ticker Input Field (On Top) */}
      <Input
        modelValue={ticker}
        error={error}
        placeholder="Enter Ticker Key"
        maxLength={10}
        className="text-color"
        onUpdate={(e) => setTicker(e as string)}
        disabled={!!tickerKey}
      >
        Ticker *
      </Input>

      {/* ✅ Sector Select */}
      <StyledSelect
        label="Sector"
        selectedItemId={selectedSector}
        items={sectorKeys.map((key) => ({ id: key, label: gicsData[key].name }))}
        setSelectedItemId={(value) => setSelectedSector(value!)}
      />

      {/* ✅ Industry Group Select (Dynamic based on sector) */}
      <StyledSelect
        label="Industry Group"
        selectedItemId={selectedIndustryGroup}
        items={Object.keys(gicsData[selectedSector]?.industryGroups || {}).map((key) => ({
          id: key,
          label: gicsData[selectedSector].industryGroups[key].name,
        }))}
        setSelectedItemId={(value) => setSelectedIndustryGroup(value!)}
      />

      {/* ✅ Save Button */}
      <div className="flex justify-center items-center mt-6">
        <Button onClick={handleSave} className="block" variant="contained" primary loading={loading} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Block>
  );
}
