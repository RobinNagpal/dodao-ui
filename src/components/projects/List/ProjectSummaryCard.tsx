import styles from '@/components/projects/List/ListProjectsHelper.module.scss';
import ProjectSummaryCardAdminDropdown from '@/components/projects/List/ProjectSummaryCardAdminDropdown';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';

export interface ProjectSummaryCardProps {
  space: SpaceWithIntegrationsFragment;
  project: ProjectFragment;
}

export default function ProjectSummaryCard({ space, project }: ProjectSummaryCardProps) {
  return (
    <div key={project.id} className="rounded-lg overflow-hidden shadow-xl relative">
      <div className="absolute right-1 top-1 z-10">
        <ProjectSummaryCardAdminDropdown space={space} project={project} />
      </div>
      <Link href={`/projects/view/${project.id}/tidbit-collections`}>
        <div className={`h-[250px] ${styles.card} px-1.5 pt-2 rounded-lg flex flex-col gap-2.5 shadow-xl`}>
          <div className="rounded relative">
            <img
              src={project.cardThumbnail ?? 'https://picsum.photos/500/300'}
              alt={project.name}
              className="h-[150px] w-full object-cover rounded shadow-[0_10px_13px_-5px_rgba(0,0,0,0.6)]"
            />
          </div>
          <div className={`${styles.header} mx-2 text-center`}>
            <div className="font-bold">{project.name}</div>
            <div className="text-sm">{project.excerpt}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}
