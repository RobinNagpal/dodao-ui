import ToolPills, { type ToolPillLink } from '@/components/tariff-cross-links/ToolPills';

export type ChapterToolLink = ToolPillLink;

interface ChapterToolsBarProps {
  links: ChapterToolLink[];
}

// Compact in-card "Tools for this chapter" bar. Renders as a horizontal pill row at the top of the
// chapter article card — lighter than the page-level TariffCrossLinks row so it doesn't compete with
// the article body for attention while still giving quick access to the Tariff Calculator and the
// HTS chapter browser.
export default function ChapterToolsBar({ links }: ChapterToolsBarProps): JSX.Element | null {
  if (links.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-gray-700/60 bg-gray-800/40 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tools for this chapter</span>
      <span aria-hidden className="text-gray-600">
        ·
      </span>
      <ToolPills links={links} />
    </div>
  );
}
