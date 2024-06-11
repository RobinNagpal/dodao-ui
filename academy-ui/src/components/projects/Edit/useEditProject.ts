import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { UpsertProjectInput, useProjectQuery, useUpsertProjectMutation } from '@/graphql/generated/generated-types';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useState } from 'react';

export interface ProjectEditType extends Omit<UpsertProjectInput, 'id'> {
  id?: string;
}

export type UseEditProjectHelper = {
  setProjectField: (field: keyof UpsertProjectInput, value: any) => void;
  initialize: () => Promise<void>;
  project: ProjectEditType;
  upsertProject: () => Promise<void>;
  upserting: boolean;
};

export default function useEditProject(projectId?: string): UseEditProjectHelper {
  const { showNotification } = useNotificationContext();
  const [project, setProject] = useState<ProjectEditType>({
    details: '',
    excerpt: '',
    discord: undefined,
    docs: undefined,
    github: undefined,
    telegram: undefined,
    website: undefined,
    id: projectId,
    admins: [],
    adminUsernames: [],
    adminUsernamesV1: [],
    logo: '',
    name: '',
    type: 'DeFi',
    seoMeta: null,
    priority: 50,
  });

  const [upserting, setUpserting] = useState(false);

  const { refetch: queryProject } = useProjectQuery({
    variables: {
      id: projectId!,
    },
    skip: true,
  });

  const [updateProjectMutation] = useUpsertProjectMutation();

  async function initialize() {
    if (projectId) {
      const response = await queryProject();
      const projectResponse = response.data.project;
      if (projectResponse) {
        setProject({
          details: projectResponse.details,
          discord: projectResponse.discord,
          docs: projectResponse.docs,
          excerpt: projectResponse.excerpt,
          github: projectResponse.github,
          telegram: projectResponse.telegram,
          type: projectResponse.type,
          website: projectResponse.website,
          id: projectResponse.id,
          admins: projectResponse.admins,
          adminUsernames: projectResponse.adminUsernames,
          logo: projectResponse.logo,
          name: projectResponse.name,
          adminUsernamesV1: projectResponse.adminUsernamesV1 || [],
          cardThumbnail: projectResponse.cardThumbnail,
          priority: projectResponse.priority,
          seoMeta: {
            description: projectResponse.seoMeta?.description || projectResponse.details,
            keywords: projectResponse.seoMeta?.keywords || [],
            title: projectResponse.seoMeta?.title || projectResponse.name,
          },
        });
      }
    }
  }

  function setProjectField(field: keyof UpsertProjectInput, value: any) {
    setProject((prev) => ({ ...prev, [field]: value }));
  }

  function getProjectInput(projectId: string): UpsertProjectInput {
    return {
      id: projectId,
      details: project.details,
      discord: project.discord,
      docs: project.docs,
      excerpt: project.excerpt,
      github: project.github,
      telegram: project.telegram,
      type: project.type,
      website: project.website,
      admins: project.admins,
      adminUsernames: project.adminUsernames,
      logo: project.logo,
      name: project.name,
      adminUsernamesV1: project.adminUsernamesV1 || [],
      cardThumbnail: project.cardThumbnail,
      priority: project.priority,
      seoMeta: {
        description: project.seoMeta?.description || project.details,
        keywords: project.seoMeta?.keywords || [],
        title: project.seoMeta?.title || project.name,
      },
    };
  }

  async function upsertProject() {
    setUpserting(true);
    try {
      const response = await updateProjectMutation({
        variables: {
          input: getProjectInput(slugify(project.name)),
        },
        refetchQueries: ['Projects'],
      });

      if (response.data) {
        showNotification({ type: 'success', message: 'Project upserted successfully' });
      } else {
        showNotification({ type: 'error', message: 'Error while upserting project' });
      }
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: 'Error while upserting project' });
      setUpserting(false);
      throw error;
    }
    setUpserting(false);
  }

  return {
    project,
    initialize,
    setProjectField,
    upsertProject,
    upserting,
  };
}
