import { ClickableDemoWithSteps } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { LocalStorageKeys } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import union from 'lodash/union';
import React, { CSSProperties, useEffect, useState } from 'react';

interface ClickableDemoModalProps {
  clickableDemoWithSteps: ClickableDemoWithSteps;
  space: SpaceWithIntegrationsDto;
  onClose: () => void;
}

function ClickableDemoModal({ clickableDemoWithSteps, space, onClose }: ClickableDemoModalProps) {
  const { showNotification } = useNotificationContext();

  const [selectedStepNumber, setSelectedStepNumber] = useState(0);

  function sendMessageToIframe(stepIndex: number) {
    const iframe: HTMLIFrameElement | null = document.getElementById(`iframe-${stepIndex}`) as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'showTooltip',
        },
        '*'
      );
    }
  }

  function receiveMessage(event: any) {
    if (event.data.nextButton) {
      setSelectedStepNumber((prev) => {
        const next = prev + 1;
        sendMessageToIframe(next);
        return next;
      });
    }

    if (event.data.backButton) {
      setSelectedStepNumber((prev) => {
        const next = prev - 1;
        sendMessageToIframe(next);
        return next;
      });
    }

    if (event.data.completeButton) {
      localStorage.setItem(
        LocalStorageKeys.COMPLETED_CLICKABLE_DEMOS,
        JSON.stringify(union([...JSON.parse(localStorage.getItem(LocalStorageKeys.COMPLETED_CLICKABLE_DEMOS) || '[]'), clickableDemoWithSteps.id]))
      );
      showNotification({
        type: 'success',
        message: "You've successfully completed this demo. Ready for the next one?",
        heading: 'Success 🎉',
      });
      onClose();
    }
  }

  useEffect(() => {
    window.addEventListener('message', receiveMessage);
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []);

  const parentStyles = window.getComputedStyle(document.body);
  // Collect CSS variables
  const cssVariables = ['--primary-color', '--bg-color', '--text-color', '--link-color', '--heading-color', '--border-color', '--block-bg'];

  const cssValues: any = {};
  cssVariables.forEach((variable) => {
    cssValues[variable] = parentStyles.getPropertyValue(variable);
  });

  return (
    <FullScreenModal open={true} onClose={onClose} title={clickableDemoWithSteps.title}>
      <div id="iframe-container" className="relative w-full h-[93vh]">
        {clickableDemoWithSteps.steps.map((step, index) => {
          const i = index;
          // Set the CSS variables in the iframe

          // Prepare the data you want to pass
          const data = {
            cssValues, // your collected CSS variables
            elementXPath: step.selector,
            tooltipContent: step.tooltipInfo,
            tooltipArrayLen: clickableDemoWithSteps.steps.length,
            currentTooltipIndex: i,
            placement: step.placement,
          };

          const { url } = step;
          const styles: CSSProperties = {
            width: '100%',
            height: '100%',
            border: 'none',
            position: 'absolute',
            left: '0',
            top: '0',
            display: selectedStepNumber === index ? 'block' : 'none',
          };

          return <iframe key={index} id={`iframe-${index}`} style={styles} src={url} name={JSON.stringify(data)} />;
        })}
      </div>
    </FullScreenModal>
  );
}

export default ClickableDemoModal;
