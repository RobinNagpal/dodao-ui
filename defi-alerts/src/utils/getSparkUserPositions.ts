import { multicall, type Config } from '@wagmi/core';
import type { Address } from 'viem';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { SPARK_DATA_PROVIDER } from '@/shared/migrator/spark/config';
import { Pool_Abi_DataProvider } from '@/shared/migrator/spark/abi/Pool_Abi_DataProvider';
import { useSparkAprs, MarketApr } from './getSparkAPR';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';
import { WalletComparisonPosition } from '@/components/modals/types';

const symbolCache: Record<string, Promise<string> | undefined> = {};
async function fetchSymbol(chainName: string, tokenAddress: string): Promise<string> {
  if (chainName === 'Unknown') return 'Unknown';
  const chainNameLower = chainName.toLowerCase();
  const cacheKey = `${chainNameLower}:${tokenAddress}`;

  if (symbolCache[cacheKey]) {
    return symbolCache[cacheKey]!;
  }

  symbolCache[cacheKey] = (async () => {
    try {
      const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainNameLower}/assets/${tokenAddress}/info.json`;
      const response = await fetch(url);
      if (!response.ok) {
        return 'Unknown';
      }
      const infoJson = (await response.json()) as { symbol?: string };
      return infoJson.symbol ?? 'Unknown';
    } catch {
      return 'Unknown';
    }
  })();

  return symbolCache[cacheKey]!;
}

/**
 * Batch‐fetch `getUserReserveData` for a given wallet + collateral list,
 * using fixed-size chunks and `allowFailure: false`. If any chunk fails,
 * we return `null` to signal “skip this batch entirely.”
 */
async function fetchUserReserveDataInBatches(
  config: Config,
  chainId: number,
  provider: Address,
  wallet: Address,
  markets: MarketApr[], // each MarketApr has `assetAddress`
  chunkSize = 10
): Promise<
  | readonly {
      result: readonly [
        bigint, // currentATokenBalance
        bigint, // currentStableDebt
        bigint, // currentVariableDebt
        bigint, // principalStableDebt
        bigint, // scaledVariableDebt
        bigint, // stableBorrowRate
        bigint, // liquidityRate
        number, // stableRateLastUpdated
        boolean // usageAsCollateralEnabled
      ];
    }[]
  | null
> {
  // Build one multicall request per market
  const calls = markets.map((m) => ({
    address: provider,
    abi: Pool_Abi_DataProvider,
    functionName: 'getUserReserveData' as const,
    args: [m.assetAddress as Address, wallet as Address],
  }));

  const allResults: {
    result: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, number, boolean];
  }[] = [];

  for (let i = 0; i < calls.length; i += chunkSize) {
    const slice = calls.slice(i, i + chunkSize);
    try {
      // `allowFailure: false` means ANY failure in this chunk throws
      const batch = await multicall(config, {
        chainId,
        contracts: slice,
        allowFailure: false,
      });

      // append each raw entry (wrapped in { result: [...] })
      allResults.push(...batch.map((result) => ({ result })));
    } catch (err) {
      console.error(`Chunked multicall getUserReserveData failed on chain ${chainId}, wallet ${wallet}.`, err);
      // bail out if any chunk fails
      return null;
    }
  }

  return allResults;
}

export function useSparkUserPositions(): (wallets: string[]) => Promise<WalletComparisonPosition[]> {
  const config: Config = useDefaultConfig;
  const fetchAprs = useSparkAprs();

  // helper to pick provider
  const flattenProvider = (addrOrObj: Address | Record<string, Address>): Address => (typeof addrOrObj === 'string' ? addrOrObj : Object.values(addrOrObj)[0]);

  return async (wallets: string[]) => {
    const aprs: MarketApr[] = await fetchAprs();
    const aprsByChain = aprs.reduce<Record<number, MarketApr[]>>((acc, a) => {
      (acc[a.chainId] ||= []).push(a);
      return acc;
    }, {});

    const aprIndex: Record<number, Record<string, MarketApr>> = {};
    aprs.forEach((a) => {
      const key = a.assetAddress.toLowerCase();
      (aprIndex[a.chainId] ||= {})[key] = a;
    });

    const positions: WalletComparisonPosition[] = [];

    // 4) for each wallet, fetch all chains in parallel
    await Promise.all(
      wallets.map(async (wallet) => {
        let supplyCount = 0;
        let borrowCount = 0;

        await Promise.all(
          Object.entries(aprsByChain).map(async ([chainIdStr, markets]) => {
            const chainId = Number(chainIdStr);
            const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

            const provider = flattenProvider(SPARK_DATA_PROVIDER[chainId] ?? {});
            if (!provider) return;

            // let raw: { result: any }[]
            const raw = await fetchUserReserveDataInBatches(config, chainId, provider, wallet as Address, markets);
            if (!raw) {
              // entire batch failed for this chain+wallet: skip
              return;
            }

            const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);

            // 6) parse & push only active positions
            for (let idx = 0; idx < raw.length; idx++) {
              if (!raw[idx].result) continue; // skip if no result
              const data = raw[idx].result as readonly [
                bigint, // currentATokenBalance
                bigint, // currentStableDebt
                bigint, // currentVariableDebt
                bigint, // principalStableDebt
                bigint, // scaledVariableDebt
                bigint, // stableBorrowRate
                bigint, // liquidityRate
                number, // stableRateLastUpdated
                boolean // usageAsCollateralEnabled
              ];
              const [supBal, stDebt, varDebt] = data;
              const hasSupply = supBal > BigInt(0);
              const hasBorrow = stDebt + varDebt > BigInt(0);
              if (!hasSupply && !hasBorrow) continue; // skip if no supply or borrow

              const market = markets[idx];

              const hasMatchingMarket = compoundForChain.some((m) => m.baseAssetAddress.toLowerCase() === market.assetAddress.toLowerCase());
              const aprObj = aprIndex[chainId]?.[market.assetAddress.toLowerCase()];
              const actionType: 'SUPPLY' | 'BORROW' = hasSupply ? 'SUPPLY' : 'BORROW';
              const id = actionType === 'SUPPLY' ? `supply-${++supplyCount}-spark` : `borrow-${++borrowCount}-spark`;
              const rate = aprObj ? (actionType === 'SUPPLY' ? `${aprObj.netEarnAPY.toFixed(2)}%` : `${aprObj.netBorrowAPY.toFixed(2)}%`) : '0%';
              let assetSymbol = market.asset !== 'Unknown' ? market.asset : await fetchSymbol(chainName, market.assetAddress);

              positions.push({
                id,
                platform: 'SPARK',
                walletAddress: wallet,
                chain: chainName,
                assetSymbol: assetSymbol,
                assetAddress: market.assetAddress,
                rate,
                actionType,
                disable: !hasMatchingMarket,
                notificationFrequency: 'ONCE_PER_ALERT',
                conditions: [
                  {
                    id: '0-condition',
                    conditionType: actionType === 'SUPPLY' ? 'RATE_DIFF_ABOVE' : 'RATE_DIFF_BELOW',
                    severity: 'NONE',
                  },
                ],
              });
            }
          })
        );
      })
    );

    return positions;
  };
}
