import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';

export function getThumbnailImageUri(uri: string | null | undefined, gateway: string = gateways[0]) {
  const ipfsGateway = `https://${gateway}`;
  if (!uri) return null;

  if (uri.startsWith('https://d31h13bdjwgzxs.cloudfront.net')) {
    return uri;
  }

  if (!uri.includes('ipfs') && !uri.includes('ipns') && !uri.includes('http')) return `${ipfsGateway}/ipfs/${uri}`;
  const uriScheme = uri.split('://')[0];
  if (uriScheme === 'ipfs') return uri.replace('ipfs://', `${ipfsGateway}/ipfs/`);
  if (uriScheme === 'ipns') return uri.replace('ipns://', `${ipfsGateway}/ipns/`);
  return uri;
}
