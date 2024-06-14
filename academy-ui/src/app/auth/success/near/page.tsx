'use client';

import withSpace from '@/contexts/withSpace';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { LocalStorageKeys } from '@dodao/web-core/types/deprecated/models/enums';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import * as nearAPI from 'near-api-js';

function NearLoginSuccessful({ space }: { space: SpaceWithIntegrationsFragment }) {
  const searchParams = useSearchParams();

  // http://localhost:3000/auth/success/near?account_id=robinnagpal.near&all_keys=ed25519%3A8osUHJZ48fuNDo6NSfdg4ZF4ChaE7Y3qjoqGKLt9VGwm
  useEffect(() => {
    const doIt = async () => {
      const account_id = searchParams.get('account_id');
      const all_keys = searchParams.get('all_keys');
      const { connect, keyStores, WalletConnection } = nearAPI;
      // connect to NEAR
      const nearConnection = await connect({
        networkId: 'mainnet',
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.mainnet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
      });

      // create wallet connection
      const walletConnection = new WalletConnection(nearConnection, 'dodao');
      const publicKey = await nearConnection.connection.signer.getPublicKey(account_id!);
      console.log('publicKey', publicKey);
      const account = walletConnection.account();
      const accessKeyInfoViews = await account.getAccessKeys();
      accessKeyInfoViews.map((key) => key.public_key);
      console.log('accessKeyInfoViews', JSON.stringify(accessKeyInfoViews, null, 2));
      console.log('all_keys', all_keys);
      console.log('account', account);

      const publicKeys = accessKeyInfoViews.map((key) => key.public_key);
      if (!publicKeys.includes(all_keys!)) {
        console.error('Signature verification failed');
        window.location.href = '/';
        return;
      } else {
        await signIn(
          'near',
          { redirect: false },
          {
            accountId: account_id!,
            allKeys: all_keys!,
            // publicKeys: accessKeyInfoViews.map((key) => key.public_key).join(','),
            spaceId: space.id,
          }
        );
      }

      window.location.href = localStorage.getItem(LocalStorageKeys.NEAR_PRE_REDIRECT_URL) || '/';
    };

    doIt();
  }, []);
  return <FullPageLoader />;
}

export default withSpace(NearLoginSuccessful);
