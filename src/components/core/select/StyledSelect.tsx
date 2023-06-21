import classNames from '@/utils/classNames';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import styled from 'styled-components';

export type StyledSelectItem = { id: string; label: string };

export interface StyledSelectProps {
  label: string;
  showPleaseSelect?: boolean;
  selectedItemId: string;
  items: StyledSelectItem[];
  setSelectedItemId: (id: string) => void;
  className?: string;
}

const StyledListboxButton = styled(Listbox.Button)`
  //border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  &:focus {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
`;

const StyledListboxOptions = styled(Listbox.Options)`
  background-color: var(--bg-color);
  .active {
    background-color: var(--primary-color);
  }
`;

const StyledCheckIconSpan = styled.span`
  color: var(--primary-color);
`;

export default function StyledSelect(props: StyledSelectProps) {
  const selectedItem = props.items.find((item) => item.id === props.selectedItemId);
  const items = props.showPleaseSelect ? [{ id: undefined, label: 'Please Select' }, ...props.items] : props.items;
  return (
    <div className={props.className + ' mt-2'}>
      <Listbox value={props.selectedItemId} onChange={(itemId) => props.setSelectedItemId(itemId)}>
        {({ open }) => {
          return (
            <div>
              <Listbox.Label className="block text-sm font-medium leading-6">{props.label}</Listbox.Label>
              <div className="relative mt-2">
                <StyledListboxButton className="relative w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 sm:text-sm sm:leading-6 ring-gray-400">
                  {selectedItem && <span className="block truncate">{selectedItem.label}</span>}
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </StyledListboxButton>

                <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <StyledListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ring-gray-400">
                    {items.map((item) => (
                      <Listbox.Option
                        key={item.id}
                        className={({ active }) => classNames(active ? 'active text-white' : '', 'relative cursor-default select-none py-2 pl-3 pr-9')}
                        value={item.id}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>{item.label}</span>

                            {selected ? (
                              <StyledCheckIconSpan className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </StyledCheckIconSpan>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </StyledListboxOptions>
                </Transition>
              </div>
            </div>
          );
        }}
      </Listbox>
    </div>
  );
}
