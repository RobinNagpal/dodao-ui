import { DetailsFieldProps } from '@/components/core/details/DetailsField';
import { DetailsHeaderProps } from '@/components/core/details/DetailsHeader';
import { ReactElement } from 'react';

interface DetailsSectionParams {
  children: [a: ReactElement<DetailsHeaderProps>, b: Array<ReactElement<DetailsFieldProps>>];
  className?: string;
}

export default function DetailsSection(props: DetailsSectionParams) {
  return (
    <div className={`${props.className || ''}`}>
      {props.children[0]}
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">{props.children[1]}</dl>
      </div>
    </div>
  );
}
