import { AssetRates, ReserveData } from '@/shared/migrator/types';

export const calculateAaveAPR = ({ reserveDataArray }: { reserveDataArray: ReserveData[] }): AssetRates[] => {
  return reserveDataArray.map((reserve) => {
    const parseRate = (rate: string) => ((Number(rate) / 10 ** 27) * 100).toFixed(2);

    return {
      asset: reserve.asset,
      supplyAPR: parseRate(reserve.liquidityRate),
      stableBorrowAPR: parseRate(reserve.stableBorrowRate),
      variableBorrowAPR: parseRate(reserve.variableBorrowRate),
    };
  });
};
