'use client';

import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import ReportLeftNavigation from './report-left-navigation';

interface MobileNavToggleProps {
  report: IndustryTariffReport;
  industryId: TariffIndustryId;
}

export default function MobileNavToggle({ report, industryId }: MobileNavToggleProps) {
  const [open, setOpen] = useState(false);
  const reportTitle = report?.reportCover?.title || `Tariff Report ${industryId}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <Menu className="h-5 w-5" />
          <span>Navigation</span>
        </button>
      </DialogTrigger>
      <DialogContent className="fixed inset-y-0 left-0 z-50 h-full w-[85%] sm:max-w-sm border-r p-0 shadow-lg">
        <DialogTitle>
          <VisuallyHidden>{reportTitle} Navigation</VisuallyHidden>
        </DialogTitle>
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        <div className="h-full">
          <ReportLeftNavigation report={report} industryId={industryId} isMobile={true} onNavItemClick={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
