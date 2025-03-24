export function isLocalhost(): boolean {
  const nextHost = process.env.NEXT_PUBLIC_VERCEL_URL;

  return nextHost?.includes('localhost') ? true : false;
}
