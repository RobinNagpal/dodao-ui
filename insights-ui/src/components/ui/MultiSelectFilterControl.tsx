'use client';

import React from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import AppliedFilterChip from '@/components/ui/AppliedFilterChip';

export interface MultiSelectOption {
  value: string;
  label: string;
  /** Optional one-liner shown under the label inside the dropdown. */
  description?: string;
}

interface MultiSelectFilterControlProps {
  id: string;
  label: string;
  /** Currently selected option values. */
  value: ReadonlyArray<string>;
  options: ReadonlyArray<MultiSelectOption>;
  onChange: (values: string[]) => void;
  /** Shown in the button when nothing is selected. */
  placeholder?: string;
}

/**
 * A multi-select filter tile: a dropdown of options with checkmarks, plus the
 * current selection rendered as removable chips inside the tile. Sized to sit
 * beside `NumericFilterControl` / `DateFilterControl`.
 */
export default function MultiSelectFilterControl({ id, label, value, options, onChange, placeholder = 'Any' }: MultiSelectFilterControlProps): JSX.Element {
  const selected: string[] = [...value];
  const isActive: boolean = selected.length > 0;

  const labelFor = (optionValue: string): string => options.find((o) => o.value === optionValue)?.label ?? optionValue;

  return (
    <div className={`rounded p-2 ${isActive ? 'bg-surface-2 ring-1 ring-amber-500' : 'bg-surface-2'}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="truncate text-xs text-muted" title={label}>
          {label}
        </label>
        {isActive && (
          <button type="button" onClick={() => onChange([])} className="shrink-0 text-[10px] text-muted underline hover:text-heading">
            Clear
          </button>
        )}
      </div>

      <Listbox value={selected} onChange={onChange} multiple>
        <div className="relative">
          <ListboxButton
            id={id}
            className="flex w-full items-center justify-between gap-1 rounded border border-border bg-surface-3 px-1.5 py-1 text-left text-xs text-heading focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <span className="truncate">{isActive ? `${selected.length} selected` : placeholder}</span>
            <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-muted" />
          </ListboxButton>

          <ListboxOptions className="absolute z-20 mt-1 max-h-72 w-full min-w-max overflow-auto rounded border border-border bg-surface py-1 shadow-lg focus:outline-none">
            {options.map((option) => (
              <ListboxOption
                key={option.value}
                value={option.value}
                className="cursor-pointer select-none px-2 py-1.5 text-xs text-body data-[focus]:bg-surface-2"
              >
                {({ selected: isSelected }) => (
                  <div className="flex items-start gap-2">
                    <CheckIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-primary' : 'invisible'}`} />
                    <div>
                      <div className={isSelected ? 'font-medium text-heading' : ''}>{option.label}</div>
                      {option.description && <div className="mt-0.5 max-w-xs text-[10px] text-muted">{option.description}</div>}
                    </div>
                  </div>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      {isActive && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {selected.map((optionValue) => (
            <AppliedFilterChip
              key={optionValue}
              tone="neutral"
              size="sm"
              label={labelFor(optionValue)}
              onRemove={() => onChange(selected.filter((v) => v !== optionValue))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
