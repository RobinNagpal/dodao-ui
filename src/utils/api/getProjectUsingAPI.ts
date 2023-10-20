import { ProjectFragment } from '@/graphql/generated/generated-types';
import axios from 'axios';

export async function getProjectUsingAPI(projectId: string) {
  const response = await axios.get(process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/projects/' + projectId);

  const project = response?.data as ProjectFragment;

  return response.status === 200 ? project : null;
}
