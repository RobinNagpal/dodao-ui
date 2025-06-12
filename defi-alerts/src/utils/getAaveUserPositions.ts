import { multicall, readContract, type Config } from '@wagmi/core';
import type { Address } from 'viem';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { AAVE_CONFIG_POOL_CONTRACT } from '@/shared/migrator/aave/config';
import { PoolDataAddressAbi_Arbitrum } from '@/shared/migrator/aave/abi/PoolDataAddressAbi_Arbitrum';
import { useAaveAprs, AaveMarketApr } from './getAaveAPR';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';
import { WalletComparisonPosition } from '@/components/modals/types';

/** Helper to pick the first provider address from the config */
const flattenProvider = (addrOrObj: Address | Record<string, Address>): Address => (typeof addrOrObj === 'string' ? addrOrObj : Object.values(addrOrObj)[0]);

const symbolCache: Record<string, Promise<string> | undefined> = {};
const ERC20_SYMBOL_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];
async function fetchSymbol(chainName: string, tokenAddress: string, wagmiConfig: Config): Promise<string> {
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
      if (response.ok) {
        const infoJson = (await response.json()) as { symbol?: string };
        if (infoJson.symbol && typeof infoJson.symbol === 'string') {
          return infoJson.symbol;
        }
      }
    } catch {}
    const chainConfig = CHAINS.find((c) => c.name.toLowerCase() === chainNameLower);
    if (!chainConfig) {
      return 'Unknown';
    }

    try {
      const onChainSymbol = (await readContract(wagmiConfig, {
        address: tokenAddress as Address,
        abi: ERC20_SYMBOL_ABI,
        functionName: 'symbol',
        args: [], // no arguments needed
        chainId: chainConfig.chainId,
      })) as string;
      console.log(`Fetched symbol from Contract for ${tokenAddress} on ${chainName}: ${onChainSymbol}`);
      return onChainSymbol ?? 'Unknown';
    } catch {
      console.error(`Failed to fetch symbol from contract for ${tokenAddress} on ${chainName}`);
      return 'Unknown';
    }
  })();

  return symbolCache[cacheKey]!;
}

export function useAaveUserPositions(): (wallets: string[]) => Promise<WalletComparisonPosition[]> {
  const config: Config = useDefaultConfig;
  const fetchAprs = useAaveAprs();

  return async (wallets: string[]) => {
    const aprs: AaveMarketApr[] = await fetchAprs();

    // group the filtered APRs by chainId
    const aprsByChain = aprs.reduce<Record<number, AaveMarketApr[]>>((acc, apr) => {
      (acc[apr.chainId] ||= []).push(apr);
      return acc;
    }, {});

    const positions: WalletComparisonPosition[] = [];
    const aprIndex: Record<number, Record<string, AaveMarketApr>> = {};
    aprs.forEach((a) => {
      const key = a.assetAddress.toLowerCase();
      (aprIndex[a.chainId] ||= {})[key] = a;
    });

    // 5) for each wallet, reset counters & fetch each chain in parallel
    await Promise.all(
      wallets.map(async (wallet) => {
        let supplyCount = 0;
        let borrowCount = 0;

        await Promise.all(
          Object.entries(aprsByChain).map(async ([chainIdStr, markets]) => {
            const chainId = Number(chainIdStr);
            const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

            // 6) find the Aave provider contract for this chain
            const providerAddr = flattenProvider(AAVE_CONFIG_POOL_CONTRACT[chainId] ?? {});
            if (!providerAddr) return;

            // 7) batch-multicall getUserReserveData for each filtered market
            const calls = markets.map((m) => ({
              address: providerAddr,
              abi: PoolDataAddressAbi_Arbitrum,
              functionName: 'getUserReserveData' as const,
              args: [m.assetAddress as Address, wallet as Address],
            }));

            let raw;
            try {
              raw = await multicall(config, {
                chainId,
                contracts: calls,
              });
            } catch (e) {
              console.error(`Aave userReserveData multicall failed for wallet ${wallet} on chain ${chainId}`, e);
              return;
            }

            const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);

            // 8) parse and push positions only for active ones
            for (let idx = 0; idx < raw.length; idx++) {
              if (!raw[idx].result) continue; // skip if no result
              const userData = raw[idx].result as readonly [
                bigint, // currentATokenBalance
                bigint, // currentStableDebt
                bigint, // currentVariableDebt
                bigint, // liquidityRate
                bigint, // principalStableDebt
                bigint, // scaledVariableDebt
                bigint, // stableBorrowRate
                number, // stableRateLastUpdated
                boolean // usageAsCollateralEnabled
              ];
              const [supBal, stableDebt, varDebt] = userData;

              // skip if no supply & no borrow
              const hasSupply = supBal > BigInt(0);
              const hasBorrow = stableDebt + varDebt > BigInt(0);
              if (!hasSupply && !hasBorrow) continue;

              const market = markets[idx];

              const hasMatchingMarket = compoundForChain.some((m) => m.baseAssetAddress.toLowerCase() === market.assetAddress.toLowerCase());

              const aprObj = aprIndex[chainId]?.[market.assetAddress.toLowerCase()];
              const actionType: 'SUPPLY' | 'BORROW' = hasSupply ? 'SUPPLY' : 'BORROW';

              const id = actionType === 'SUPPLY' ? `supply-${++supplyCount}-aave` : `borrow-${++borrowCount}-aave`;

              const rate = aprObj ? (actionType === 'SUPPLY' ? `${aprObj.netEarnAPY.toFixed(2)}%` : `${aprObj.netBorrowAPY.toFixed(2)}%`) : '0%';
              let assetSymbol = market.asset !== 'Unknown' ? market.asset : await fetchSymbol(chainName, market.assetAddress, config);

              positions.push({
                id,
                platform: 'AAVE',
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
