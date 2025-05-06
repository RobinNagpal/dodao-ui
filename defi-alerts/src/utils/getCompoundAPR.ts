import { formatUnits } from "viem";
import { multicall } from "@wagmi/core";
import type { Config } from "@wagmi/core";

import { CometABI } from "@/shared/web3/abi/CometABI";
import { TokenABI } from "@/shared/web3/abi/TokenABI";
import {
  COMP_MAIN_COMET_ADDRESS,
  COMP_MAIN_PRICE_FEE,
  ETH_MAIN_PRICE_FEE,
  wstETH_MAIN_PRICE_FEE,
  MARKETS,
  CHAINS,
} from "@/shared/web3/config";
import { useDefaultConfig } from "@/shared/web3/wagmiConfig";

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

/** Fetch COMP, ETH & wstETH prices via multicall */
async function getPrices(config: Config): Promise<{
  compPrice: bigint;
  ethPrice: bigint;
  wstEthPrice: bigint;
}> {
  const [compPrice, ethPrice, wstEthPrice] = await multicall(config, {
    chainId: CHAINS.find((c) => c.chainId === 1)!.chainId, // mainnet
    contracts: [
      {
        address: COMP_MAIN_COMET_ADDRESS,
        abi: TokenABI,
        functionName: "getPrice",
        args: [COMP_MAIN_PRICE_FEE],
      },
      {
        address: COMP_MAIN_COMET_ADDRESS,
        abi: TokenABI,
        functionName: "getPrice",
        args: [ETH_MAIN_PRICE_FEE],
      },
      {
        address: COMP_MAIN_COMET_ADDRESS,
        abi: TokenABI,
        functionName: "getPrice",
        args: [wstETH_MAIN_PRICE_FEE],
      },
    ] as const,
  }).then((res) => res.map((r) => r.result as bigint));

  return { compPrice, ethPrice, wstEthPrice };
}

/** Returns APRs for every Compound market (all networks in your config). */
export function useCompoundMarketsAprs(): () => Promise<CompoundMarketApr[]> {
  const config: Config = useDefaultConfig;

  return async () => {
    const { compPrice, ethPrice, wstEthPrice } = await getPrices(config);

    const aprs = await Promise.all(
      MARKETS.map(async (market) => {
        const {
          chainId,
          symbol: asset,
          cometAddress: address,
          baseAssetAddress: assetAddress,
        } = market;
        const chainName =
          CHAINS.find((c) => c.chainId === chainId)?.name ?? "Unknown";

        // 1) fetch priceFeedId & utilization
        const [priceFeedId, utilization] = await multicall(config, {
          chainId,
          contracts: [
            { address, abi: CometABI, functionName: "baseTokenPriceFeed" },
            { address, abi: CometABI, functionName: "getUtilization" },
          ] as const,
        }).then((res) => [res[0].result as string, res[1].result as bigint]);

        // 2) fetch rates, totals, speeds, AND the market’s own price
        const [
          decimalsResult,
          baseIndexScaleResult,
          sRate,
          bRate,
          totSup,
          totBor,
          supSpd,
          borSpd,
          tokenPriceMantissa,
        ] = await multicall(config, {
          chainId,
          contracts: [
            { address, abi: CometABI, functionName: "decimals" },
            { address, abi: CometABI, functionName: "baseIndexScale" },
            {
              address,
              abi: CometABI,
              functionName: "getSupplyRate",
              args: [utilization as bigint],
            },
            {
              address,
              abi: CometABI,
              functionName: "getBorrowRate",
              args: [utilization as bigint],
            },
            { address, abi: CometABI, functionName: "totalSupply" },
            { address, abi: CometABI, functionName: "totalBorrow" },
            { address, abi: CometABI, functionName: "baseTrackingSupplySpeed" },
            { address, abi: CometABI, functionName: "baseTrackingBorrowSpeed" },
            {
              address,
              abi: CometABI,
              functionName: "getPrice",
              args: [priceFeedId as `0x${string}`],
            },
          ] as const,
        }).then((res) => res.map((r) => r.result as bigint));

        const baseIndexScale = Number(baseIndexScaleResult);

        // 3) normalize all bigints to decimals
        const supplyRateDecimal = Number(formatUnits(sRate, BASE_DECIMALS));
        const borrowRateDecimal = Number(formatUnits(bRate, BASE_DECIMALS));
        const totalSupplyDecimal = Number(
          formatUnits(totSup, Number(decimalsResult))
        );
        const totalBorrowDecimal = Number(
          formatUnits(totBor, Number(decimalsResult))
        );
        const baseTrackingSupplySpeed = Number(supSpd || BigInt(0));
        const baseTrackingBorrowSpeed = Number(borSpd || BigInt(0));

        const compToSuppliersPerDay =
          (baseTrackingSupplySpeed / baseIndexScale) * SECONDS_PER_DAY;
        const compToBorrowersPerDay =
          (baseTrackingBorrowSpeed / baseIndexScale) * SECONDS_PER_DAY;

        // 4) pick the right USD price for this asset
        const tokenUsd =
          asset === "WETH"
            ? Number(formatUnits(ethPrice, priceFeedMantissa))
            : asset === "wstETH"
            ? Number(formatUnits(wstEthPrice, priceFeedMantissa))
            : Number(formatUnits(tokenPriceMantissa, priceFeedMantissa));

        const compUsd = Number(formatUnits(compPrice, priceFeedMantissa));

        // 5) compute APRs
        const supplyApr =
          supplyRateDecimal * SECONDS_PER_DAY * DAYS_IN_YEAR * 100;
        const borrowApr =
          borrowRateDecimal * SECONDS_PER_DAY * DAYS_IN_YEAR * 100;

        const supplyCompRewardApr =
          ((compUsd * compToSuppliersPerDay) /
            (totalSupplyDecimal * tokenUsd)) *
          DAYS_IN_YEAR *
          100;
        const borrowCompRewardApr =
          ((compUsd * compToBorrowersPerDay) /
            (totalBorrowDecimal * tokenUsd)) *
          DAYS_IN_YEAR *
          100;

        return {
          chainId,
          chainName,
          asset,
          assetAddress,
          supplyApr,
          borrowApr,
          supplyCompRewardApr,
          borrowCompRewardApr,
          netEarnAPY: +(supplyApr + supplyCompRewardApr).toFixed(2),
          netBorrowAPY: +(borrowApr - borrowCompRewardApr).toFixed(2),
        };
      })
    );

    return aprs;
  };
}
