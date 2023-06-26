import { coinbaseWallet } from '@/app/login/connectors/coinbaseWallet';
import { metaMask } from '@/app/login/connectors/metaMask';
import { Connector } from '@web3-react/types';
import { ethers } from 'ethers';
import { signIn, signOut } from 'next-auth/react';
import { useCallback, useState } from 'react';

export function useAuth() {
  const [web3Selection, setWeb3Selection] = useState<{ connector: Connector } | undefined>(); // ['metamask', 'walletconnect', 'coinbase'
  const [active, setActive] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [processingMetaMask, setProcessingMetaMask] = useState<boolean>(false);
  const [processingCoinbase, setProcessingCoinbase] = useState<boolean>(false);
  const [processingGoogle, setProcessingGoogle] = useState<boolean>(false);
  const [processingDiscord, setProcessingDiscord] = useState<boolean>(false);
  const [processingEmailPassword, setProcessingEmailPassword] = useState<boolean>(false);

  async function onSignInWithCrypto() {
    try {
      if (!window.ethereum) {
        window.alert('Please install MetaMask first.');
        return;
      }

      // Get the wallet provider, the signer and address
      //  see: https://docs.ethers.org/v6/getting-started/#starting-signing
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const publicAddress = await signer.getAddress();

      // Send the public address to generate a nonce associates with our account
      const response = await fetch('/api/auth/crypto/generate-nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: 'dodao-eth-1',
          authProvider: 'crypto',
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
        spaceId: 'dodao-eth-1',
        redirect: false,
      });
    } catch {
      window.alert('Error with signing, please try again.');
    }
  }
  const reloadSession = () => {
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
    // window.close();
  };
  const doSigin = async (loginFn: () => Promise<void>) => {
    try {
      setProcessing(true);
      await loginFn();
      setProcessing(false);
      setActive(true);
      setProcessingMetaMask(false);
      setProcessingCoinbase(false);
      setProcessingGoogle(false);
      setProcessingDiscord(false);
      setProcessingEmailPassword(false);
      reloadSession();
    } catch (error) {
      console.log(error);
      setProcessing(false);
      setProcessingMetaMask(false);
      setProcessingCoinbase(false);
      setProcessingGoogle(false);
      setProcessingDiscord(false);
      setProcessingEmailPassword(false);

      throw error;
    }
  };

  const loginWithMetamask = useCallback(async () => {
    setProcessingMetaMask(true);
    await doSigin(async () => {
      await metaMask.activate();
      await onSignInWithCrypto();
      setWeb3Selection({ connector: metaMask });
    });
  }, []);

  const loginWithCoinbase = useCallback(async () => {
    setProcessingCoinbase(true);
    await doSigin(async () => {
      await coinbaseWallet.activate();
      await onSignInWithCrypto();
      setWeb3Selection({ connector: coinbaseWallet });
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setProcessingGoogle(true);
    await doSigin(async () => {
      await signIn('google', { redirect: false });
    });
  }, []);

  const loginWithDiscord = useCallback(async () => {
    setProcessingDiscord(true);
    await doSigin(async () => {
      await signIn('discord', { redirect: false });
    });
  }, []);

  const loginWithEmailPassword = useCallback(async (email: string, password: string) => {
    setProcessingEmailPassword(true);
    await doSigin(async () => {
      await signIn('credentials', { email, password });
    });
  }, []);

  const logout = useCallback(async () => {
    if (web3Selection?.connector) {
      web3Selection?.connector?.deactivate?.();
    } else {
      await signOut({
        redirect: false,
      });
    }
  }, [web3Selection]);

  return {
    loginWithMetamask,
    loginWithCoinbase,
    loginWithGoogle,
    loginWithDiscord,
    loginWithEmailPassword,
    logout,
    active,
    processing,
    processingMetaMask,
    processingCoinbase,
    processingGoogle,
    processingDiscord,
    processingEmailPassword,
  };
}
