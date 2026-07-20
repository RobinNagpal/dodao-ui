'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import {
  ETF_SORT_FIELD_DEFS,
  getAppliedEtfSort,
  applyEtfSortToParams,
  getEtfFilterDestination,
  EtfSortField,
  type EtfSortOrder,
} from '@/utils/etf-filter-utils';

export default function EtfSortButton(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const applied = getAppliedEtfSort(searchParams);

  const navigate = (field: EtfSortField | null, order: EtfSortOrder): void => {
    const nextParams = applyEtfSortToParams(searchParams, field, order);
    // Grid pages (e.g. /etfs, /etfs/groups/<group>) don't render a sortable ETF
    // list, so — just like filters — route to the filterable listing and carry
    // the path-derived scope (group) along as a filter param.
    const { path, extraParams } = getEtfFilterDestination(pathname);
    for (const [k, v] of Object.entries(extraParams)) {
      if (!nextParams.get(k)) nextParams.set(k, v);
    }
    const qs = nextParams.toString();
    router.push(qs ? `${path}?${qs}` : path);
  };

  const handleSelect = (field: EtfSortField): void => {
    const def = ETF_SORT_FIELD_DEFS.find((d) => d.field === field)!;
    // Re-selecting the active field flips its direction; a new field uses its default.
    const order: EtfSortOrder = applied?.field === field ? (applied.order === 'asc' ? 'desc' : 'asc') : def.defaultOrder;
    navigate(field, order);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium rounded-lg px-4 py-2.5 text-sm shadow-md">
        <ArrowsUpDownIcon className="h-5 w-5" />
        Sort
        {applied && (
          <span className="inline-flex items-center gap-1 bg-primary text-primary-text px-2 py-0.5 font-semibold rounded-full text-xs">
            {applied.def.label}
            {applied.order === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
          </span>
        )}
        <ChevronDownIcon className="h-4 w-4" />
      </MenuButton>

      <MenuItems
        portal={true}
        anchor={{ to: 'bottom end', gap: 8 }}
        className="z-30 w-60 rounded-lg bg-surface border border-border shadow-xl focus:outline-none p-2"
      >
        <div className="px-2 py-1.5 text-muted text-[11px] font-semibold uppercase tracking-wider">Sort by</div>
        {ETF_SORT_FIELD_DEFS.map((def) => {
          const isActive = applied?.field === def.field;
          return (
            <MenuItem key={def.field}>
              <button
                type="button"
                onClick={() => handleSelect(def.field)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm data-[focus]:bg-surface-2 ${
                  isActive ? 'bg-surface-2 text-heading' : 'text-body'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isActive ? <CheckIcon className="h-4 w-4 text-[#F59E0B]" /> : <span className="h-4 w-4" />}
                  {def.label}
                </span>
                {isActive && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    {applied!.order === 'asc' ? (
                      <>
                        <ArrowUpIcon className="h-3.5 w-3.5" />
                        Asc
                      </>
                    ) : (
                      <>
                        <ArrowDownIcon className="h-3.5 w-3.5" />
                        Desc
                      </>
                    )}
                  </span>
                )}
              </button>
            </MenuItem>
          );
        })}
        {applied && (
          <>
            <div className="my-1 border-t border-border" />
            <MenuItem>
              <button
                type="button"
                onClick={() => navigate(null, 'desc')}
                className="w-full rounded-md px-3 py-2 text-left text-xs text-muted data-[focus]:bg-surface-2 data-[focus]:text-heading"
              >
                Clear sort
              </button>
            </MenuItem>
          </>
        )}
        <p className="px-3 pt-1 text-[10px] text-muted">Click the active field to flip direction.</p>
      </MenuItems>
    </Menu>
  );
}
