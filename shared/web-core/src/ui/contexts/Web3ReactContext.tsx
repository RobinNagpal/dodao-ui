'use client';

import type { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import type { MetaMask } from '@web3-react/metamask';
import type { Network } from '@web3-react/network';

import { coinbaseWallet, hooks as coinbaseWalletHooks } from '@dodao/web-core/ui/auth/login/connectors/coinbaseWallet';
import { hooks as metaMaskHooks, metaMask } from '@dodao/web-core/ui/auth/login/connectors/metaMask';
import { hooks as networkHooks, network } from '@dodao/web-core/ui/auth/login/connectors/network';
import { getName } from '@dodao/web-core/ui/auth/login/utils';

const connectors: [MetaMask | CoinbaseWallet | Network, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
];

function Child() {
  const { connector } = useWeb3React();
  console.log(`Priority Connector is: ${getName(connector as any)}`);
  return null;
}

export default function ProviderExample({ children }: any) {
  return <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>;
}
