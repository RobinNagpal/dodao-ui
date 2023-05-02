"use client";

import CoinbaseWalletCard from './components/connectorCards/CoinbaseWalletCard'
import GnosisSafeCard from './components/connectorCards/GnosisSafeCard'
import MetaMaskCard from './components/connectorCards/MetaMaskCard'
import NetworkCard from './components/connectorCards/NetworkCard'
import WalletConnectCard from './components/connectorCards/WalletConnectCard'
import WalletConnectV2Card from './components/connectorCards/WalletConnectV2Card'
import ProviderExample from './components/ProviderExample'


export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-gray-300">Code Snippets</h1>

      <div>
        <>
          <ProviderExample />
          <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
            <MetaMaskCard />
            <WalletConnectV2Card />
            <WalletConnectCard />
            <CoinbaseWalletCard />
            <NetworkCard />
            <GnosisSafeCard />
          </div>
        </>

      </div>


    </div>
  );
}
