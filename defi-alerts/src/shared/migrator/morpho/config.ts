import { base, mainnet, polygon, unichain } from 'wagmi/chains';

export const MORPHO_CHAIN_IDS = [mainnet.id, base.id, polygon.id, unichain.id] as const;
