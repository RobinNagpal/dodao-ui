import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import CheckIcon from '@heroicons/react/24/solid/CheckIcon';
import { useRouter } from 'next/navigation';
import React from 'react';
import styled from 'styled-components';

interface AcquisitionCardProps {
  onSelectAcquisition: (acquisitionId: string) => void;
}

const AcquisitionIconSpan = styled.span`
  background-color: var(--primary-color);
`;

const BorderSpan = styled.span`
  border-color: var(--primary-color);
`;

const TextSpan = styled.span`
  color: var(--primary-color);
`;

const AcquisitionIconDiv = styled.span`
  background-color: var(--primary-color);
`;

const OpenInPopupIcon = styled(ArrowTopRightOnSquareIcon)`
  color: var(--primary-color);
`;

const steps = [
  { name: 'Education', description: 'Tidbit Collections', href: '/tidbits', status: 'complete', id: '1' },
  {
    name: 'Simulations',
    description: 'Show them how',
    href: '/simulations',
    status: 'current',
    id: '2',
  },
  { name: 'Wallet Connect', description: 'Authenticate them', href: '#', status: 'upcoming', id: '3' },
  {
    name: 'Onchain Analysis',
    description: 'Know them if they are relevant',
    href: '#',
    status: 'upcoming',
    id: '4',
  },
  { name: 'Do Action', description: 'Deposit Liquidity', href: '#', status: 'upcoming', id: '5' },
  { name: 'Connect Social Media', description: 'Connect Twitter / Linkedin', href: '#', status: 'upcoming', id: '6' },
  { name: 'Claim Rewards', description: '$50-$100', href: '#', status: 'upcoming', id: '7' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AcquisitionsCard({ onSelectAcquisition }: AcquisitionCardProps) {
  const router = useRouter();

  console.log('steps: ', steps);

  return (
    <div className="border border-gray-200 rounded-xl p-4 flex justify-center">
      <nav aria-label="Progress">
        <ol role="list" className="overflow-hidden">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
              {step.status === 'complete' ? (
                <>
                  {stepIdx !== steps.length - 1 ? (
                    <AcquisitionIconDiv className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 " aria-hidden="true" />
                  ) : null}
                  <div onClick={() => onSelectAcquisition(step.id)} className="group relative flex items-start">
                    <span className="flex h-9 items-center">
                      <AcquisitionIconSpan className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full  ">
                        <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </AcquisitionIconSpan>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                      <span className="text-sm font-medium">{step.name}</span>
                      <span className="text-sm text-gray-500">{step.description}</span>
                    </span>
                  </div>
                </>
              ) : step.status === 'current' ? (
                <>
                  {stepIdx !== steps.length - 1 ? <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" /> : null}
                  <div onClick={() => onSelectAcquisition(step.id)} className="group relative flex items-start" aria-current="step">
                    <span className="flex h-9 items-center" aria-hidden="true">
                      <BorderSpan className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2  bg-white">
                        <AcquisitionIconSpan className="h-2.5 w-2.5 rounded-full " />
                      </BorderSpan>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                      <TextSpan className="text-sm font-medium ">{step.name}</TextSpan>
                      <span className="text-sm text-gray-500">{step.description}</span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {stepIdx !== steps.length - 1 ? <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" /> : null}
                  <div onClick={() => onSelectAcquisition(step.id)} className="group relative flex items-start">
                    <span className="flex h-9 items-center" aria-hidden="true">
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                      </span>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-gray-500">{step.name}</span>
                      <span className="text-sm text-gray-500">{step.description}</span>
                    </span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
