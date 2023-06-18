import Button from '@/components/core/buttons/Button';
import Link from 'next/link';
import React from 'react';

export interface DetailsHeaderProps {
  header: string;
  subheader: string;
  editLink: string;
}
export default function DetailsHeader(props: DetailsHeaderProps) {
  return (
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1 className="font-semibold leading-6 text-2xl">{props.header}</h1>
        <p className="mt-2 text-sm">{props.subheader}</p>
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Link href={props.editLink}>
          <Button variant="contained" primary>
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
}
