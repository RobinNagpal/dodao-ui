import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ClickableDemoWithSteps, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClickableDemoModalProps {
  clickableDemoWithSteps: ClickableDemoWithSteps;
  space: SpaceWithIntegrationsFragment;
  onClose: () => void;
}

function ClickableDemoModal({ clickableDemoWithSteps, space, onClose }: ClickableDemoModalProps) {
  const router = useRouter();
  let indexCount = 0;

  useEffect(() => {
    function receiveMessage(event: any) {
      if (event.data.nextButton) {
        iframeArr[indexCount].style.height = '0vh';
        indexCount++;
        iframeArr[indexCount].style.height = '93vh';
        handleLoad(indexCount);
      }

      if (event.data.backButton) {
        iframeArr[indexCount].style.height = '0vh';
        indexCount--;
        iframeArr[indexCount].style.height = '93vh';
        handleLoad(indexCount);
      }

      if (event.data.completeButton) {
        router.push(`/clickable-demos`);
      }
    }
    const handleLoad = (index: number) => {
      const iframeArrElement = iframeArr[index];
      const iframeNotPresent = !iframeArrElement;
      if (iframeNotPresent) return; // Ensure the iframe ref is set

      const contentWindow = iframeArrElement.contentWindow;
      contentWindow!.postMessage(
        {
          type: 'showTooltip',
          elementXPath: clickableDemoWithSteps.steps[index].selector,
          tooltipContent: clickableDemoWithSteps.steps[index].tooltipInfo,
          tooltipArrayLen: clickableDemoWithSteps.steps.length,
          currentTooltipIndex: index,
          buttonColor: space?.themeColors?.primaryColor,
          buttonTextColor: space?.themeColors?.textColor,
          placement: clickableDemoWithSteps.steps[index].placement,
        },
        '*'
      );

      // Set the CSS variables in the iframe
      const parentStyles = window.getComputedStyle(document.body);

      // Collect CSS variables
      const cssVariables = ['--primary-color', '--bg-color', '--text-color', '--link-color', '--heading-color', '--border-color', '--block-bg'];

      const cssValues: any = {};
      cssVariables.forEach((variable) => {
        cssValues[variable] = parentStyles.getPropertyValue(variable);
      });

      // Send the CSS variables to the iframe
      contentWindow!.postMessage({ type: 'setCssVariables', cssValues }, '*');
    };

    window.addEventListener('message', receiveMessage);

    // Container where all the iframes will be appended
    const container = document.getElementById('iframe-container');

    const iframeArr: HTMLIFrameElement[] = [];

    for (let i = 0; i < clickableDemoWithSteps.steps.length; i++) {
      iframeArr[i] = document.createElement('iframe');
      iframeArr[i].src = clickableDemoWithSteps.steps[i].url;
      iframeArr[i].width = '100%';
      iframeArr[i].style.height = i === 0 ? '93vh' : '0vh';
      i === 0
        ? (iframeArr[i].onload = function () {
            handleLoad(i);
          })
        : null;

      // Append the iframe to the container
      container!.appendChild(iframeArr[i]);
    }

    // Cleanup function to remove the iframe
    return () => {
      // Checks if the iframe still exists in the document before attempting to remove it
      for (let i = 0; i < iframeArr.length; i++) {
        if (container!.contains(iframeArr[i])) {
          container!.removeChild(iframeArr[i]);
        }
      }
      window.removeEventListener('message', receiveMessage);
    };
  });

  return (
    <FullScreenModal open={true} onClose={onClose} title={clickableDemoWithSteps.title}>
      <div id="iframe-container"></div>
    </FullScreenModal>
  );
}

export default ClickableDemoModal;
