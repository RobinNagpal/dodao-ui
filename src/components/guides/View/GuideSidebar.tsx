import { getGuideSidebarIcon } from '@/components/guides/View/GetGuideSidebarIcon';
import { UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFragment } from '@/graphql/generated/generated-types';
import classNames from '@/utils/classNames';
import { CalendarIcon, ChartPieIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styled, { css } from 'styled-components';

export interface GuideSidebarProps {
  guide: GuideFragment;
  viewGuideHelper: UseViewGuideHelper;
}

const StyledSpan = styled.span<{ isActive: boolean }>`
  background-color: red;
  ${({ isActive }) =>
    isActive &&
    css`
      background-color: var(--primary-color);
    `}
`;

const StyledAnchor = styled.a<{ isActive: boolean }>`
  color: var(--text-color);
  cursor: pointer;
  ${({ isActive }) =>
    isActive &&
    css`
      color: var(--primary-color);
    `}
`;
export default function GuideSidebar({ guide, viewGuideHelper }: GuideSidebarProps) {
  return (
    <nav className="flex flex-col w-full">
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {guide.steps.map((step, stepIdx) => {
            const iconBackground = true;
            const Icon = getGuideSidebarIcon(step);
            return (
              <li key={guide.id}>
                <div className={'relative pb-8 '}>
                  {stepIdx !== guide.steps.length - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <StyledSpan
                        isActive={stepIdx === viewGuideHelper.activeStepOrder}
                        className={classNames(iconBackground, 'h-8 w-8 rounded-full flex items-center justify-center  ring-white')}
                      >
                        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </StyledSpan>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <StyledAnchor onClick={() => viewGuideHelper.setActiveStep(stepIdx)} isActive={stepIdx === viewGuideHelper.activeStepOrder}>
                        {step.name}
                      </StyledAnchor>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
