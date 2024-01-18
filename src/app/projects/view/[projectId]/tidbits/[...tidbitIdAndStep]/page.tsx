import ViewProjectByte from '@/components/projects/View/ViewProjectByte';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';

export default async function EntityDetailsPage(props: { params: { projectId: string; viewType: string; tidbitIdAndStep: string[] } }) {
  const space = (await getSpaceServerSide())!;
  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);

  if (project) {
    return <ViewProjectByte tidbitIdAndStep={props.params.tidbitIdAndStep} project={project} />;
  }
  return null;
}
