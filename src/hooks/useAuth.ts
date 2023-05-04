import { coinbaseWallet } from '@/app/login/connectors/coinbaseWallet';
import { metaMask } from '@/app/login/connectors/metaMask';
import { Connector } from '@web3-react/types';
import { ethers } from 'ethers';
import { Eip1193Provider } from 'ethers/src.ts/providers/provider-browser';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

export function useAuth() {
  const [web3Selection, setWeb3Selection] = useState<{ connector: Connector } | undefined>(); // ['metamask', 'walletconnect', 'coinbase'
  const [active, setActive] = useState<boolean>(false);
  const { data, status } = useSession();

  console.log('useAuth', { data, status });
  async function onSignInWithCrypto() {
    try {
      if (!window.ethereum) {
        window.alert('Please install MetaMask first.');
        return;
      }

      // Get the wallet provider, the signer and address
      //  see: https://docs.ethers.org/v6/getting-started/#starting-signing
      const provider = new ethers.BrowserProvider(window.ethereum as Eip1193Provider);
      const signer = await provider.getSigner();
      const publicAddress = await signer.getAddress();

      // Send the public address to generate a nonce associates with our account
      const response = await fetch('/api/auth/crypto/generate-nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicAddress,
        }),
      });
      const responseData = await response.json();

      // Sign the received nonce
      const signedNonce = await signer.signMessage(responseData.nonce);

      // Use NextAuth to sign in with our address and the nonce
      await signIn('crypto', {
        publicAddress,
        signedNonce,
        callbackUrl: '/',
      });
    } catch {
      window.alert('Error with signing, please try again.');
    }
  }

  const loginWithMetamask = useCallback(async () => {
    await metaMask.activate();
    await onSignInWithCrypto();
    setWeb3Selection({ connector: metaMask });

    setActive(true);
  }, []);

  const loginWithCoinbase = useCallback(async () => {
    await coinbaseWallet.activate();
    await onSignInWithCrypto();
    setWeb3Selection({ connector: coinbaseWallet });
    setActive(true);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await signIn('google');
  }, []);

  const loginWithDiscord = useCallback(async () => {
    await signIn('discord');
  }, []);

  const loginWithEmailPassword = useCallback(async (email: string, password: string) => {
    await signIn('credentials', { email, password });
  }, []);

  const logout = useCallback(async () => {
    if (web3Selection?.connector) {
      web3Selection?.connector?.deactivate?.();
    } else {
      await signOut();
    }
  }, [web3Selection]);

  return {
    loginWithMetamask,
    loginWithCoinbase,
    loginWithGoogle,
    loginWithDiscord,
    loginWithEmailPassword,
    logout,
    session: data,
    status,
    active,
  };
}
