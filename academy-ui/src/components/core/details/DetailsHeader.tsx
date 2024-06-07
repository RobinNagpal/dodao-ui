import Button from '@/components/core/buttons/Button';
import Link from 'next/link';
import React from 'react';

export interface DetailsHeaderProps {
  header: string;
  subheader?: string;
  editLink?: string;
  className?: string;
}
export default function DetailsHeader(props: DetailsHeaderProps) {
  return (
    <div className={`sm:flex sm:items-center ${props.className || ''}`}>
      <div className="sm:flex-auto">
        <h1 className="font-semibold leading-6 text-2xl px-2">{props.header}</h1>
        {props.subheader && <p className="mt-2 text-sm p-2">{props.subheader}</p>}
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        {props.editLink && (
          <Link href={props.editLink}>
            <Button variant="contained" primary>
              Edit
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
