import { APYData, AssetRates } from '@/shared/migrator/types';

export const calculateAaveAPR = (aprDataArray: AssetRates[]): APYData[] => {
  const calculateAPR = (apr: string) => {
    const aprValue = Number(apr) / 100;
    return ((Math.pow(1 + aprValue / 365, 365) - 1) * 100).toFixed(2);
  };

  return aprDataArray.map((data) => ({
    asset: data.asset,
    supplyAPY: calculateAPR(data.supplyAPR),
    stableBorrowAPY: calculateAPR(data.stableBorrowAPR),
    variableBorrowAPY: calculateAPR(data.variableBorrowAPR),
  }));
};
