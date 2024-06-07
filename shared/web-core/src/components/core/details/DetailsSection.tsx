import { Fragment, ReactElement, ReactNode } from 'react';
import { DetailsFieldProps } from '@dodao/web-core/components/core/details/DetailsRow';
import { DetailsHeaderProps } from '@dodao/web-core/components/core/details/DetailsHeader';

// Define a type for the header component
type HeaderType = ReactElement<DetailsHeaderProps>;

// Define a generic type for any number of field components
type FieldsType = ReactElement<DetailsFieldProps>[];

// Use a generic tuple type for children
type ChildrenType = [HeaderType, ...FieldsType];
type ChildrenArray = [HeaderType, ReactElement<DetailsFieldProps>[]];

interface DetailsSectionParams {
  children: ChildrenType | ChildrenArray;
  className?: string;
}

export default function DetailsSection({ children, className = '' }: DetailsSectionParams) {
  // Destructure the first child separately from the rest
  const [header, ...fields] = children;

  return (
    <div className={className}>
      {header}
      <div>
        <dl>
          {fields.map((field, index) => (
            <Fragment key={index}>{field}</Fragment>
          ))}
        </dl>
      </div>
    </div>
  );
}
