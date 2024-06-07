import { ProjectByteFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import { getUsingApi } from '@dodao/web-core/utils/api/getUsingApi';

export async function getProjectBytesUsingApi(projectId: string) {
  return await getUsingApi<ProjectByteFragment[]>({
    url: process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/projects/' + projectId + '/bytes',
  });
}
