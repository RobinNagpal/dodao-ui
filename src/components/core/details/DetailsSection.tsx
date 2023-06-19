import { DetailsFieldProps } from '@/components/core/details/DetailsField';
import { DetailsHeaderProps } from '@/components/core/details/DetailsHeader';
import { ReactElement } from 'react';

export default function DetailsSection(props: { children: [a: ReactElement<DetailsHeaderProps>, b: Array<ReactElement<DetailsFieldProps>>] }) {
  return (
    <div>
      {props.children[0]}
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">{props.children[1]}</dl>
      </div>
    </div>
  );
}
