import PageWrapper from '@/components/core/page/PageWrapper';
import ListProjectsTopBar from '@/components/projects/List/ListProjectsTopBar';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';
import ListProjectsHelper from './ListProjectsHelper';

export default function ListProjects(props: { space: SpaceWithIntegrationsFragment; projects: ProjectFragment[] }) {
  return (
    <PageWrapper>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <h1 className="font-semibold leading-6 text-2xl">Projects</h1>
            <p className="mt-2 text-sm">A list of all the projects.</p>
          </div>
          <ListProjectsTopBar space={props.space} />
        </div>
        <ListProjectsHelper space={props.space} projects={props.projects} />
      </div>
    </PageWrapper>
  );
}
