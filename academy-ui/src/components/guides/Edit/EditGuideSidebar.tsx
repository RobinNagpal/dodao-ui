import { EditGuideType } from '@/components/guides/Edit/editGuideType';
import { UseEditGuideHelper } from '@/components/guides/Edit/useEditGuide';
import { getGuideSidebarIcon } from '@/components/guides/View/GetGuideSidebarIcon';
import { GuideStepFragment } from '@/graphql/generated/generated-types';
import { StepError } from '@dodao/web-core/types/errors/error';
import classNames from '@dodao/web-core/utils/classNames';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import styled, { css } from 'styled-components';

export interface GuideSidebarProps {
  guide: EditGuideType;
  activeStep: GuideStepFragment;
  editGuideHelper: UseEditGuideHelper;
  errorsInSteps?: Record<string, StepError>;
}

const StyledSpan = styled.span<{ showActive: boolean; showSuccess: boolean; showError: boolean }>`
  background-color: var(--border-color);
  color: var(--text-color);
  svg {
    color: var(--text-color);
  }

  ${({ showActive }) =>
    showActive &&
    css`
      background-color: var(--primary-color);
      svg {
        color: white;
      }
    `}

  ${({ showSuccess }) =>
    showSuccess &&
    css`
      background-color: green;
      svg {
        color: white;
      }
    `}


  ${({ showError }) =>
    showError &&
    css`
      background-color: red;
      svg {
        color: white;
      }
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
export default function EditGuideSidebar({ activeStep, guide, editGuideHelper, errorsInSteps }: GuideSidebarProps) {
  return (
    <nav className="flex flex-col w-full">
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {guide.steps.map((step, stepIdx) => {
            const iconBackground = true;
            const Icon = getGuideSidebarIcon(step);
            const stepErrors = errorsInSteps?.[step.uuid];

            const showError = Object.keys(stepErrors?.stepItems || {}).length > 0 && !guide.isPristine;

            const showActive = step.uuid === editGuideHelper.activeStepId;

            const showSuccess = !showError && !guide.isPristine;
            return (
              <li key={step.uuid}>
                <div className={'relative pb-8 '}>
                  {stepIdx !== guide.steps.length ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <StyledSpan
                        showActive={showActive}
                        showSuccess={showSuccess}
                        showError={showError}
                        className={classNames(iconBackground, 'h-8 w-8 rounded-full flex items-center justify-center  ring-white')}
                      >
                        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </StyledSpan>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <StyledAnchor onClick={() => editGuideHelper.updateGuideFunctions.setActiveStep(step.uuid)} isActive={showActive}>
                        {step.stepName}
                      </StyledAnchor>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          <li key="add_step">
            <div className={'relative pb-8 '}>
              <div className="relative flex space-x-3">
                <div>
                  <StyledSpan
                    className="h-8 w-8 rounded-full flex items-center justify-center  ring-white"
                    showError={false}
                    showSuccess={false}
                    showActive={false}
                  >
                    <PlusCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                  </StyledSpan>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <StyledAnchor onClick={() => editGuideHelper.updateGuideFunctions.addStep()} isActive={false}>
                    Add Step
                  </StyledAnchor>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
