import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './ListProjectsHelper.module.scss';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import useEditProject from './Edit/useEditProject';

type ListProjectsHelperProps = {
  projects: ProjectFragment[];
  onShowEditModal: (project: ProjectFragment) => void;
  onDelete: () => void;
};

const ListProjectsHelper: React.FC<ListProjectsHelperProps> = ({ projects, onShowEditModal, onDelete }) => {
  const [projectID, setProjectID] = useState<string>();
  const [loading, setLoading] = useState(false);
  const editProjectHelper = useEditProject(projectID);
  const { project, setProjectField, upsertProject, upserting } = editProjectHelper;

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const threeDotItems = [
    { label: 'Edit', key: 'edit' },
    { label: 'Delete', key: 'delete' },
  ];

  const handleDeletion = () => {};

  return (
    <div className="my-5">
      <div className="grid grid-cols-1 xs:grid-cols-1 s:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {projects.map((proj) => (
          <div key={proj.id} className="rounded-lg overflow-hidden shadow-xl">
            {loading ? (
              <SkeletonTheme baseColor="#64748b" enableAnimation={true}>
                <Skeleton height={250} />
              </SkeletonTheme>
            ) : (
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
                        items={threeDotItems}
                        onSelect={async (key) => {
                          setProjectID(proj.id);
                          if (key === 'edit') {
                            onShowEditModal(proj);
                          } else if (key === 'delete') {
                            setProjectID(proj.id);
                            editProjectHelper.initialize();
                            setProjectField('archive', true);
                            await upsertProject();
                            onDelete();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className={`${styles.header} mx-2`}>
                    <div className="font-bold">{proj.name}</div>
                    <div className={`text-sm ${styles.details}`}>Level 1</div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProjectsHelper;
