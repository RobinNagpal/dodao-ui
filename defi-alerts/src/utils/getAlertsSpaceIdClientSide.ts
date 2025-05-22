export async function getAlertsSpaceIdClientSide(): Promise<string> {
  if (typeof window === 'undefined') return 'compound';

  const host = window.location.host.split(':')[0];

  if (host === 'localhost') {
    return 'compound';
  }

  if (host?.includes('defialerts-localhost.xyz')) {
    return host.split('.')[0];
  }

  if (host?.includes('defialerts.xyz') && host !== 'defialerts.xyz' && host !== 'www.defialerts.xyz') {
    return host.split('.')[0];
  }

  return 'compound';
}
