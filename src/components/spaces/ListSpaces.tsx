import Button from '@/components/core/buttons/Button';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { SpaceSummaryFragment, useSpacesQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

const MainDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

const SpacesTable = styled.table`
  border-color: var(--border-color);
  border: 1px solid var(--border-color);
`;
export default function ListSpaces() {
  const { data } = useSpacesQuery();
  return (
    <MainDiv className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="font-semibold leading-6 text-2xl">Spaces</h1>
          <p className="mt-2 text-sm">A list of all the spaces.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href={`space/manage/${ManageSpaceSubviews.EditSpace}`}>
            <Button variant="contained" primary>
              Add Space
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <SpacesTable className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
                      ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
                      Skin
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
                      Admins
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(data?.spaces || []).map((space: SpaceSummaryFragment) => (
                    <tr key={space.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">{space.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{space.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{space.skin}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{space.admins}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`space/manage/${ManageSpaceSubviews.ViewSpace}/${space.id}`}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </SpacesTable>
            </div>
          </div>
        </div>
      </div>
    </MainDiv>
  );
}
