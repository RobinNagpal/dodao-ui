import { multicall, type Config } from "@wagmi/core";
import type { Address } from "viem";
import { useDefaultConfig } from "@/shared/web3/wagmiConfig";
import { AAVE_CONFIG_POOL_CONTRACT } from "@/shared/migrator/aave/config";
import { PoolDataAddressAbi_Arbitrum } from "@/shared/migrator/aave/abi/PoolDataAddressAbi_Arbitrum";
import type { FlattenedAddresses, Collateral } from "@/shared/migrator/types";
import { calculateAaveAPY } from "./calculateAaveAPR";
import { calculateAaveAPR } from "./calculateAaveAPY";

export type MarketApr = {
  chainId: number;
  chainName: string;
  asset: string;
  netEarnAPY: number;
  netBorrowAPY: number;
};

/**
 * Hook to fetch Aave market APR/APY values across supported chains.
 */
export function useAaveAprs(): () => Promise<MarketApr[]> {
  const config: Config = useDefaultConfig;

  const flatten = (addrs: FlattenedAddresses | Address): Address[] =>
    typeof addrs === "object" ? (Object.values(addrs) as Address[]) : [addrs];

  const fetchChain = async (chainId: number): Promise<MarketApr[]> => {
    const provider = flatten(AAVE_CONFIG_POOL_CONTRACT[chainId])[0];
    if (!provider) return [];

    const [all] = await multicall(config, {
      chainId,
      contracts: [
        {
          address: provider,
          abi: PoolDataAddressAbi_Arbitrum,
          functionName: "getAllReservesTokens",
        },
      ],
    });

    const collaterals = all.result as Collateral[];
    if (!collaterals.length) return [];

    const calls = collaterals.map((c) => ({
      address: provider,
      abi: PoolDataAddressAbi_Arbitrum,
      functionName: "getReserveData",
      args: [c.tokenAddress],
    }));

    const results = await multicall(config, { chainId, contracts: calls });

    return collaterals.map((c, i) => {
      const d = results[i].result as any;
      const apr = calculateAaveAPR({
        reserveDataArray: [
          {
            asset: c.tokenAddress as Address,
            liquidityRate: d[5].toString(),
            variableBorrowRate: d[6].toString(),
            stableBorrowRate: d[7].toString(),
          },
        ],
      })[0];
      const apy = calculateAaveAPY([apr])[0];
      const chainName =
        config.chains.find((x) => x.id === chainId)?.name || "Unknown";
      return {
        chainId,
        chainName,
        asset: c.symbol,
        assetAddress: c.tokenAddress,
        netEarnAPY: parseFloat(apy.supplyAPY),
        netBorrowAPY: parseFloat(apy.variableBorrowAPY),
      };
    });
  };

  return async () => {
    const chains = Object.keys(AAVE_CONFIG_POOL_CONTRACT).map((id) =>
      Number(id)
    );
    const res = await Promise.all(chains.map(fetchChain));
    return res.flat();
  };
}
