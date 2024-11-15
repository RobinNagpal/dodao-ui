import getProtocol from './getProtocol';

export default function getSubdomainUrl(spaceId: string) {
  const protocol = getProtocol();
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';

  return `${protocol}://${spaceId}.${hostname}${port}`;
}
