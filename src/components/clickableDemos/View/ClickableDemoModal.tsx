import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ClickableDemoStep, ClickableDemoWithSteps } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';

interface ClickableDemoModalProps {
  clickableDemoWithSteps: ClickableDemoWithSteps;
  onClose: () => void;
}

function ClickableDemoModal({ clickableDemoWithSteps, onClose }: ClickableDemoModalProps) {
  const tooltipArray = [
    {
      id: '2',
      order: 2,
      url: 'https://d31h13bdjwgzxs.cloudfront.net/academy/test-academy-eth/ClickableDemos/the_test_academy/1714657919760_arbitrum.html',
      selector: '/html/body/div[1]/nav/div/div/div[2]/div/button',
      tooltipInfo: 'Login Button from Arbitrum!',
    },
    {
      id: '3',
      order: 3,
      url: 'https://d31h13bdjwgzxs.cloudfront.net/academy/test-academy-eth/ClickableDemos/the_test_academy/1714657991837_uniswap.html',
      selector: '/html/body/footer/div/p',
      tooltipInfo: 'This is the Footer tooltip!',
    },
  ];
  const [tooltipObj, setTooltipObj] = useState<ClickableDemoStep>(tooltipArray[0]);
  // const [tooltipObj, setTooltipObj] = useState<ClickableDemoStep>(clickableDemoWithSteps.steps[0]);
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
