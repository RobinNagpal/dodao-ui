import { createConfig, fallback, http } from "wagmi";
import {
  arbitrum,
  base,
  Chain,
  mainnet,
  mantle,
  optimism,
  polygon,
  scroll,
  sepolia,
  linea,
  ronin,
  unichain,
} from "wagmi/chains";

export const supportedChains: readonly [Chain, ...Chain[]] = [
  sepolia,
  mainnet,
  polygon,
  arbitrum,
  base,
  optimism,
  scroll,
  mantle,
  linea,
  unichain,
  ronin,
];

export const DEFAULT_CHAIN_ID = supportedChains[1].id;

export const supportedChainsId = supportedChains.map((chain) => chain.id);

export const useDefaultConfig: any = createConfig({
  chains: [
    mainnet,
    polygon,
    arbitrum,
    base,
    optimism,
    scroll,
    mantle,
    linea,
    ronin,
    unichain,
  ],
  transports: {
    [mainnet.id]: fallback([
      http(),
      http("https://rpc.mevblocker.io"),
      http("https://ethereum-rpc.publicnode.com"),
      http("https://eth.rpc.blxrbdn.com"),
      http("https://rpc.ankr.com/eth"),
    ]),
    [polygon.id]: fallback([
      http(),
      http("https://polygon.blockpi.network/v1/rpc/public"),
      http("https://polygon.blockpi.network/v1/rpc/public"),
      http("https://polygon-bor-rpc.publicnode.com"),
      http("https://rpc.ankr.com/polygon"),
    ]),
    [arbitrum.id]: fallback([
      http(),
      http("https://1rpc.io/arb"),
      http("https://arbitrum.meowrpc.com"),
      http("https://arbitrum-one.public.blastapi.io"),
    ]),
    [base.id]: fallback([
      http(),
      http("https://base-mainnet.public.blastapi.io"),
      http("https://mainnet.base.org"),
      http("https://base.drpc.org"),
      http("https://base.blockpi.network/v1/rpc/public"),
      http("https://base.llamarpc.com"),
      http("https://1rpc.io/base"),
    ]),
    [optimism.id]: fallback([
      http(),
      http("https://mainnet.optimism.io"),
      http("https://optimism.rpc.subquery.network/public"),
      http("https://op-pokt.nodies.app"),
      http("https://optimism.gateway.tenderly.co"),
    ]),
    [scroll.id]: fallback([
      http(),
      http("https://rpc.scroll.io"),
      http("https://scroll-rpc.publicnode.com"),
      http("https://1rpc.io/scroll"),
      http("https://scroll-mainnet.public.blastapi.io"),
    ]),
    [mantle.id]: fallback([
      http(),
      http("https://rpc.mantle.xyz"),
      http("https://mantle-mainnet.public.blastapi.io"),
      http("https://mantle-rpc.publicnode.com"),
      http("https://mantle-mainnet.public.blastapi.io"),
    ]),
    [linea.id]: fallback([
      http(),
      http("https://rpc.linea.build"),
      http("https://1rpc.io/linea"),
      http("https://linea.drpc.org"),
    ]),
    [ronin.id]: fallback([
      http(),
      http("https://api.roninchain.com/rpc"),
      http("https://ronin-rpc.publicnode.com"),
      http("https://rpc.ankr.com/ronin"),
    ]),
    [unichain.id]: fallback([
      http(),
      http("https://rpc.unichain.world"),
      http("https://unichain-public-rpc.rpc.defi-kingdoms.com"),
      http("https://unichain.rpc.defi-kingdoms.com"),
    ]),
  },
});

declare global {
  interface BigInt {
    toJSON(): string;
  }
}
