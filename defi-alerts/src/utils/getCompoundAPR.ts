import { Address, formatUnits } from 'viem';
import { multicall } from '@wagmi/core';
import type { Config } from '@wagmi/core';

import { CometABI } from '@/shared/web3/abi/CometABI';
import { TokenABI } from '@/shared/web3/abi/TokenABI';
import { COMP_MAIN_COMET_ADDRESS, COMP_MAIN_PRICE_FEE, ETH_MAIN_PRICE_FEE, wstETH_MAIN_PRICE_FEE, COMPOUND_MARKETS, CHAINS } from '@/shared/web3/config';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';

export type CompoundMarketApr = {
  chainId: number;
  chainName: string;
  asset: string;
  assetAddress: string;
  supplyApr: number;
  borrowApr: number;
  supplyCompRewardApr: number;
  borrowCompRewardApr: number;
  netEarnAPY: number;
  netBorrowAPY: number;
};

const SECONDS_PER_DAY = 60 * 60 * 24;
const DAYS_IN_YEAR = 365;
const BASE_DECIMALS = 18;
export const priceFeedMantissa = 8;

/** Fetch COMP, ETH & wstETH prices via a single multicall */
async function getPrices(config: Config) {
  const calls = [
    { address: COMP_MAIN_COMET_ADDRESS, abi: TokenABI, functionName: 'getPrice' as const, args: [COMP_MAIN_PRICE_FEE] },
    { address: COMP_MAIN_COMET_ADDRESS, abi: TokenABI, functionName: 'getPrice' as const, args: [ETH_MAIN_PRICE_FEE] },
    { address: COMP_MAIN_COMET_ADDRESS, abi: TokenABI, functionName: 'getPrice' as const, args: [wstETH_MAIN_PRICE_FEE] },
  ] as const;

  const [compPrice, ethPrice, wstEthPrice] = await multicall(config, {
    chainId: 1,
    contracts: calls,
  }).then((res) => res.map((r) => r.result as bigint));

  return { compPrice, ethPrice, wstEthPrice };
}

/** Returns APRs for every Compound market (all networks) */
export function useCompoundMarketsAprs(): () => Promise<CompoundMarketApr[]> {
  const config: Config = useDefaultConfig;
  return async () => {
    // 1) Fetch global token prices once
    const { compPrice, ethPrice, wstEthPrice } = await getPrices(config);

    // 2) Group markets by chain so we can batch each chain’s markets
    const marketsByChain = COMPOUND_MARKETS.reduce<Record<number, typeof COMPOUND_MARKETS>>((acc, m) => {
      (acc[m.chainId] ||= []).push(m);
      return acc;
    }, {});

    // 3) For each chain, run two multicalls in parallel across chains
    const allAprs = await Promise.all(
      Object.entries(marketsByChain).map(async ([chainIdStr, markets]) => {
        const chainId = Number(chainIdStr);
        const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

        // 3a) Batch call `baseTokenPriceFeed` and `getUtilization` for all markets
        const feedCalls = markets.map((m) => ({
          address: m.cometAddress.toLowerCase() as Address,
          abi: CometABI,
          functionName: 'baseTokenPriceFeed' as const,
        }));
        const utilCalls = markets.map((m) => ({
          address: m.cometAddress.toLowerCase() as Address,
          abi: CometABI,
          functionName: 'getUtilization' as const,
        }));

        const feedAndUtil = [...feedCalls, ...utilCalls];
        const feedUtilResults = await multicall(config, {
          chainId,
          contracts: feedAndUtil,
        });

        // split out the results
        const feedIds = feedUtilResults.slice(0, markets.length).map((r) => r.result as `0x${string}`);
        const utils = feedUtilResults.slice(markets.length).map((r) => r.result as bigint);

        // 3b) Batch call the remaining 9 methods per market
        const detailedCalls = markets.flatMap(
          (m, i) =>
            [
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'decimals' as const },
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'baseIndexScale' as const },
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'getSupplyRate' as const, args: [utils[i]] },
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'getBorrowRate' as const, args: [utils[i]] },
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'totalSupply' as const },
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'totalBorrow' as const },
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'baseTrackingSupplySpeed' as const },
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'baseTrackingBorrowSpeed' as const },
              { address: m.cometAddress.toLowerCase() as Address, abi: CometABI, functionName: 'getPrice' as const, args: [feedIds[i]] },
            ] as const
        );

        const detailedResults = await multicall(config, {
          chainId,
          contracts: detailedCalls,
        }).then((res) => res.map((r) => r.result as bigint));

        // 4) Now slice & dice those bigints into your APR objects
        const aprs: CompoundMarketApr[] = markets.map((m, i) => {
          const offset = i * 9;
          const [decimalsBI, baseIndexScaleBI, sRateBI, bRateBI, totSupBI, totBorBI, supSpdBI, borSpdBI, tokenPriceBI] = detailedResults.slice(
            offset,
            offset + 9
          );

          const decimals = Number(decimalsBI);
          const baseIndexScale = Number(baseIndexScaleBI);
          const supplyRateDecimal = Number(formatUnits(sRateBI, BASE_DECIMALS));
          const borrowRateDecimal = Number(formatUnits(bRateBI, BASE_DECIMALS));
          const totalSupplyDecimal = Number(formatUnits(totSupBI, decimals));
          const totalBorrowDecimal = Number(formatUnits(totBorBI, decimals));
          const compToSuppliersDay = (Number(supSpdBI) / baseIndexScale) * SECONDS_PER_DAY;
          const compToBorrowersDay = (Number(borSpdBI) / baseIndexScale) * SECONDS_PER_DAY;

          const tokenUsd =
            m.symbol === 'WETH'
              ? Number(formatUnits(ethPrice, priceFeedMantissa))
              : m.symbol === 'wstETH'
              ? Number(formatUnits(wstEthPrice, priceFeedMantissa))
              : Number(formatUnits(tokenPriceBI, priceFeedMantissa));

          const compUsd = Number(formatUnits(compPrice, priceFeedMantissa));

          const supplyApr = supplyRateDecimal * SECONDS_PER_DAY * DAYS_IN_YEAR * 100;
          const borrowApr = borrowRateDecimal * SECONDS_PER_DAY * DAYS_IN_YEAR * 100;
          const supplyRewardApr = ((compUsd * compToSuppliersDay) / (totalSupplyDecimal * tokenUsd)) * DAYS_IN_YEAR * 100;
          const borrowRewardApr = ((compUsd * compToBorrowersDay) / (totalBorrowDecimal * tokenUsd)) * DAYS_IN_YEAR * 100;

          return {
            chainId,
            chainName,
            asset: m.symbol,
            assetAddress: m.baseAssetAddress,
            supplyApr,
            borrowApr,
            supplyCompRewardApr: supplyRewardApr,
            borrowCompRewardApr: borrowRewardApr,
            netEarnAPY: +(supplyApr + supplyRewardApr).toFixed(2),
            netBorrowAPY: +(borrowApr - borrowRewardApr).toFixed(2),
          };
        });

        return aprs;
      })
    );

    // 5) flatten & return
    return allAprs.flat();
  };
}
