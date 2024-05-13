import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ClickableDemoStep, ClickableDemoWithSteps } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';

interface ClickableDemoModalProps {
  clickableDemoWithSteps: ClickableDemoWithSteps;
  onClose: () => void;
}

function ClickableDemoModal({ clickableDemoWithSteps, onClose }: ClickableDemoModalProps) {
  const [tooltipObj, setTooltipObj] = useState<ClickableDemoStep>(clickableDemoWithSteps.steps[0]);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);

  useEffect(() => {
    function receiveMessage(event: any) {
      if (event.data.nextButton) {
        setCurrentTooltipIndex((prevIndex) => {
          const newIndex = prevIndex + 1;
          setTooltipObj(clickableDemoWithSteps.steps[newIndex]);
          return newIndex;
        });
      }

      if (event.data.backButton) {
        setCurrentTooltipIndex((prevIndex) => {
          const newIndex = prevIndex - 1;
          setTooltipObj(clickableDemoWithSteps.steps[newIndex]);
          return newIndex;
        });
      }

      if (event.data.completeButton) {
        console.log('Complete button clicked!');
      }
    }

    const handleLoad = () => {
      if (!iframe) return; // Ensure the iframe ref is set
      iframe.contentWindow!.postMessage(
        {
          elementXPath: tooltipObj.selector,
          tooltipContent: tooltipObj.tooltipInfo,
          tooltipArrayLen: clickableDemoWithSteps.steps.length,
          currentTooltipIndex,
        },
        '*'
      );
    };

    window.addEventListener('message', receiveMessage);
    const iframe = document.createElement('iframe');
    iframe.src = tooltipObj.url;
    iframe.width = '100%';
    iframe.style.height = '93vh';
    iframe.onload = handleLoad;

    // Container where the iframe will be appended
    const container = document.getElementById('iframe-container');

    // Append the iframe to the container
    container!.appendChild(iframe);

    // Cleanup function to remove the iframe
    return () => {
      // Checks if the iframe still exists in the document before attempting to remove it
      if (container!.contains(iframe)) {
        container!.removeChild(iframe);
      }
      window.removeEventListener('message', receiveMessage);
    };
  }, [currentTooltipIndex, tooltipObj]);

  return (
    <FullScreenModal open={true} onClose={onClose} title={clickableDemoWithSteps.title}>
      <div id="iframe-container"></div>
    </FullScreenModal>
  );
}

export default ClickableDemoModal;
