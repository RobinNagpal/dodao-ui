import { getGuideSidebarIcon } from '@/components/guides/View/GetGuideSidebarIcon';
import { LAST_STEP_UUID, UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFragment, GuideStepFragment } from '@/graphql/generated/generated-types';
import classNames from '@/utils/classNames';
import { useMemo } from 'react';
import styled, { css } from 'styled-components';

export interface GuideSidebarProps {
  guide: GuideFragment;
  viewGuideHelper: UseViewGuideHelper;
  activeStep: GuideStepFragment;
}

const StyledSpan = styled.span<{ showActive: boolean; showSuccess: boolean; showError: boolean }>`
  background-color: var(--block-bg);

  ${({ showSuccess }) =>
    showSuccess &&
    css`
      background-color: green;
    `}

  ${({ showError }) =>
    showError &&
    css`
      background-color: red;
    `}

  ${({ showActive }) =>
    showActive &&
    css`
      background-color: var(--primary-color);
    `}
`;

const StyledAnchor = styled.a<{ isActive: boolean; isDisabled: boolean }>`
  color: var(--text-color);
  cursor: pointer;
  ${({ isActive }) =>
    isActive &&
    css`
      color: var(--primary-color);
    `}

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
    `}
`;
export default function GuideSidebar({ activeStep, guide, viewGuideHelper }: GuideSidebarProps) {
  const showError = useMemo(
    () => !viewGuideHelper.guideSubmission?.isPristine && !viewGuideHelper.isEveryQuestionAnsweredInStep(activeStep.uuid),
    [activeStep.uuid, viewGuideHelper.guideSubmission?.isPristine]
  );

  const showSuccess = useMemo(() => viewGuideHelper.getStepSubmission(activeStep.uuid)?.isCompleted, [activeStep.uuid]);

  function goToStep(order: number) {
    if (guide.steps.length - 1 === order) {
      // we don't want user to navigate to the complete/final step
      if (!viewGuideHelper.guideSubmission.isSubmitted) {
        viewGuideHelper.setActiveStep(order - 1);
      } else {
        viewGuideHelper.setActiveStep(order);
      }
    } else {
      viewGuideHelper.setActiveStep(order);
    }
  }

  return (
    <nav className="flex flex-col w-full">
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {guide.steps.map((step, stepIdx) => {
            const iconBackground = true;
            const Icon = getGuideSidebarIcon(step);
            return (
              <li key={step.uuid}>
                <div className={'relative pb-8 '}>
                  {stepIdx !== guide.steps.length - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <StyledSpan
                        showActive={stepIdx === viewGuideHelper.activeStepOrder}
                        showSuccess={showSuccess}
                        showError={showError}
                        className={classNames(iconBackground, 'h-8 w-8 rounded-full flex items-center justify-center  ring-white')}
                      >
                        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </StyledSpan>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <StyledAnchor
                        onClick={() => goToStep(stepIdx)}
                        isActive={stepIdx === viewGuideHelper.activeStepOrder}
                        isDisabled={step.id === LAST_STEP_UUID || stepIdx === guide.steps.length - 1}
                      >
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
