import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export default async function getApiResponse<T>(space: SpaceWithIntegrationsFragment, url: string): Promise<T> {
  const response = await fetch(process.env.V2_API_SERVER_URL!.replace('/graphql', '') + `/${space.id}/${url}`);
  return (await response.json()) as T;
}
