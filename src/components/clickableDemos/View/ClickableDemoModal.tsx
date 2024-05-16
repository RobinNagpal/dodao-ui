import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ClickableDemoStep, ClickableDemoWithSteps, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClickableDemoModalProps {
  clickableDemoWithSteps: ClickableDemoWithSteps;
  space: SpaceWithIntegrationsFragment;
  onClose: () => void;
}

function ClickableDemoModal({ clickableDemoWithSteps, space, onClose }: ClickableDemoModalProps) {
  const [tooltipObj, setTooltipObj] = useState<ClickableDemoStep>(clickableDemoWithSteps.steps[0]);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);

  const router = useRouter();

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
        router.push(`/clickable-demos`);
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
          buttonColor: space?.themeColors?.primaryColor,
          buttonTextColor: space?.themeColors?.textColor,
          placement: tooltipObj.placement,
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
