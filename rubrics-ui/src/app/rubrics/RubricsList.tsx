'use client';
import React, { useState, useEffect } from 'react';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface Program {
  id: string;
  name: string;
}

interface Rubric {
  id: string;
  name: string;
  summary: string;
}

interface RubricListProps {
  rubrics: Rubric[];
  space: SpaceWithIntegrationsFragment;
}

const RubricList: React.FC<RubricListProps> = ({ rubrics }) => {
  const [programNames, setProgramNames] = useState<Record<string, string[]>>({});
  const columnsHeadings = ['Rubric Name', 'Summary', 'Programs'];
  const columnsWidthPercents = [25, 25, 50];
  const router = useRouter();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const fetchPromises = rubrics.map((rubric: Rubric) =>
          fetch(`${getBaseUrl()}/api/rubrics-program/mapping?id=${rubric.id}&type=rubric`)
            .then((response) => response.json())
            .then((data: Program[]) => ({ id: rubric.id, programs: data }))
        );

        const results = await Promise.all(fetchPromises);

        const rubricNamesMap = results.reduce((acc, { id, programs }) => {
          acc[id] = programs.map((program) => program.name);
          return acc;
        }, {} as Record<string, string[]>);

        setProgramNames(rubricNamesMap);
      } catch (error) {
        console.error('Failed to fetch rubrics:', error);
      }
    };

    fetchPrograms();
  }, [rubrics]);

  const actions: TableActions = {
    items: [
      { key: 'edit', label: 'Edit' },
      { key: 'view', label: 'View' },
      { key: 'rate', label: 'Rate' },
    ],
    onSelect: (key: string, item: Rubric) => {
      if (key === 'view') {
        router.push(`/rubrics/view/${item.id}`);
      } else if (key === 'edit') {
        router.push(`/rubrics/edit/${item.id}`);
      } else if (key === 'rate') {
        router.push(`/rate-rubric/${item.id}`);
      }
    },
  };

  const tableData: TableRow[] = rubrics.map((rubric) => ({
    columns: [
      <Link href={`/rubrics/view/${rubric.id}`} key={`name-${rubric.id}`} passHref>
        {rubric.name}
      </Link>,
      rubric.summary,
      <div key={`programs-${rubric.id}`}>
        {programNames[rubric.id] ? programNames[rubric.id].map((programName, index) => <div key={index}>{programName}</div>) : 'Loading...'}
      </div>,
    ],
    id: rubric.id,
    item: rubric,
  }));

  return (
    <div>
      <Table
        data={tableData}
        columnsHeadings={columnsHeadings}
        columnsWidthPercents={columnsWidthPercents}
        actions={actions}
        noDataText="No rubrics available"
      />
    </div>
  );
};

export default RubricList;
