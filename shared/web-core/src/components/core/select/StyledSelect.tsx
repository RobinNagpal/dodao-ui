import classNames from '@dodao/web-core/utils/classNames';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment, useEffect } from 'react';
import styled from 'styled-components';

export type StyledSelectItem = { id: string; label: string };

export interface StyledSelectProps {
  label: string;
  showPleaseSelect?: boolean; // controls placeholder text only
  selectedItemId?: string | null;
  items: StyledSelectItem[];
  setSelectedItemId: (id: string | null) => void;
  className?: string;
  helpText?: string;
}

const StyledListboxButton = styled(Listbox.Button)`
  background-color: var(--bg-color);
  color: var(--text-color);
  &:focus {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
  min-height: 36px;
`;

const StyledListboxOptions = styled(Listbox.Options)`
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  .active {
    background-color: var(--primary-color);
  }
`;

const StyledCheckIconSpan = styled.span`
  color: var(--primary-color);
`;

export default function StyledSelect(props: StyledSelectProps) {
  const { items, selectedItemId, setSelectedItemId } = props;

  // Clear invalid selection after items change (safe post-render)
  useEffect(() => {
    if (!items || items.length === 0) {
      if (selectedItemId !== null) setSelectedItemId(null);
      return;
    }
    if (selectedItemId && !items.some((i) => i.id === selectedItemId)) {
      setSelectedItemId(null);
    }
  }, [items, selectedItemId, setSelectedItemId]);

  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null;

  return (
    <div className={classNames(props.className, 'my-2')}>
      {/* Make it controlled + nullable; use null (not undefined) */}
      <Listbox value={selectedItemId ?? null} onChange={(id: string | null) => setSelectedItemId(id)}>
        {({ open }) => (
          <div>
            <Listbox.Label className="block text-sm font-semibold leading-6">{props.label}</Listbox.Label>

            <div className="relative mt-2">
              <StyledListboxButton className="relative w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 sm:text-sm sm:leading-6 ring-gray-400">
                {selectedItem ? (
                  <span className="block truncate">{selectedItem.label}</span>
                ) : (
                  <span className="block truncate text-gray-500">{props.showPleaseSelect ? 'Please Select' : 'Select…'}</span>
                )}
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </StyledListboxButton>

              {/* Only render options when there are items */}
              {items.length > 0 && (
                <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <StyledListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm ring-gray-400">
                    {items.map((item) => (
                      <Listbox.Option
                        key={item.id} // id is always a string now
                        className={({ active }) => classNames(active ? 'active text-white' : '', 'relative cursor-default select-none py-2 pl-3 pr-9')}
                        value={item.id}
                      >
                        {({ selected }) => (
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
              )}

              {props.helpText && <p className="ml-1 mt-2 mb-2 text-sm">{props.helpText}</p>}
            </div>
          </div>
        )}
      </Listbox>
    </div>
  );
}
