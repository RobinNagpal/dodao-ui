import { getGuideSidebarIcon } from '@/components/guides/View/GetGuideSidebarIcon';
import { LAST_STEP_UUID, UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFragment, GuideStepFragment } from '@/graphql/generated/generated-types';
import classNames from '@/utils/classNames';
import { useMemo } from 'react';
import styles from './GuideSidebar.module.scss';
import { useRouter } from 'next/navigation';
export interface GuideSidebarProps {
  guide: GuideFragment;
  viewGuideHelper: UseViewGuideHelper;
  activeStep: GuideStepFragment;
}

export default function GuideSidebar({ activeStep, guide, viewGuideHelper }: GuideSidebarProps) {
  const router = useRouter();
  const showError = useMemo(
    () => !viewGuideHelper.guideSubmission?.isPristine && !viewGuideHelper.isEveryQuestionAnsweredInStep(activeStep.uuid),
    [activeStep.uuid, viewGuideHelper.guideSubmission?.isPristine]
  );

  function goToStep(order: number) {
    router.replace(`/guides/view/${guide.id}/${order}`);
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

            const showError = !viewGuideHelper.guideSubmission?.isPristine && !viewGuideHelper.isEveryQuestionAnsweredInStep(step.uuid);
            const showSuccess = viewGuideHelper.getStepSubmission(step.uuid)?.isCompleted;
            const showActive = stepIdx === viewGuideHelper.activeStepOrder;

            return (
              <li key={step.uuid}>
                <div className={'relative pb-8 '}>
                  {stepIdx !== guide.steps.length - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-neutral-400" aria-hidden="true" /> : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={classNames(
                          `${styles.styledSpan}`,
                          showSuccess && `${styles.showSuccess}`,
                          showError && `${styles.showError}`,
                          showActive && `${styles.showActive}`,
                          iconBackground,
                          'h-8 w-8 rounded-full flex items-center justify-center'
                        )}
                      >
                        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <a
                        className={classNames(
                          `${styles.styledAnchor}`,
                          showActive && `${styles.isActive}`,
                          step.id === LAST_STEP_UUID || stepIdx === guide.steps.length - 1 ? `${styles.isDisabled}` : ''
                        )}
                        onClick={() => goToStep(stepIdx)}
                      >
                        {step.name}
                      </a>
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
