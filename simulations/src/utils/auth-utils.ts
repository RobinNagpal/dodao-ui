import { signOut } from 'next-auth/react';

function deleteAllCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });
}
export function deleteSimulationSessionInfo() {
  deleteAllCookies();
  window?.localStorage?.clear();
}

export async function logoutUser() {
  deleteSimulationSessionInfo();
  if (window?.location?.pathname !== '/login') {
    await signOut({
      redirect: true,
      callbackUrl: '/login',
    });
  } else {
    await signOut({
      redirect: false,
    });
  }

  signOut();
}
