import Button from '@/components/core/buttons/Button';
import EllipsisDropdown, { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

export interface TableRow {
  columns: (string | ReactNode)[];
  id: string;
  item: any;
}

export interface TableActions {
  items: EllipsisDropdownItem[];
  onSelect: (key: string, item: any) => void;
}

export interface TableProps {
  heading?: string;
  infoText?: string;
  data: TableRow[];
  columnsHeadings: string[];
  columnsWidthPercents: number[];
  onAddNew?: () => void;
  addNewLabel?: string;
  firstColumnBold?: boolean;
  actions?: TableActions;
  noDataText?: string;
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

const FirstColumnCell = styled.td`
  color: var(--heading-color);
`;

const TableCell = styled.td`
  color: var(--text-color);
`;

const TableRow = styled.tr`
  &:nth-child(odd) {
    background: linear-gradient(0deg, rgba(127, 127, 127, 0.2), rgba(127, 127, 127, 0.2)), var(--bg-color);
  }
`;
export function Table(props: TableProps) {
  return (
    <div className="mt-2">
      <div className="sm:flex sm:items-center justify-between">
        {props.heading && (
          <div className="sm:flex-auto">
            <Heading className="font-semibold leading-6">{props.heading}</Heading>
            {props.infoText && <InfoText className="mt-2 text-sm">{props.infoText}</InfoText>}
          </div>
        )}
        {props.onAddNew && (
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button type="button" primary variant="contained" onClick={props.onAddNew}>
              {props.addNewLabel || 'Add New'}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-visible sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            {props.data.length === 0 ? (
              <div className="flex justify-center w-full">
                <div>{props.noDataText || 'No data exists'}</div>
              </div>
            ) : (
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
                <tbody className="divide-y divide-gray-200 text-xs">
                  {props.data.map((row, index) => (
                    <TableRow key={index}>
                      {row.columns.map((cell, index) => {
                        return index === 0 && props.firstColumnBold ? (
                          <FirstColumnCell
                            width={`${props.columnsWidthPercents?.[index] || 100}%`}
                            key={index}
                            className="py-2 pl-4 pr-3 text-xs font-medium sm:pl-0 break-words"
                          >
                            {cell}
                          </FirstColumnCell>
                        ) : (
                          <TableCell key={index} className="px-3 py-2  break-all">
                            {cell}
                          </TableCell>
                        );
                      })}{' '}
                      {props.actions && (
                        <td className="relative py-2 pl-3 pr-4 text-right font-medium sm:pr-0">
                          <EllipsisDropdown
                            items={props.actions.items}
                            onSelect={(key) => {
                              props.actions?.onSelect(key, row.item);
                            }}
                            className="pr-4"
                          />
                        </td>
                      )}
                    </TableRow>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
