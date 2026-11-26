import { ArrowRightIcon, CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

/**
 * Pieces shared by the service pages (/robot-safety for robot makers, /ml-safety-evaluation for notified bodies).
 */

export type ServicePdf = { href: string; fileName: string; details: string };

/** Download link for a page's printable overview. `onViewport` is for dark footage or viewport backgrounds. */
export function PdfDownload({ pdf, label, onViewport = false }: { pdf: ServicePdf; label: string; onViewport?: boolean }) {
  return (
    <a
      href={pdf.href}
      download={pdf.fileName}
      className={`group inline-flex items-center gap-3 rounded-2xl p-2 pr-5 ring-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        onViewport ? 'bg-on-viewport/5 ring-on-viewport/20 hover:bg-on-viewport/10' : 'bg-surface/60 ring-border hover:ring-primary/50'
      }`}
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary/15 text-link ring-1 ring-inset ring-primary/40 transition group-hover:bg-primary group-hover:text-primary-text">
        <DocumentArrowDownIcon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className={`block text-sm font-semibold ${onViewport ? 'text-on-viewport' : 'text-heading'}`}>{label}</span>
        <span className={`block text-xs ${onViewport ? 'text-on-viewport-muted' : 'text-muted'}`}>{pdf.details}</span>
      </span>
    </a>
  );
}

export type Role = { name: string; role: string; duties: string[] };

/** Three (or more) role columns joined by labelled arrows; the `highlight` role is drawn in the primary color. */
export function RoleFlow({ roles, highlight, arrowLabels }: { roles: Role[]; highlight: string; arrowLabels: string[] }) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
      {roles.map((role, index) => {
        const isUs = role.name === highlight;
        return (
          <div key={role.name} className="contents">
            <div className={`rounded-3xl p-7 ring-1 ${isUs ? 'bg-primary text-primary-text ring-primary' : 'bg-surface ring-border'}`}>
              <p className={`text-2xl font-semibold ${isUs ? '' : 'text-heading'}`}>{role.name}</p>
              <p className={`text-sm ${isUs ? 'text-primary-text/80' : 'text-accent'}`}>{role.role}</p>
              <ul className="mt-5 space-y-2.5">
                {role.duties.map((duty) => (
                  <li key={duty} className={`flex gap-2.5 text-[0.95rem] leading-6 ${isUs ? 'text-primary-text' : 'text-body'}`}>
                    <CheckCircleIcon className={`mt-0.5 h-5 w-5 flex-none ${isUs ? 'text-primary-text/80' : 'text-link'}`} aria-hidden="true" />
                    {duty}
                  </li>
                ))}
              </ul>
            </div>
            {index < roles.length - 1 && (
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted lg:flex-col lg:px-1">
                <ArrowRightIcon className="h-5 w-5 rotate-90 text-accent lg:rotate-0" aria-hidden="true" />
                <span className="lg:max-w-[5.5rem] lg:text-center">{arrowLabels[index]}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const SIM_VS_REAL = [
  { src: '/robotics/demos/ur-arm-pick-simulation.png', label: 'In simulation', alt: 'A UR robot arm picking a part in our simulation' },
  { src: '/robotics/demos/ur-arm-pick-real.png', label: 'On the real robot', alt: 'The same UR robot arm picking the part in the real cell' },
];

/** The same UR arm task shown in our simulation and on the real robot. */
export function SimVsRealShots() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SIM_VS_REAL.map((shot) => (
        <figure key={shot.src}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-viewport">
            <Image src={shot.src} alt={shot.alt} fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
          </div>
          <figcaption className="mt-2 text-center text-sm font-medium text-muted">{shot.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
