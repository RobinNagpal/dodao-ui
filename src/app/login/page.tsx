'use client';

import ButtonLarge from '@/components/core/button/ButtonLarge';
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { loginWithMetamask, loginWithCoinbase, loginWithGoogle, loginWithDiscord, loginWithEmailPassword, logout, session, status, active } = useAuth();

  return (
    <div className="w-full flex justify-center">
      <div className="flex-col">
        <div className="mt-2">
          <ButtonLarge variant={'contained'} primary onClick={loginWithMetamask}>
            Login with Metamask
          </ButtonLarge>
        </div>
        <div className="mt-2">
          <ButtonLarge variant={'contained'} primary onClick={loginWithCoinbase}>
            Login with Coinbase
          </ButtonLarge>
        </div>
        <div className="mt-2">
          <ButtonLarge variant={'contained'} primary onClick={loginWithGoogle}>
            Login with Google
          </ButtonLarge>
        </div>
        <div className="mt-2">
          <ButtonLarge variant={'contained'} primary onClick={loginWithDiscord}>
            Login with Discord
          </ButtonLarge>
        </div>
        <div className="mt-2">
          <ButtonLarge variant={'contained'} primary onClick={() => loginWithEmailPassword('email@example.com', 'password123')}>
            Login with Email/Password
          </ButtonLarge>
        </div>

        {session && <p>Welcome, {session?.user?.email}</p>}
        {session && <p>Session, {JSON.stringify(session || {})}</p>}
        {status && <p>Status, {status}</p>}
        {active && <p>Connected with Web3</p>}
        <ButtonLarge variant={'contained'} primary onClick={logout}>
          Logout
        </ButtonLarge>
      </div>
    </div>
  );
}

export default LoginPage;
