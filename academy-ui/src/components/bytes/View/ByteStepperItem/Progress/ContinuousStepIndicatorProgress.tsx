// StepIndicatorProgress.tsx

import React from 'react';
import styles from './ContinuousStepIndicatorProgress.module.scss';

type StepIndicatorProgressProps = {
  steps: number;
  currentStep: number;
};

const ContinuousStepIndicatorProgress = ({ steps, currentStep }: StepIndicatorProgressProps) => {
  // Calculate the width of the active step based on current step and total steps
  const activeWidth = (currentStep / steps) * 100;

  return (
    <div className={styles.stepIndicatorContainer}>
      <div className={styles.progressBarBackground}>
        <div className={styles.activeProgressBar} style={{ width: `${activeWidth}%` }} />
      </div>
    </div>
  );
};

export default ContinuousStepIndicatorProgress;
