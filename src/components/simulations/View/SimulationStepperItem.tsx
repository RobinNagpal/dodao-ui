import Button from '@/components/core/buttons/Button';
import SimulationModal from '@/components/simulations/View/SimulationModal';
import { SimulationDetailsFragment, SimulationStepFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-solidity';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-yaml';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LAST_STEP_UUID, UseViewSimulationHelper } from './useViewSimulation';

interface SimulationProps {
  viewSimulationHelper: UseViewSimulationHelper;
  step: SimulationStepFragment;
  simulation: SimulationDetailsFragment;
  submitSimulation: () => Promise<void>;
}

const SimulationContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 1rem;
`;

const SimulationContents = styled.div`
  margin-top: 0.5rem;
  width: 100%;
  height: 100%;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .step-content {
    li {
      margin-bottom: 0.5rem;
    }

    p {
      margin-bottom: 1rem;
    }
  }
`;

const ButtonContainer = styled.div`
  margin-top: 0.5rem;
  width: 100%;
`;

const Simulation = ({ viewSimulationHelper, step, simulation, submitSimulation }: SimulationProps) => {
  const renderer = getMarkedRenderer();

  const [stepContents, setStepContents] = useState<string | null>(null);
  const [postSubmissionContent, setPostSubmissionContent] = useState<string | null>(null);
  const [nextButtonClicked, setNextButtonClicked] = useState(false);
  const [iframeModalOpen, setIframeModalOpen] = useState(!!step.iframeUrl);
  const [currentStep, setCurrentStep] = useState(step);

  useEffect(() => {
    if (step.content) {
      setStepContents(marked.parse(step.content, { renderer }));
    }
  }, [step, renderer]);

  useEffect(() => {
    if (simulation.postSubmissionStepContent) {
      setPostSubmissionContent(marked.parse(simulation.postSubmissionStepContent, { renderer }));
    }
  }, [simulation, renderer]);

  useEffect(() => {
    if (currentStep.uuid !== step.uuid) {
      setCurrentStep(step);
      if (step.iframeUrl) {
        setIframeModalOpen(true);
      }
    }
  }, [step]);

  const isNotFirstStep = step.order !== 0;
  const isLastStep = simulation.steps.length - 2 === step.order;
  const isSimulationCompletedStep = step.uuid === LAST_STEP_UUID;

  async function navigateToNextStep() {
    setNextButtonClicked(true);
    setNextButtonClicked(false);

    if (isLastStep) {
      await submitSimulation();
    }

    viewSimulationHelper.goToNextStep(step);
  }

  function closeSimulationModal() {
    setIframeModalOpen(false);
    navigateToNextStep();
  }

  return (
    <SimulationContainer>
      {stepContents && (
        <SimulationContents>
          <div dangerouslySetInnerHTML={{ __html: stepContents }} className="markdown-body" />
          {isSimulationCompletedStep && <div dangerouslySetInnerHTML={{ __html: postSubmissionContent || '' }} className="step-content markdown-body pt-6" />}
        </SimulationContents>
      )}

      <ButtonContainer>
        {isNotFirstStep && !isSimulationCompletedStep && (
          <Button style={{ float: 'left' }} aria-label="previous" onClick={() => viewSimulationHelper.goToPreviousStep(step)}>
            <span className="mr-2 font-bold">←</span>
            <span className="sm:block previous-text">Previous</span>
          </Button>
        )}
        {!isSimulationCompletedStep && (
          <Button
            style={{ float: 'right', width: '150px' }}
            variant="contained"
            aria-label="next"
            primary
            disabled={viewSimulationHelper.simulationSubmission.isSubmitted}
            onClick={navigateToNextStep}
          >
            <span className="sm:block">{isLastStep ? 'Complete' : 'Next'}</span>
            <span className="ml-2 font-bold">→</span>
          </Button>
        )}
      </ButtonContainer>
      {step?.iframeUrl && (
        <SimulationModal
          title={simulation.name}
          iframeId={`${simulation.id}__${step.uuid}__iframe_id`}
          open={iframeModalOpen}
          onClose={closeSimulationModal}
          iframeUrl={step?.iframeUrl || ''}
        />
      )}
    </SimulationContainer>
  );
};

export default Simulation;
