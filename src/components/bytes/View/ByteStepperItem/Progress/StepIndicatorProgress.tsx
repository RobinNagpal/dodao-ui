import React from 'react';
import styles from './StepIndicatorProgress.module.scss';

type StepIndicatorProgressProps = {
  className?: string;
  steps: number;
  currentStep: number;
};

const StepIndicatorProgress = ({ className, steps, currentStep }: StepIndicatorProgressProps) => {
  return (
    <div className={`${className || ''} ${styles.stepIndicatorContainer}`}>
      {Array.from({ length: steps }).map((_, index) => (
        <div key={index} className={`${styles.stepDot} ${index === currentStep ? styles.activeStepDot : ''}`} />
      ))}
    </div>
  );
};

export default StepIndicatorProgress;
