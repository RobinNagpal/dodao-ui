'use client';

import ViewProjectByte from '@/components/projects/View/ViewProjectByte';
import { useProjectQuery } from '@/graphql/generated/generated-types';

export default function EntityDetailsPage(props: { params: { projectId: string; viewType: string; entityIdAndStep: string[] } }) {
  const { data: project } = useProjectQuery({
    variables: {
      id: props.params.projectId,
    },
  });

  if (props.params.viewType === 'tidbits' && project) {
    return <ViewProjectByte params={props.params} project={project.project!} />;
  }
  return <div>Tidbit Collections</div>;
}
