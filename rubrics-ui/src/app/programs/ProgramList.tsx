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
  summary: string;
}

interface Rubric {
  id: string;
  name: string;
}

interface ProgramListProps {
  programs: Program[];
  space: SpaceWithIntegrationsFragment;
}

const ProgramList: React.FC<ProgramListProps> = ({ programs }) => {
  const [rubricNames, setRubricNames] = useState<Record<string, string[]>>({});
  const columnsHeadings = ['Program Name', 'Summary', 'Rubrics'];
  const columnsWidthPercents = [25, 25, 50];
  const router = useRouter();

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const fetchPromises = programs.map((program) =>
          fetch(`${getBaseUrl()}/api/rubrics-program/mapping?id=${program.id}&type=program`) // Include the type query parameter
            .then((response) => response.json())
            .then((data: Rubric[]) => ({ id: program.id, rubrics: data }))
        );

        const results = await Promise.all(fetchPromises);

        const rubricNamesMap = results.reduce((acc, { id, rubrics }) => {
          acc[id] = rubrics.map((rubric) => rubric.name);
          return acc;
        }, {} as Record<string, string[]>);

        setRubricNames(rubricNamesMap);
      } catch (error) {
        console.error('Failed to fetch rubrics:', error);
      }
    };

    fetchRubrics();
  }, [programs]);

  const actions: TableActions = {
    items: [
      { key: 'edit', label: 'Edit' },
      { key: 'view', label: 'View' },
    ],
    onSelect: (key: string, item: Program) => {
      if (key === 'view') {
        router.push(`/programs/view/${item.id}`);
      } else if (key === 'edit') {
        router.push(`/programs/edit/${item.id}`);
      }
    },
  };

  const tableData: TableRow[] = programs.map((program) => ({
    columns: [
      <Link href={`/programs/view/${program.id}`} key={`name-${program.id}`} passHref>
        {program.name}
      </Link>,
      program.summary,
      <div key={`rubrics-${program.id}`}>
        {rubricNames[program.id] ? rubricNames[program.id].map((rubricName, index) => <div key={index}>{rubricName}</div>) : 'Loading...'}
      </div>,
    ],
    id: program.id,
    item: program,
  }));

  return (
    <div>
      <Table
        data={tableData}
        columnsHeadings={columnsHeadings}
        columnsWidthPercents={columnsWidthPercents}
        actions={actions}
        noDataText="No programs available"
      />
    </div>
  );
};

export default ProgramList;
