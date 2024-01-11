import DeleteConfirmationModal from '@/components/app/Modal/DeleteConfirmationModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ProjectFragment, useUpdateArchivedStatusOfProjectMutation } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React, { useState } from 'react';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './ListProjectsHelper.module.scss';
import { groupBy } from 'lodash';

type ListProjectsHelperProps = {
  projects: ProjectFragment[];
  onShowEditModal: (project: ProjectFragment) => void;
};

const ListProjectsHelper: React.FC<ListProjectsHelperProps> = ({ projects, onShowEditModal }) => {
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [updateArchivedStatusOfProjectMutation] = useUpdateArchivedStatusOfProjectMutation();
  const { showNotification } = useNotificationContext();

  const getThreeDotItems = (project: ProjectFragment) => {
    if (project.archived) {
      return [
        { label: 'Edit', key: 'edit' },
        { label: 'Unarchive', key: 'unarchive' },
      ];
    }
    return [
      { label: 'Edit', key: 'edit' },
      { label: 'Archive', key: 'archive' },
    ];
  };

  const updateArchiveStatus = async (projectId: string, archived: boolean) => {
    try {
      await updateArchivedStatusOfProjectMutation({
        variables: {
          projectId: projectId,
          archived: archived,
        },
        refetchQueries: ['Projects'],
      });
      if (archived) {
        showNotification({ message: 'Project archived successfully', type: 'success' });
      } else {
        showNotification({ message: 'Project un-archived successfully', type: 'success' });
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  };

  const groupedProjects = groupBy(projects, 'type');

  return (
    <div className="my-5">
      {Object.keys(groupedProjects).map((type) => (
        <div key={type}>
          <h2 className="text-lg font-semibold my-2">{type} Projects</h2>
          <div className="grid grid-cols-1 xs:grid-cols-1 s:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {groupedProjects[type].map((proj) => (
              <div key={proj.id} className="rounded-lg overflow-hidden shadow-xl">
                <Link href={`/projects/view/${proj.id}/tidbit-collections`}>
                  <div className={`h-[250px] ${styles.card} px-1.5 pt-2 rounded-lg flex flex-col gap-2.5 shadow-xl`}>
                    <div className="rounded relative">
                      <img
                        src={proj.cardThumbnail ?? 'https://picsum.photos/500/300'}
                        alt={proj.name}
                        className="h-[150px] w-full object-cover rounded shadow-[0_10px_13px_-5px_rgba(0,0,0,0.6)]"
                      />
                      <div
                        className="absolute top-0 right-0 m-2"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >
                        <PrivateEllipsisDropdown
                          items={getThreeDotItems(proj)}
                          onSelect={async (key) => {
                            if (key === 'edit') {
                              onShowEditModal(proj);
                            } else if (key === 'archive') {
                              setDeleteProjectId(proj.id);
                              setDeleteProjectId(proj.id);
                            } else if (key === 'unarchive') {
                              console.log('unarchive');
                              updateArchiveStatus(proj.id, false);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className={`${styles.header} mx-2`}>
                      <div className="font-bold">{proj.name}</div>
                      <div className={`text-sm ${styles.details}`}>{proj.excerpt}</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
      {deleteProjectId && (
        <DeleteConfirmationModal
          title={'Delete Project'}
          open={!!deleteProjectId}
          onClose={() => setDeleteProjectId(null)}
          onDelete={() => {
            updateArchiveStatus(deleteProjectId, true);
            setDeleteProjectId(null);
          }}
        />
      )}
    </div>
  );
};

export default ListProjectsHelper;
