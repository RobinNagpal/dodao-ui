'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBasePath, etfBrowseDetailPath, etfBrowsePath } from '@/utils/etf-country-route-utils';
import { ETF_OTHERS_GROUP, getAllEtfGroups, getCategoriesForGroupKey, slugifyEtfCategory } from '@/utils/etf-categorization-utils';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';

interface SidebarGroup {
  key: string;
  name: string;
  categories: ReadonlyArray<{ name: string; slug: string }>;
}

interface SidebarAssetClass {
  label: string;
  slug: string;
}

interface SidebarProvider {
  name: string;
  slug: string;
}

type ActiveRoute =
  | { kind: 'root' }
  | { kind: 'assetClasses'; slug?: string }
  | { kind: 'groups'; groupKey?: string; categorySlug?: string }
  | { kind: 'providers'; slug?: string }
  | { kind: 'other' };

function parseActive(pathname: string, country: EtfSupportedCountry): ActiveRoute {
  const base = etfBasePath(country);
  if (pathname !== base && !pathname.startsWith(`${base}/`)) {
    return { kind: 'other' };
  }
  const rest = pathname.slice(base.length).replace(/^\//, '');
  if (rest === '') return { kind: 'root' };
  const parts = rest.split('/').filter(Boolean);
  if (parts[0] === 'asset-classes') {
    return { kind: 'assetClasses', slug: parts[1] };
  }
  if (parts[0] === 'groups') {
    const groupKey = parts[1];
    const categorySlug = parts[2] === 'categories' ? parts[3] : undefined;
    return { kind: 'groups', groupKey, categorySlug };
  }
  if (parts[0] === 'providers') {
    return { kind: 'providers', slug: parts[1] };
  }
  return { kind: 'other' };
}

const SECTION_KEYS = ['reportSections', 'assetClasses', 'groups', 'providers'] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

const SECTION_LABEL: Record<SectionKey, string> = {
  reportSections: 'Report Sections',
  assetClasses: 'Asset Classes',
  groups: 'ETFs Groups',
  providers: 'Provider',
};

/** Slug → label for the 7 ETF report sub-pages the sidebar surfaces. `''` is the
 *  main report (index page under `/etfs/[exchange]/[etf]`). */
const REPORT_SECTIONS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: '', label: 'Main Report' },
  { slug: 'performance-returns', label: 'Performance Returns' },
  { slug: 'cost-efficiency-team', label: 'Cost & Team' },
  { slug: 'risk-analysis', label: 'Risk Analysis' },
  { slug: 'future-performance-outlook', label: 'Future Outlook' },
  { slug: 'competition', label: 'Competition' },
  { slug: 'holdings', label: 'Holdings' },
];

interface SectionHeaderProps {
  label: string;
  href?: string;
  isOpen: boolean;
  isActive: boolean;
  onToggle: () => void;
}

