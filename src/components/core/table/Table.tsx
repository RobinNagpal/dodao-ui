import Button from '@/components/core/buttons/Button';
import EllipsisDropdown, { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import React from 'react';
import styled from 'styled-components';

export interface TableRow {
  columns: string[];
  id: string;
  item: any;
}

export interface TableActions {
  items: EllipsisDropdownItem[];
  onSelect: (key: string, item: any) => void;
}

export interface TableProps {
  heading: string;
  infoText?: string;
  data: TableRow[];
  columnsHeadings: string[];
  columnsWidthPercents: number[];
  onAddNew?: () => void;
  addNewLabel?: string;
  firstColumnBold?: boolean;
  actions?: TableActions;
}

const Heading = styled.h1`
  color: var(--heading-color);
`;

const ColumnHeading = styled.th`
  color: var(--heading-color);
`;

const InfoText = styled.p`
  color: var(--text-color);
`;

const AddNewButton = styled(Button)`
  background-color: var(--primary-color);
  color: var(--text-color);
  &:hover {
    background-color: var(--link-color);
  }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--link-color);
  }
`;

const FirstColumnCell = styled.td`
  color: var(--heading-color);
`;

const TableCell = styled.td`
  color: var(--text-color);
`;

export function Table(props: TableProps) {
  return props.data.length === 0 ? (
    <div className="align-center">No Data found</div>
  ) : (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between">
        {props.heading && (
          <div className="sm:flex-auto">
            <Heading className="text-base font-semibold leading-6">{props.heading}</Heading>
            {props.infoText && <InfoText className="mt-2 text-sm">{props.infoText}</InfoText>}
          </div>
        )}
        {props.onAddNew && (
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <AddNewButton type="button" onClick={props.onAddNew}>
              {props.addNewLabel || 'Add New'}
            </AddNewButton>
          </div>
        )}
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-visible sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {props.columnsHeadings.map((heading, index) => (
                    <ColumnHeading key={index} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-3">
                      {heading}
                    </ColumnHeading>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {props.data.map((row, index) => (
                  <tr key={index}>
                    {row.columns.map((cell, index) => {
                      return index === 0 && props.firstColumnBold ? (
                        <FirstColumnCell
                          width={`${props.columnsWidthPercents?.[index] || 100}%`}
                          key={index}
                          className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 break-all"
                        >
                          {cell}
                        </FirstColumnCell>
                      ) : (
                        <TableCell key={index} className="whitespace-nowrap px-3 py-4 text-sm break-all">
                          {cell}
                        </TableCell>
                      );
                    })}
                    {props.actions && (
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <EllipsisDropdown
                          items={props.actions.items}
                          onSelect={(key) => {
                            props.actions?.onSelect(key, row.item);
                          }}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
