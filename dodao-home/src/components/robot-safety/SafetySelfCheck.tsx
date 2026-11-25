'use client';

import { CheckIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { ActionLink } from '@/components/home/DoDAOHome/components/SiteUi';
import { Relevance, safetyAreas, SAFETY_CONTACT_MAILTO, selfCheckStatements } from './robotSafetyContent';

const relevanceStyle: Record<Relevance | 'none', { label: string; className: string }> = {
  needed: { label: 'Needed', className: 'bg-primary text-primary-text' },
  maybe: { label: 'Worth checking', className: 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/40' },
  none: { label: 'Not flagged', className: 'bg-surface-2/60 text-muted' },
};

/** Tick what is true for you; the four questions light up as needed or worth checking. */
export default function SafetySelfCheck() {
  const [checked, setChecked] = useState<boolean[]>(() => selfCheckStatements.map(() => false));
  const anyChecked = checked.some(Boolean);

  const relevanceFor = (areaId: string): Relevance | 'none' => {
    let result: Relevance | 'none' = 'none';
    selfCheckStatements.forEach((statement, index) => {
      if (!checked[index]) return;
      const relevance = statement.areas[areaId];
      if (relevance === 'needed') result = 'needed';
      else if (relevance === 'maybe' && result === 'none') result = 'maybe';
    });
    return result;
  };

  const mailto = (() => {
    const lines = selfCheckStatements.filter((_, index) => checked[index]).map((statement) => `- ${statement.text}`);
    if (!lines.length) return SAFETY_CONTACT_MAILTO;
    const body = `Hi DoDAO team,\n\nThese are true for us:\n${lines.join('\n')}\n\nOur robot does: \nWe sell to: \n`;
    return `${SAFETY_CONTACT_MAILTO}&body=${encodeURIComponent(body)}`;
  })();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <fieldset className="lg:col-span-7">
        <legend className="sr-only">Statements that may be true for your company</legend>
        <ul className="space-y-3">
          {selfCheckStatements.map((statement, index) => (
            <li key={statement.text}>
              <label
                className={`flex cursor-pointer items-center gap-4 rounded-2xl p-4 ring-1 ring-inset transition sm:p-5 ${
                  checked[index] ? 'bg-primary/10 ring-primary/50' : 'bg-surface ring-border hover:ring-primary/40'
                }`}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked[index]}
                  onChange={() => setChecked((current) => current.map((value, i) => (i === index ? !value : value)))}
                />
                <span
                  className={`flex h-6 w-6 flex-none items-center justify-center rounded-md ring-1 ring-inset transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                    checked[index] ? 'bg-primary ring-primary' : 'bg-bg ring-border'
                  }`}
                  aria-hidden="true"
                >
                  {checked[index] && <CheckIcon className="h-4 w-4 text-primary-text" />}
                </span>
                <span className="text-base leading-6 text-heading">{statement.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="lg:col-span-5">
        <div className="rounded-3xl bg-surface p-6 ring-1 ring-border sm:p-8 lg:sticky lg:top-24" aria-live="polite">
          <p className="text-sm font-medium text-accent">{anyChecked ? 'Where to start' : 'Your result'}</p>
          <p className="font-display mt-2 text-2xl font-semibold leading-tight text-heading">{anyChecked ? 'Start with these' : 'Tick what is true'}</p>
          <ul className="mt-6 space-y-3">
            {safetyAreas.map((area) => {
              const relevance = relevanceFor(area.id);
              const style = relevanceStyle[relevance];
              return (
                <li key={area.id} className="flex items-center justify-between gap-4">
                  <a href={`#${area.id}`} className="text-[0.95rem] font-medium text-heading hover:text-link">
                    {area.number} · {area.short}
                  </a>
                  <span className={`flex-none rounded-full px-3 py-1 text-xs font-semibold transition ${style.className}`}>{style.label}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-sm leading-6 text-muted">
            {anyChecked
              ? 'Send us your answers and we will tell you which checks apply and what is usually missing at your stage.'
              : 'Six quick statements. Nothing is sent until you choose to email us.'}
          </p>
          <ActionLink href={mailto} className="mt-6 w-full">
            {anyChecked ? 'Email us your answers' : 'Book a free 30-min call'}
          </ActionLink>
        </div>
      </div>
    </div>
  );
}
