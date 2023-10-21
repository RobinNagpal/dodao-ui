import { ProjectFragment } from '@/graphql/generated/generated-types';
import { getUsingApi } from '@/utils/api/getUsingApi';

export async function getProjectUsingApi(projectId: string) {
  return await getUsingApi<ProjectFragment>({
    url: process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/projects/' + projectId,
  });
}
