import { ReactNode } from 'react';
import EtfListingSidebar, { EtfReportSidebarContext } from '@/components/etfs/EtfListingSidebar';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';

interface EtfSidebarShellProps {
  country: EtfSupportedCountry;
  reportContext?: EtfReportSidebarContext;
  children: ReactNode;
}

// Two-mode responsive shell (pure CSS, no JS toggle, no CLS):
// • 1024–1699px: in-flow flex. Sidebar flush against the viewport's left edge,
//   content uses `lg:-ml-6` so the visible gap between sidebar and content text
//   stays roughly halved on ~1440px laptops.
// • ≥1700px: outer becomes `display: block`; sidebar switches to
//   `position: fixed` inside the left margin so the content goes back to the
//   original max-w-7xl mx-auto centered position. 1696px is the geometric
//   minimum where max-w-7xl + sidebar fit without the sidebar overlapping
//   content text.
// • Below 1024px: sidebar hidden.
export default function EtfSidebarShell({ country, reportContext, children }: EtfSidebarShellProps) {
  return (
    <div className="lg:flex lg:items-start lg:gap-1 min-[1700px]:block">
      <aside className="hidden lg:block w-56 shrink-0 lg:sticky lg:top-[61px] lg:max-h-[calc(100vh-77px)] lg:overflow-y-auto etf-sidebar-scroll border border-white/10 bg-white/[0.02] p-2 rounded-r-lg min-[1700px]:rounded-lg min-[1700px]:fixed min-[1700px]:left-[max(1rem,calc(50vw-848px))] min-[1700px]:top-24 min-[1700px]:max-h-[calc(100vh-7rem)]">
        <EtfListingSidebar country={country} reportContext={reportContext} />
      </aside>
      <div className="lg:flex-1 lg:min-w-0 lg:-ml-6 min-[1700px]:ml-0">{children}</div>
    </div>
  );
}
