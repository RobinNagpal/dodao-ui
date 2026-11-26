'use client';

import { ML_EVAL_PDF } from '@/components/ml-safety-evaluation/mlEvaluationContent';
import { SAFETY_PDF } from '@/components/robot-safety/robotSafetyContent';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

/** Pages with a printable overview, keyed by path. */
const PAGE_PDFS: Record<string, { href: string; fileName: string }> = {
  '/robot-safety': SAFETY_PDF,
  '/ml-safety-evaluation': ML_EVAL_PDF,
};

/** Extra top-nav button for pages that have one, shown left of "Start a project": the page's PDF overview. */
export default function NavPageAction() {
  const pathname = usePathname();
  const pdf = PAGE_PDFS[pathname?.replace(/\/$/, '') ?? ''];
  if (!pdf) return null;

  return (
    <a
      href={pdf.href}
      download={pdf.fileName}
      className="hidden flex-none items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold text-heading ring-1 ring-inset ring-border hover:bg-surface-2/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
    >
      <DocumentArrowDownIcon className="h-5 w-5" aria-hidden="true" />
      {/* Short label on narrower laptops so the centered menus keep their place */}
      <span className="xl:hidden">PDF</span>
      <span className="hidden xl:inline">Download PDF</span>
    </a>
  );
}
