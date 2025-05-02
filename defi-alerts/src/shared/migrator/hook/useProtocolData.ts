import { useCallback, useMemo } from 'react';
import { Address, formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { multicall } from '@wagmi/core';

import { OracleAbi_Arbitrum } from '@/shared/migrator/aave/abi/OracleAbi_Arbitrum';
import { PoolAbi_Arbitrum } from '@/shared/migrator/aave/abi/PoolAbi_Arbitrum';
import { PoolDataAddressAbi_Arbitrum } from '@/shared/migrator/aave/abi/PoolDataAddressAbi_Arbitrum';
import {
  AAVE_CONFIG_POOL_ADDRESS_PROVIDER,
  AAVE_CONFIG_POOL_CONTRACT,
  AAVE_ORACLE_CONTRACT,
  AAVE_POOL_CONTRACT,
} from '@/shared/migrator/aave/config';
import { OracleAbi_Spark_Eth } from '@/shared/migrator/spark/abi/OracleAbi_Spark_Eth';
import { Pool_Abi_DataProvider } from '@/shared/migrator/spark/abi/Pool_Abi_DataProvider';
import { StakingAbi_Spark_Eth } from '@/shared/migrator/spark/abi/StakingAbi_Spark_Eth';
import {
  SPARK_DATA_PROVIDER,
  SPARK_ORACLE_CONTRACT,
  SPARK_STAKING_CONTRACT,
} from '@/shared/migrator/spark/config';
import {
  AddressResult,
  CategorizedAssets,
  Collateral,
  FlattenedAddresses,
  MulticallRequest,
  ReserveDataTuple,
  RootDataType,
  UserAccountData,
  UserReserve,
  UserReserveDataTuple,
} from '@/shared/migrator/types';
import { ERC20ABI } from '@/shared/web3/abi/ERC20';
import { ZERO_ADDRESS } from '@/shared/web3/chainConfig';
import { getRPCConfig } from '@/shared/web3/rpcConfigs';
import { useRPCStore } from '@/store/rpc';

import { calculateAaveAPY } from '../util/calculateAaveAPR';
import { calculateAaveAPR } from '../util/calculateAaveAPY';

type ProtocolType = 'aave' | 'spark';

const getFlattenedAddresses = (addresses: FlattenedAddresses | Address): Address[] => {
  if (typeof addresses === 'object') {
    return Object.values(addresses) as Address[];
  }
  return [addresses] as Address[];
};

export const useProtocolData = () => {
  const { address } = useAccount();

  // const address = '0x95834126939C7d7E6153d80019ef2B76F9c43343'; //VIKA
  // const address = '0xF0B1e3A6Cb20Ac88DD372e55DFb16b3A64b07D31'; //VIT
  // const address = '0x619Cd39439791D6B4f55F6eDf2a3b52bd6f30c22'; //OLA

  const { publicRPC, myWalletRPC, customRPC, customRPCList, lastChange } = useRPCStore();

  const rightRPC = useMemo(
    () => getRPCConfig(address, publicRPC, myWalletRPC, customRPC, lastChange, customRPCList),
    [address, publicRPC, myWalletRPC, customRPC, lastChange, customRPCList]
  );

  const getNetworkData = useCallback(
    async (chainId: number, protocol: ProtocolType) => {
      if (!address) return null;

      const configMap = {
        aave: {
          poolContractAddresses: getFlattenedAddresses(AAVE_CONFIG_POOL_CONTRACT[chainId]),
          poolAddresses: getFlattenedAddresses(AAVE_POOL_CONTRACT[chainId]),
          oracleAddresses: getFlattenedAddresses(AAVE_ORACLE_CONTRACT[chainId]),
          dataProviderAbi: PoolDataAddressAbi_Arbitrum,
          oracleAbi: OracleAbi_Arbitrum,
          poolAbi: PoolAbi_Arbitrum,
        },
        spark: {
          poolContractAddresses: [SPARK_DATA_PROVIDER[chainId]],
          poolAddresses: [SPARK_STAKING_CONTRACT[chainId]],
          oracleAddresses: [SPARK_ORACLE_CONTRACT[chainId]],
          dataProviderAbi: Pool_Abi_DataProvider,
          oracleAbi: OracleAbi_Spark_Eth,
          poolAbi: StakingAbi_Spark_Eth,
        },
      };

      const config = configMap[protocol];

      // Assign values to variables
      const [poolContractAddress, poolAddress, oracleAddress]: AddressResult = [
        config.poolContractAddresses[0] ?? ZERO_ADDRESS,
        config.poolAddresses[0] ?? ZERO_ADDRESS,
        config.oracleAddresses[0] ?? ZERO_ADDRESS,
      ];

      const getAllReserves = await multicall(rightRPC, {
        chainId,
        contracts: [
          {
            address: poolContractAddress,
            abi: config.dataProviderAbi,
            functionName: 'getAllReservesTokens',
          },
        ],
      });

      const collateralsAllList = getAllReserves[0].result as Collateral[];

      if (!collateralsAllList?.length) {
        return null;
      }

      const assetAddresses = collateralsAllList?.map((collateral) => collateral.tokenAddress);

      // Get token addresses for each asset
      const getReserveTokensAddressesRequests = assetAddresses?.map((asset) => ({
        address: poolContractAddress,
        abi: config.dataProviderAbi,
        functionName: 'getReserveTokensAddresses',
        args: [asset],
      }));

      const reserveTokensAddressesResults = await multicall(rightRPC, {
        chainId,
        contracts: getReserveTokensAddressesRequests,
      });

      const tokenAddresses = reserveTokensAddressesResults.map((result) => {
        const [aTokenAddress, stableDebtTokenAddress, variableDebtTokenAddress] =
          result.result as unknown as AddressResult;
        return {
          aTokenAddress,
          stableDebtTokenAddress,
          variableDebtTokenAddress,
        };
      });

      type CollateralWithAddresses = {
        address: Address;
        symbol: string;
        aTokenAddress: Address;
        stableDebtTokenAddress: Address;
        variableDebtTokenAddress: Address;
      };

      const assetAddressesWithSymbols = collateralsAllList?.map(
        (collateral, index): CollateralWithAddresses => ({
          address: collateral.tokenAddress,
          symbol: collateral.symbol,
          aTokenAddress: tokenAddresses[index].aTokenAddress,
          stableDebtTokenAddress: tokenAddresses[index].stableDebtTokenAddress,
          variableDebtTokenAddress: tokenAddresses[index].variableDebtTokenAddress,
        })
      );

      // Решта логіки майже ідентична для обох протоколів
      const reserveDataRequests: MulticallRequest[] = assetAddresses?.map(
        (asset) =>
          ({
            address: poolContractAddress,
            abi: config.dataProviderAbi,
            functionName: 'getReserveData',
            args: [asset],
          }) as const
      );

      const userReserveDataRequests: MulticallRequest[] = assetAddresses?.map((asset) => ({
        address: poolContractAddress,
        abi: config.dataProviderAbi,
        functionName: 'getUserReserveData',
        args: [String(asset), address],
      }));

      const assetsOracleRequests: MulticallRequest[] = assetAddresses?.map((asset) => ({
        address: oracleAddress,
        abi: config.oracleAbi,
        functionName: 'getAssetPrice',
        args: [String(asset)],
      }));

      const assetsDecimalsRequests: MulticallRequest[] = assetAddresses?.map((asset) => ({
        address: asset,
        abi: ERC20ABI,
        functionName: 'decimals',
        args: [],
      }));

      const resultData = await multicall(rightRPC, {
        chainId,
        contracts: [
          ...reserveDataRequests,
          ...userReserveDataRequests,
          ...assetsOracleRequests,
          ...assetsDecimalsRequests,
          {
            address: poolAddress,
            abi: config.poolAbi,
            functionName: 'getUserAccountData',
            args: [address],
          },
        ],
      });

      // Решта логіки повністю збігається з оригінальним хуком
      const reserveReqLength = reserveDataRequests.length;
      const userReserveDataReq = userReserveDataRequests.length;
      const oracleReqLength = assetsOracleRequests.length;
      const decimalsReqLength = assetsDecimalsRequests.length;

      const [
        reserveDataResults,
        userReserveDataResults,
        assetPriceResults,
        assetsDecimalsResults,
        userAccountDataResults,
      ] = [
        resultData.slice(0, reserveReqLength),
        resultData.slice(reserveReqLength, reserveReqLength + userReserveDataReq),
        resultData.slice(
          reserveReqLength + userReserveDataReq,
          reserveReqLength + userReserveDataReq + oracleReqLength
        ),
        resultData.slice(
          reserveReqLength + userReserveDataReq + oracleReqLength,
          reserveReqLength + userReserveDataReq + oracleReqLength + decimalsReqLength
        ),
        resultData.slice(
          reserveReqLength + userReserveDataReq + oracleReqLength + decimalsReqLength
        ),
      ];

      // Retrieve user account base data
      const userAccountData = userAccountDataResults[0].result as UserAccountData;
      // Total value of all user assets used as collateral
      const collateralValue = BigInt(userAccountData[0]);
      // totalDebtBase: total amount of all active user loans
      const debt = BigInt(userAccountData[1]);
      // currentLiquidationThreshold: value in basis points (8000 = 80%)
      const currentLiquidationThreshold = BigInt(userAccountData[3]);
      // ltv (Loan to Value): maximum loan-to-collateral ratio in basis points
      const ltv = BigInt(userAccountData[4]);
      // healthFactor: position health indicator, if < 1, the position may be liquidated
      const healthFactor = BigInt(userAccountData[5]);
      // Maximum amount that can be borrowed based on current collateral and LTV
      const maxBorrowBasedOnCollateral = (collateralValue * ltv) / BigInt(10000);
      // Maximum safe debt before reaching the liquidation threshold
      const maxSafeDebt = (collateralValue * currentLiquidationThreshold) / BigInt(10000);
      // Available amount to borrow = maximum possible loan minus current debt
      const availableToBorrow =
        maxBorrowBasedOnCollateral > debt ? maxBorrowBasedOnCollateral - debt : BigInt(0);
      // Buffer to liquidation = difference between maximum safe debt and current debt
      const liquidationBuffer = maxSafeDebt > debt ? maxSafeDebt - debt : BigInt(0);
      // Parse user data for each asset
      const parsedUserReserves = userReserveDataResults.map((res, index: number) => {
        const userReserve = res.result as UserReserveDataTuple;
        const { symbol, aTokenAddress, address: asset } = assetAddressesWithSymbols[index];

        return {
          symbol, // Token symbol
          asset, // Token address
          aTokenAddress,
          addressUser: address, // User address
          currentATokenBalance: userReserve[0].toString(), // Current aToken balance (deposit)
          currentStableDebt: userReserve[1].toString(), // Current stable debt
          currentVariableDebt: userReserve[2].toString(), // Current variable debt
          principalStableDebt: userReserve[3].toString(), // Principal amount of stable debt
          scaledVariableDebt: userReserve[4].toString(), // Scaled variable debt
          stableBorrowRate: userReserve[5].toString(), // Stable borrow rate
          liquidityRate: userReserve[6].toString(), // Liquidity rate
          usageAsCollateralEnabled: userReserve[8], // Whether it is used as collateral
        };
      });

      // Parse general reserve data
      const parsedReserves = reserveDataResults.map((res, index: number) => {
        const reserve = res.result as ReserveDataTuple;
        const { symbol, aTokenAddress, address: asset } = assetAddressesWithSymbols[index];
        return {
          symbol, // Token symbol
          asset, // Token address
          aTokenAddress,
          totalAToken: reserve[2].toString(), // Total aToken amount
          totalStableDebt: reserve[3].toString(), // Total stable debt
          totalVariableDebt: reserve[4].toString(), // Total variable debt
          liquidityRate: reserve[5].toString(), // Liquidity rate
          variableBorrowRate: reserve[6].toString(), // Variable borrow rate
          stableBorrowRate: reserve[7].toString(), // Stable borrow rate
          averageStableBorrowRate: reserve[8].toString(), // Average stable borrow rate
          liquidityIndex: reserve[9].toString(), // Liquidity index
          variableBorrowIndex: reserve[10].toString(), // Variable borrow index
        };
      });

      // Process data for each asset
      const assetsData = parsedUserReserves.map((userReserve, index: number) => {
        const reserve = parsedReserves[index];

        const currentTokenAddresses = tokenAddresses[index];

        // Retrieve asset price and decimals
        const price = BigInt((assetPriceResults[index] as { result: bigint }).result);
        const decimals = BigInt((assetsDecimalsResults[index] as { result: number }).result);
        const powerOfTen = BigInt(10 ** Number(decimals));
        // Calculate aToken balance (deposit)
        const currentATokenBalanceBigInt = BigInt(userReserve.currentATokenBalance);
        // Calculate collateral balance in USD
        const collateralBalanceUSD = (currentATokenBalanceBigInt * price) / powerOfTen;
        // Calculate total debt (stable + variable)
        const totalDebtBigInt =
          BigInt(userReserve.currentStableDebt) + BigInt(userReserve.currentVariableDebt);
        // Calculate APR and APY
        const aprData = calculateAaveAPR({
          reserveDataArray: [
            {
              asset: reserve.asset,
              liquidityRate: reserve.liquidityRate,
              stableBorrowRate: reserve.stableBorrowRate,
              variableBorrowRate: reserve.variableBorrowRate,
            },
          ],
        })[0];

        const apyData = calculateAaveAPY([aprData])[0];

        return {
          aTokenAddress: currentTokenAddresses.aTokenAddress,
          stableDebtTokenAddress: currentTokenAddresses.stableDebtTokenAddress,
          variableDebtTokenAddress: currentTokenAddresses.variableDebtTokenAddress,
          symbol: userReserve.symbol, // Token symbol
          asset: userReserve.asset, // Token address
          //   balance: String(Number(currentATokenBalanceBigInt) / Number(powerOfTen)), // Balance in tokens
          balance: formatUnits(currentATokenBalanceBigInt, Number(decimals)),
          price: formatUnits(price, 8), // Price in USD
          originPrice: price,
          decimals: Number(decimals), // Number of decimals
          debt: Number((Number(totalDebtBigInt) / Number(powerOfTen)).toFixed(18)), // Debt in tokens
          supplyBalanceUSD: Number(formatUnits(collateralBalanceUSD, 8)), // Balance in USD
          borrowBalanceUSD: Number(formatUnits((totalDebtBigInt * price) / powerOfTen, 8)), // Debt in USD
          apy: apyData, // APY data
          usageAsCollateralEnabled: userReserve.usageAsCollateralEnabled,
        };
      });

      const { supplies, borrows } = assetsData.reduce<CategorizedAssets>(
        (acc: CategorizedAssets, userReserve: UserReserve): CategorizedAssets => {
          if (Number(userReserve.balance) > 0) acc.supplies.push(userReserve);
          if (userReserve.debt > 0) acc.borrows.push(userReserve);
          return acc;
        },
        { supplies: [], borrows: [] }
      );

      // Calculate Total Supply Balance USD and APY
      const totalSupplyBalanceUSD = supplies.reduce((sum, s) => sum + (s.supplyBalanceUSD || 0), 0);
      const totalSupplyAPY =
        totalSupplyBalanceUSD > 0
          ? supplies.reduce((sum, s) => sum + s.supplyBalanceUSD * Number(s.apy.supplyAPY), 0) /
            totalSupplyBalanceUSD
          : 0;

      // Calculate Total Borrow Balance USD and APY
      const totalBorrowBalanceUSD = borrows.reduce((sum, b) => sum + (b.borrowBalanceUSD || 0), 0);
      const totalBorrowAPY =
        totalBorrowBalanceUSD > 0
          ? borrows.reduce(
              (sum, b) =>
                sum +
                (b.borrowBalanceUSD && b.apy.variableBorrowAPY
                  ? b.borrowBalanceUSD * Number(b.apy.variableBorrowAPY)
                  : 0),
              0
            ) / totalBorrowBalanceUSD
          : 0;

      // Calculate Total Balance USD
      const totalBalanceUSD = totalSupplyBalanceUSD + totalBorrowBalanceUSD;

      // Create an object "supplies" with general data and an array of assets
      const suppliesWithTotals = {
        totalSupplyBalanceUSD,
        totalSupplyAPY: String(totalSupplyAPY),
        totalBalanceUSD,
        supplies: supplies.map((supply) => ({
          ...supply,
        })),
      };

      // Form the borrows object with general data and an array of assets
      const borrowsWithTotals = {
        totalBorrowBalanceUSD,
        totalBorrowAPY: String(totalBorrowAPY),
        totalBalanceUSD,
        borrows: borrows.map((borrow) => ({
          ...borrow,
        })),
      };

      const formatBorrowPowerUsed =
        BigInt(maxBorrowBasedOnCollateral) === BigInt(0)
          ? BigInt(0)
          : (BigInt(debt) * BigInt(100)) / BigInt(maxBorrowBasedOnCollateral);

      return {
        debt: debt, // Debt in USD
        borrowCapacity: maxBorrowBasedOnCollateral, // Maximum possible loan in USD
        collateralValue: collateralValue, // Total collateral value in USD
        availableToBorrow: availableToBorrow, // Available amount for borrowing in USD
        healthFactor: formatUnits(healthFactor, 18), // Health factor of the position
        maxSafeDebt: formatUnits(maxSafeDebt, 8), // Maximum safe debt in USD
        liquidationBuffer: formatUnits(liquidationBuffer, 8), // Buffer to liquidation in USD
        liquidationThreshold: formatUnits(currentLiquidationThreshold, 2), // Liquidation threshold in percentage
        borrowPowerUsed: formatUnits(formatBorrowPowerUsed, 2),
        supply: suppliesWithTotals,
        borrow: borrowsWithTotals,
      };
    },
    [address]
  );

  const getAaveData = useCallback(async () => {
    if (!address) return [];

    const responses = await Promise.allSettled(
      Object.entries(AAVE_CONFIG_POOL_ADDRESS_PROVIDER).map(async ([chainId, addressProvider]) => {
        if (typeof addressProvider === 'string') {
          const networkData = await getNetworkData(Number(chainId), 'aave');
          return { chainId: Number(chainId), data: networkData };
        }

        if (typeof addressProvider === 'object') {
          const nestedResults: Record<string, unknown> = {};
          for (const [key] of Object.entries(addressProvider)) {
            nestedResults[key] = await getNetworkData(Number(chainId), 'aave');
          }
          return { chainId: Number(chainId), data: nestedResults };
        }
      })
    );
    return responses
      .filter((response) => response?.status === 'fulfilled')
      .map((response) => response?.value)
      .filter(Boolean);
  }, [getNetworkData]);

  const getSparkData = useCallback(async (): Promise<RootDataType[]> => {
    if (!address) return [];

    const responses = await Promise.allSettled(
      Object.entries(AAVE_CONFIG_POOL_ADDRESS_PROVIDER).map(async ([chainId]) => {
        const networkData = await getNetworkData(Number(chainId), 'spark');
        return {
          chainId: Number(chainId),
          data: networkData,
        } as RootDataType;
      })
    );

    return responses
      .filter((response) => response?.status === 'fulfilled')
      .map((response) => (response as PromiseFulfilledResult<RootDataType>).value)
      .filter(Boolean);
  }, [getNetworkData, address]);

  return { getAaveData, getSparkData };
};
