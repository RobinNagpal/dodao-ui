import { DetailsFieldProps } from '@/components/core/details/DetailsRow';
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
      <div>
        <dl>{props.children[1]}</dl>
      </div>
    </div>
  );
}
