export function getCDNImageUrl(url: string | null) {
  if (!url) return '';
  if (url.startsWith('https://d31h13bdjwgzxs.cloudfront.net')) {
    return url;
  }
  if (url.includes('cloudflare-ipfs.com')) {
    return url.replace('cloudflare-ipfs.com/ipfs', 'd31h13bdjwgzxs.cloudfront.net');
  }
  if (url.includes('ipfs://')) {
    return url.replace('ipfs://', 'https://d31h13bdjwgzxs.cloudfront.net/');
  }
  return url;
}
