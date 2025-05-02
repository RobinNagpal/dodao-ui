import { Address } from 'viem';
import { mainnet } from 'wagmi/chains';

export type SPARK_CONFIG_TYPE = { [chainId: number]: Address };

// Spark: Protocol Data Provider
export const SPARK_DATA_PROVIDER: SPARK_CONFIG_TYPE = {
  [mainnet.id]: '0xFc21d6d146E6086B8359705C8b28512a983db0cb',
};
// Spark: Oracle
export const SPARK_ORACLE_CONTRACT: SPARK_CONFIG_TYPE = {
  [mainnet.id]: '0x8105f69D9C41644c6A0803fDA7D03Aa70996cFD9',
};

// Spark Protocol: Staking
export const SPARK_STAKING_CONTRACT: SPARK_CONFIG_TYPE = {
  [mainnet.id]: '0xC13e21B648A5Ee794902342038FF3aDAB66BE987',
};
