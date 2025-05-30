import { base, mainnet, polygon } from 'wagmi/chains';

export const MORPHO_CHAIN_IDS = [mainnet.id, base.id, polygon.id] as const;