function SectionHeader({ label, href, isOpen, isActive, onToggle }: SectionHeaderProps) {
  const labelClass = `flex-1 min-w-0 truncate text-sm font-semibold px-2 py-2 rounded ${isActive ? 'text-white' : 'text-gray-200'} ${
    href ? 'hover:bg-white/10 hover:text-white' : ''
  }`;

  return (
    <div className="flex items-center justify-between gap-1">
      {href ? (
        <Link href={href} className={labelClass}>
          {label}
        </Link>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
        aria-expanded={isOpen}
        className="shrink-0 p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10"
      >
        {isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

interface LeafLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  indent?: 1 | 2;
  size?: 'sm' | 'xs';
}

function LeafLink({ href, label, isActive, indent = 1, size = 'sm' }: LeafLinkProps) {
  const padLeft = indent === 1 ? 'pl-4' : 'pl-7';
  const textSize = size === 'xs' ? 'text-xs' : 'text-sm';
  return (
    <Link
      href={href}
      className={`block ${padLeft} pr-2 py-1 ${textSize} rounded truncate border-l-2 ${
        isActive ? 'text-white font-medium bg-white/10 border-[#F59E0B]' : 'text-gray-300 hover:text-white hover:bg-white/10 border-transparent'
      }`}
    >
      {label}
    </Link>
  );
}

interface GroupRowProps {
  group: SidebarGroup;
  groupHref: string;
  isExpanded: boolean;
  isActiveGroup: boolean;
  activeCategorySlug?: string;
  onToggle: () => void;
  buildCategoryHref: (group: SidebarGroup, category: { slug: string }) => string;
}

function GroupRow({ group, groupHref, isExpanded, isActiveGroup, activeCategorySlug, onToggle, buildCategoryHref }: GroupRowProps) {
  const hasCategories = group.categories.length > 0;
  return (
    <li>
      <div className="flex items-start gap-0.5">
        {hasCategories ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={isExpanded ? `Collapse ${group.name}` : `Expand ${group.name}`}
            aria-expanded={isExpanded}
            className="shrink-0 p-0.5 mt-0.5 rounded text-gray-400 hover:text-white hover:bg-white/10"
          >
            {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </button>
        ) : (
          <span aria-hidden="true" className="shrink-0 inline-block h-5 w-5" />
        )}
        <Link
          href={groupHref}
          className={`flex-1 min-w-0 break-words px-1 py-0.5 text-[0.9rem] leading-snug rounded border-l-2 ${
            isActiveGroup && !activeCategorySlug
              ? 'text-white font-medium bg-white/10 border-[#F59E0B]'
              : 'text-gray-200 hover:text-white hover:bg-white/10 border-transparent'
          }`}
        >
          {group.name}
        </Link>
      </div>
      {isExpanded && hasCategories && (
        <ul className="mt-0.5 mb-1 space-y-0.5">
          {group.categories.map((cat) => (
            <li key={cat.slug}>
              <LeafLink
                href={buildCategoryHref(group, cat)}
                label={cat.name}
                isActive={isActiveGroup && activeCategorySlug === cat.slug}
                indent={2}
                size="xs"
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export interface EtfReportSidebarContext {
  /** Uppercased exchange code (e.g. "NYSEARCA"). */
  exchange: string;
  /** Uppercased ETF symbol (e.g. "VOO"). */
  etf: string;
  /** Slug of the active sub-page (e.g. `'risk-analysis'`). Empty/undefined = main report. */
  currentSection?: string;
}

interface EtfListingSidebarProps {
  country: EtfSupportedCountry;
  reportContext?: EtfReportSidebarContext;
}

export default function EtfListingSidebar({ country, reportContext }: EtfListingSidebarProps) {
  const pathname = usePathname();
  const active = useMemo(() => parseActive(pathname, country), [pathname, country]);
  const isReportPage = !!reportContext;

  const groups: SidebarGroup[] = useMemo(
    () =>
      [...getAllEtfGroups(), ETF_OTHERS_GROUP].map((g) => ({
        key: g.key,
        name: g.name,
        categories: getCategoriesForGroupKey(g.key).map((c) => ({ name: c.name, slug: slugifyEtfCategory(c.name) })),
      })),
    []
  );

  const assetClasses: SidebarAssetClass[] = useMemo(
    () =>
      ETF_ASSET_CLASS_OPTIONS.filter((opt) => opt.value !== '').map((opt) => ({
        label: opt.label,
        slug: slugifyEtfTag(opt.value),
      })),
    []
  );

  const assetClassesPath = etfBrowsePath(country, 'asset-classes');
  const groupsIndexPath = etfBasePath(country);
  const providersPath = etfBrowsePath(country, 'providers');
  const reportBasePath = reportContext ? `/etfs/${reportContext.exchange}/${reportContext.etf}` : '';

  // On report pages: Report Sections + Asset Classes open, Groups + Provider closed.
  // On listing pages: Asset Classes + Groups open, Provider open only if currently on a provider page.
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(() => ({
    reportSections: isReportPage,
    assetClasses: true,
    groups: !isReportPage,
    providers: !isReportPage && active.kind === 'providers',
  }));
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (active.kind === 'groups' && active.groupKey) {
      return { [active.groupKey]: true };
    }
    return {};
  });

  useEffect(() => {
    if (active.kind === 'assetClasses') {
      setOpenSections((prev) => (prev.assetClasses ? prev : { ...prev, assetClasses: true }));
    } else if (active.kind === 'groups') {
      setOpenSections((prev) => (prev.groups ? prev : { ...prev, groups: true }));
      if (active.groupKey) {
        const groupKey = active.groupKey;
        setOpenGroups((prev) => (prev[groupKey] ? prev : { ...prev, [groupKey]: true }));
      }
    } else if (active.kind === 'providers') {
      setOpenSections((prev) => (prev.providers ? prev : { ...prev, providers: true }));
    }
  }, [active]);

  const [providers, setProviders] = useState<ReadonlyArray<SidebarProvider> | null>(null);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState(false);
  const providersFetched = useRef(false);

  useEffect(() => {
    if (!openSections.providers || providersFetched.current) return;
    providersFetched.current = true;
    setProvidersLoading(true);
    setProvidersError(false);
    const controller = new AbortController();
    fetch(`/api/${KoalaGainsSpaceId}/etfs-v1/listings/providers-index?country=${encodeURIComponent(country)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<EtfProvidersIndexResponse>;
      })
      .then((data) => {
        setProviders(data.providers.map((name) => ({ name, slug: slugifyEtfTag(name) })));
      })
      .catch((e) => {
        if ((e as { name?: string }).name === 'AbortError') return;
        console.error('EtfListingSidebar: failed to load providers', e);
        setProvidersError(true);
      })
      .finally(() => setProvidersLoading(false));
    return () => controller.abort();
  }, [openSections.providers, country]);

  const toggleSection = (key: SectionKey) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleGroup = (key: string) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const buildCategoryHref = (group: SidebarGroup, cat: { slug: string }) =>
    `${etfBrowseDetailPath(country, 'groups', group.key)}/categories/${encodeURIComponent(cat.slug)}`;

  const currentReportSlug = reportContext?.currentSection ?? '';

  return (
    <nav aria-label="ETF browse navigation" className="text-sm">
      <div className="space-y-1">
        {/* Report Sections — only when rendered inside an ETF detail / report page */}
        {reportContext && (
          <>
            <section>
              <SectionHeader
                label={SECTION_LABEL.reportSections}
                isOpen={openSections.reportSections}
                isActive={false}
                onToggle={() => toggleSection('reportSections')}
              />
              {openSections.reportSections && (
                <ul className="mt-1 space-y-0.5">
                  {REPORT_SECTIONS.map((sec) => (
                    <li key={sec.slug || 'main'}>
                      <LeafLink
                        href={sec.slug ? `${reportBasePath}/${sec.slug}` : reportBasePath}
                        label={sec.label}
                        isActive={currentReportSlug === sec.slug}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="h-px bg-white/10 my-2" />
          </>
        )}

        {/* Asset Classes */}
        <section>
          <SectionHeader
            label={SECTION_LABEL.assetClasses}
            href={assetClassesPath}
            isOpen={openSections.assetClasses}
            isActive={active.kind === 'assetClasses' && !active.slug}
            onToggle={() => toggleSection('assetClasses')}
          />
          {openSections.assetClasses && (
            <ul className="mt-1 space-y-0.5">
              {assetClasses.map((ac) => (
                <li key={ac.slug}>
                  <LeafLink
                    href={etfBrowseDetailPath(country, 'asset-classes', ac.slug)}
                    label={ac.label}
                    isActive={active.kind === 'assetClasses' && active.slug === ac.slug}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="h-px bg-white/10 my-2" />

        {/* Groups */}
        <section>
          <SectionHeader
            label={SECTION_LABEL.groups}
            href={groupsIndexPath}
            isOpen={openSections.groups}
            isActive={active.kind === 'root' || (active.kind === 'groups' && !active.groupKey)}
            onToggle={() => toggleSection('groups')}
          />
          {openSections.groups && (
            <ul className="mt-1 space-y-0.5">
              {groups.map((g) => (
                <GroupRow
                  key={g.key}
                  group={g}
                  groupHref={etfBrowseDetailPath(country, 'groups', g.key)}
                  isExpanded={!!openGroups[g.key]}
                  isActiveGroup={active.kind === 'groups' && active.groupKey === g.key}
                  activeCategorySlug={active.kind === 'groups' ? active.categorySlug : undefined}
                  onToggle={() => toggleGroup(g.key)}
                  buildCategoryHref={buildCategoryHref}
                />
              ))}
            </ul>
          )}
        </section>

        <div className="h-px bg-white/10 my-2" />

        {/* Providers — lazy loaded on first open. Uses the same thin overlay
            scrollbar as the outer rail so we don't get a fat default browser
            scrollbar inside a thin custom one. */}
        <section>
          <SectionHeader
            label={SECTION_LABEL.providers}
            href={providersPath}
            isOpen={openSections.providers}
            isActive={active.kind === 'providers' && !active.slug}
            onToggle={() => toggleSection('providers')}
          />
          {openSections.providers && (
            <ul className="etf-sidebar-scroll mt-1 max-h-80 overflow-y-auto pr-1 space-y-0.5">
              {providersLoading && <li className="px-3 py-1.5 text-xs text-gray-400">Loading providers…</li>}
              {!providersLoading && providersError && <li className="px-3 py-1.5 text-xs text-red-400">Failed to load providers.</li>}
              {!providersLoading && !providersError && providers && providers.length === 0 && (
                <li className="px-3 py-1.5 text-xs text-gray-400">No providers available.</li>
              )}
              {!providersLoading &&
                !providersError &&
                providers?.map((p) => (
                  <li key={p.slug}>
                    <LeafLink
                      href={etfBrowseDetailPath(country, 'providers', p.slug)}
                      label={p.name}
                      isActive={active.kind === 'providers' && active.slug === p.slug}
                      size="xs"
                    />
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </nav>
  );
}
