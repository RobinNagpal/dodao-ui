import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { ClickableDemoWithSteps, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';

interface ClickableDemoModalProps {
  clickableDemoWithSteps: ClickableDemoWithSteps;
  space: SpaceWithIntegrationsFragment;
  onClose: () => void;
}

function ClickableDemoModal({ clickableDemoWithSteps, space, onClose }: ClickableDemoModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Loading state
  let indexCount = 0;

  useEffect(() => {
    function receiveMessage(event: any) {
      if (event.data.nextButton) {
        setIframeOpacity(indexCount, false);
        indexCount++;
        setIframeOpacity(indexCount, true);
        iframeArr[indexCount].focus();
        handleLoad(indexCount);
      }

      if (event.data.backButton) {
        setIframeOpacity(indexCount, false);
        indexCount--;
        setIframeOpacity(indexCount, true);
        iframeArr[indexCount].focus();
        handleLoad(indexCount);
      }

      if (event.data.completeButton) {
        if (space.type === 'TidbitsSite') {
          router.push(`/`);
        } else {
          router.push(`/clickable-demos`);
        }
      }
    }

    const handleLoad = (index: number) => {
      const iframeArrElement = iframeArr[index];
      const iframeNotPresent = !iframeArrElement;
      if (iframeNotPresent) return; // Ensure the iframe ref is set

      setIsLoading(false); // Hide loader when the iframe is loaded
      const contentWindow = iframeArrElement.contentWindow;

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
      // Lazy load remaining iframes after the first one is loaded
      if (index === 0) {
        lazyLoadRemainingIframes();
      }
    };

    const lazyLoadRemainingIframes = () => {
      for (let i = 1; i < clickableDemoWithSteps.steps.length; i++) {
        iframeArr[i].src = clickableDemoWithSteps.steps[i].url;
      }
    };

    // Function to set iframe opacity
    const setIframeOpacity = (index: number, visible: boolean) => {
      const iframe = iframeArr[index];
      if (iframe) {
        iframe.style.opacity = visible ? '1' : '0';
        iframe.style.pointerEvents = visible ? 'auto' : 'none';
      }
    };

    window.addEventListener('message', receiveMessage);

    // Container where all the iframes will be appended
    const container = document.getElementById('iframe-container');

    const iframeArr: HTMLIFrameElement[] = [];

    for (let i = 0; i < clickableDemoWithSteps.steps.length; i++) {
      iframeArr[i] = document.createElement('iframe');
      if (i === 0) {
        iframeArr[i].src = clickableDemoWithSteps.steps[i].url; // Load only the first iframe initially
      }
      iframeArr[i].width = '100%';
      iframeArr[i].style.opacity = i === 0 ? '1' : '0';
      iframeArr[i].style.pointerEvents = i === 0 ? 'auto' : 'none';
      iframeArr[i].style.transition = 'opacity 0.3s ease-in-out'; // Smooth transition for opacity
      iframeArr[i].style.position = 'absolute'; // Position all iframes on top of each other
      iframeArr[i].style.top = '0';
      iframeArr[i].style.left = '0';
      iframeArr[i].style.height = '93vh';
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
  }, [clickableDemoWithSteps.steps, router, space]);

  return (
    <FullScreenModal open={true} onClose={onClose} title={clickableDemoWithSteps.title}>
      <div id="iframe-container" className="relative w-full h-[93vh]">
        {isLoading && <FullPageLoader></FullPageLoader>}
      </div>
    </FullScreenModal>
  );
}

export default ClickableDemoModal;
