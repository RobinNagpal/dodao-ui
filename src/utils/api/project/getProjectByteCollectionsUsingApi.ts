import { ProjectByteCollectionFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import { getUsingApi } from '@/utils/api/getUsingApi';

export async function getProjectByteCollectionsUsingApi(projectId: string) {
  return await getUsingApi<ProjectByteCollectionFragment[]>({
    url: process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/projects/' + projectId + '/byte-collections',
  });
}
