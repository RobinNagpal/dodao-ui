import { signOut } from 'next-auth/react';

function deleteAllCookies() {
  // Only run in browser environment
  if (typeof document === 'undefined') return;

  document.cookie.split(';').forEach((cookie) => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });
}

export function deleteSimulationSessionInfo() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  deleteAllCookies();
  window?.localStorage?.clear();
}

export async function logoutUser() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  deleteSimulationSessionInfo();

  try {
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
  } catch (error) {
    console.error('Error during signOut:', error);
  }

  // Fallback redirect
  window.location.href = '/login';
}
