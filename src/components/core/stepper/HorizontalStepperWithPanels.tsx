'use client';

import PageWrapper from '@/components/core/page/PageWrapper';
import classNames from '@/utils/classNames';
import Link from 'next/link';
import styled from 'styled-components';

import { CheckIcon } from '@heroicons/react/24/solid';

const StyledNav = styled.nav`
  a {
    &.completed-step {
      .completed-icon {
        background-color: var(--primary-color);
      }
    }

    &.current-step {
      > span.current-step-bar {
        background-color: var(--primary-color);
      }
      .current-step-number {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
      .current-step-heading {
        color: var(--primary-color);
      }
    }
  }
`;

export interface HorizontalStepperItem {
  id: string;
  number: string;
  name: string;
  description: string;
  href: string;
  status: 'complete' | 'current' | 'upcoming';
}
export interface HorizontalStepperWithPanelsProps {
  steps: HorizontalStepperItem[];
}
export default function HorizontalStepperWithPanels({ steps }: HorizontalStepperWithPanelsProps) {
  return (
    <div className="lg:border-b lg:border-t lg:border-gray-200">
      <StyledNav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Progress">
        <ol role="list" className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative overflow-hidden lg:flex-1">
              <div
                className={classNames(
                  stepIdx === 0 ? 'rounded-t-md border-b-0' : '',
                  stepIdx === steps.length - 1 ? 'rounded-b-md border-t-0' : '',
                  'overflow-hidden border border-gray-200 lg:border-0'
                )}
              >
                {step.status === 'complete' ? (
                  <Link href={step.href} className="group completed-step">
                    <span
                      className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-500 lg:bottom-0 lg:top-auto lg:h-2 lg:w-full"
                      aria-hidden="true"
                    />
                    <span className={classNames(stepIdx !== 0 ? 'lg:pl-9' : '', 'flex items-start px-6 py-5 text-sm font-medium')}>
                      <span className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full completed-icon">
                          <CheckIcon className="h-6 w-6" aria-hidden="true" />
                        </span>
                      </span>
                      <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                        <span className="text-sm font-medium">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                  </Link>
                ) : step.status === 'current' ? (
                  <Link href={step.href} aria-current="step" className="current-step">
                    <span className="absolute left-0 top-0 h-full w-1 lg:bottom-0 lg:top-auto lg:h-2 lg:w-full current-step-bar" aria-hidden="true" />
                    <span className={classNames(stepIdx !== 0 ? 'lg:pl-9' : '', 'flex items-start px-6 py-5 text-sm font-medium')}>
                      <span className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 current-step-number">
                          <span>{step.number}</span>
                        </span>
                      </span>
                      <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                        <span className="text-sm font-medium current-step-heading">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                  </Link>
                ) : (
                  <Link href={step.href} className="group">
                    <span
                      className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-500 lg:bottom-0 lg:top-auto lg:h-2 lg:w-full"
                      aria-hidden="true"
                    />
                    <span className={classNames(stepIdx !== 0 ? 'lg:pl-9' : '', 'flex items-start px-6 py-5 text-sm font-medium')}>
                      <span className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-500">
                          <span className="text-gray-500">{step.number}</span>
                        </span>
                      </span>
                      <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-gray-500">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                  </Link>
                )}

                {stepIdx !== 0 ? (
                  <>
                    {/* Separator */}
                    <div className="absolute inset-0 left-0 top-0 hidden w-3 lg:block" aria-hidden="true">
                      <svg className="h-full w-full text-gray-300" viewBox="0 0 12 82" fill="none" preserveAspectRatio="none">
                        <path d="M0.5 0V31L10.5 41L0.5 51V82" stroke="currentcolor" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </StyledNav>
    </div>
  );
}
