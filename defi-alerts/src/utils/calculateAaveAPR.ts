import { APYData, AssetRates } from '@/shared/migrator/types';

export const calculateAaveAPY = (aprDataArray: AssetRates[]): APYData[] => {
  const calculateAPY = (apr: string) => {
    const aprValue = Number(apr) / 100;
    return ((Math.pow(1 + aprValue / 365, 365) - 1) * 100).toFixed(2);
  };

  return aprDataArray.map((data) => ({
    asset: data.asset,
    supplyAPY: calculateAPY(data.supplyAPR),
    stableBorrowAPY: calculateAPY(data.stableBorrowAPR),
    variableBorrowAPY: calculateAPY(data.variableBorrowAPR),
  }));
};
