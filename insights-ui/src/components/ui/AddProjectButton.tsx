'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@dodao/web-core/components/core/buttons/Button';

const AddProjectButton: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex justify-end">
      <Button
        onClick={() => {
          router.push(`/crowd-funding/projects/create`);
        }}
        className="m-4"
        variant="contained"
        primary
      >
        Add New Project
      </Button>
    </div>
  );
};

export default AddProjectButton;
