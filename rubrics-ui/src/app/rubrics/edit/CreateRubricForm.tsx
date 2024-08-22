'use client';

import RubricBasicInfoForm from '@/components/Rubric/RubricEdit/RubricBasicInfoForm';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import { Program } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';

interface CreateRubricFormProps {
  programs: Program[];
  space: SpaceWithIntegrationsFragment;
}

export default function CreateRubricForm({ programs, space }: CreateRubricFormProps) {
  const router = useRouter();
  return <RubricBasicInfoForm space={space} programs={programs} onCreateOrUpdate={(rubricId) => router.push(`/rubrics/edit/${rubricId}`)} />;
}
