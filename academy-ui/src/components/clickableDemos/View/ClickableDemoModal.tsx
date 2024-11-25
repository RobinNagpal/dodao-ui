import { ClickableDemoWithSteps } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
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
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadedSteps, setLoadedSteps] = useState<number[]>([]);

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
        JSON.stringify(
          union([...(JSON.parse(localStorage.getItem(LocalStorageKeys.COMPLETED_CLICKABLE_DEMOS) || '[]') as string[]), clickableDemoWithSteps.id])
        )
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

  useEffect(() => {
    // Initialize loadedSteps with the first six steps
    setLoadedSteps((prevLoadedSteps) => {
      const initialStepsToLoad = [];
      for (let i = 0; i <= 5 && i < clickableDemoWithSteps.steps.length; i++) {
        if (!prevLoadedSteps.includes(i)) {
          initialStepsToLoad.push(i);
        }
      }
      if (initialStepsToLoad.length > 0) {
        return [...prevLoadedSteps, ...initialStepsToLoad];
      } else {
        return prevLoadedSteps;
      }
    });
  }, [clickableDemoWithSteps.steps.length]);

  useEffect(() => {
    // Update loadedSteps when selectedStepNumber changes
    setLoadedSteps((prevLoadedSteps) => {
      const maxToLoad = selectedStepNumber + 5;
      const stepsToLoad = [];
      for (let i = selectedStepNumber; i <= maxToLoad && i < clickableDemoWithSteps.steps.length; i++) {
        if (!prevLoadedSteps.includes(i)) {
          stepsToLoad.push(i);
        }
      }
      if (stepsToLoad.length > 0) {
        return [...prevLoadedSteps, ...stepsToLoad];
      } else {
        return prevLoadedSteps;
      }
    });
  }, [selectedStepNumber, clickableDemoWithSteps.steps.length]);

  const parentStyles = window.getComputedStyle(document.body);
  // Collect CSS variables
  const cssVariables = [
    '--primary-color',
    '--primary-text-color',
    '--bg-color',
    '--text-color',
    '--link-color',
    '--heading-color',
    '--border-color',
    '--block-bg',
  ];

  const cssValues: any = {};
  cssVariables.forEach((variable) => {
    cssValues[variable] = parentStyles.getPropertyValue(variable);
  });

  return (
    <FullScreenModal open={true} onClose={onClose} title={clickableDemoWithSteps.title}>
      <div id="iframe-container" className="relative w-full h-[93vh]">
        {!iframeLoaded && selectedStepNumber === 0 && <FullPageLoader />}
        {loadedSteps.map((index) => {
          const step = clickableDemoWithSteps.steps[index];
          const data = {
            cssValues, // your collected CSS variables
            elementXPath: step.selector,
            tooltipContent: step.tooltipInfo,
            tooltipArrayLen: clickableDemoWithSteps.steps.length,
            currentTooltipIndex: index,
            placement: step.placement,
          };

          const isActive = selectedStepNumber === index;

          const styles: CSSProperties = {
            width: '100%',
            height: '100%',
            minHeight: '93vh',
            border: 'none',
            position: 'absolute',
            left: '0',
            top: '0',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            pointerEvents: isActive ? 'auto' : 'none',
            zIndex: isActive ? 1 : 0,
          };

          const { url } = step;
          const onLoad = index === 0 && !iframeLoaded ? () => setIframeLoaded(true) : undefined;
          return <iframe key={index} id={`iframe-${index}`} style={styles} src={url} name={JSON.stringify(data)} onLoad={onLoad} />;
        })}
      </div>
    </FullScreenModal>
  );
}

export default ClickableDemoModal;
