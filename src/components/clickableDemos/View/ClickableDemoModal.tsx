import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ClickableDemoStep, ClickableDemoWithSteps } from '@/graphql/generated/generated-types';
import React, { useEffect, useRef, useState } from 'react';
import tippy from 'tippy.js';

interface ClickableDemoModalProps {
  clickableDemoWithSteps: ClickableDemoWithSteps;
  onClose: () => void;
}

function ClickableDemoModal({ clickableDemoWithSteps, onClose }: ClickableDemoModalProps) {
  const [tooltipObj, setTooltipObj] = useState<ClickableDemoStep>(clickableDemoWithSteps.steps[0]);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);

  useEffect(() => {
    const handleLoad = () => {
      if (!iframe) return; // Ensure the iframe ref is set

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return; // Ensure the iframe document is accessible
      const overlay = iframeDoc.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = `${iframeDoc.documentElement.scrollHeight}px`;
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; // Semi-transparent overlay
      overlay.style.zIndex = '1'; // Ensure it's above other content but below the target

      iframeDoc.body.appendChild(overlay);

      const xpathResult = iframeDoc.evaluate(tooltipObj.selector, iframeDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const target = xpathResult.singleNodeValue as HTMLElement;
      target.style.position = 'relative';
      target.style.zIndex = '2'; // Higher than the overlay's z-index
      target.style.filter = 'brightness(120%)';

      const tooltipContent = document.createElement('div');

      // Add text content or any other elements to your tooltip as needed
      const textElement = document.createElement('p');
      textElement.textContent = tooltipObj.tooltipInfo;
      textElement.style.display = 'inline';
      textElement.style.margin = '0 auto';
      textElement.style.fontSize = '1rem';
      // textElement.style.fontFamily = "sans-serif";
      textElement.style.fontWeight = '300';

      tooltipContent.style.display = 'flex';
      tooltipContent.style.flexDirection = 'column';
      tooltipContent.style.justifyContent = 'space-around';
      tooltipContent.style.minHeight = '130px'; // Set a minimum height for the tooltip
      tooltipContent.style.minWidth = '300px'; // Set a minimum width for the tooltip
      tooltipContent.style.padding = '0 12px'; // Add padding to the tooltip
      tooltipContent.appendChild(textElement);

      // textElement.style.marginBottom = "8px"; // Add some space below the text content

      // Add an <hr> element to serve as a horizontal line
      const horizontalLine = document.createElement('hr');
      horizontalLine.style.borderTop = '1px solid #808080'; // Style the line as needed
      horizontalLine.style.margin = '2px 0'; // Add some space around the line
      // Append the horizontal line before the buttons
      tooltipContent.appendChild(horizontalLine);

      const buttonsRow = document.createElement('div');
      buttonsRow.style.display = 'flex';
      buttonsRow.style.justifyContent = 'space-between';

      // Create the 'Back' button
      const backButton = document.createElement('button');
      backButton.textContent = 'Back';
      backButton.onclick = () => {
        setCurrentTooltipIndex((prevIndex) => {
          const newIndex = prevIndex - 1;
          setTooltipObj(clickableDemoWithSteps.steps[newIndex]);
          return newIndex;
        });
      };

      // Style the 'Back' button
      backButton.style.padding = '5px 10px'; // Padding for a larger click area
      backButton.style.border = 'none'; // Remove default border
      backButton.style.borderRadius = '5px'; // Rounded corners
      backButton.style.backgroundImage = 'linear-gradient(to right, #6e85b7, #b8c0ff)'; // Gradient background
      backButton.style.color = 'white'; // Text color
      backButton.style.fontWeight = 'bold'; // Make the text bold
      backButton.style.cursor = 'pointer'; // Cursor on hover
      backButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; // Box shadow for depth
      backButton.style.transition = 'all 0.3s ease'; // Transition for smooth hover effect

      // Align the button at the bottom left
      backButton.style.marginTop = 'auto';
      backButton.style.alignSelf = 'flex-start';
      backButton.style.marginRight = 'auto';

      // Hover effect
      backButton.onmouseover = () => {
        backButton.style.backgroundImage = 'linear-gradient(to right, #b8c0ff, #6e85b7)';
      };
      backButton.onmouseout = () => {
        backButton.style.backgroundImage = 'linear-gradient(to right, #6e85b7, #b8c0ff)';
      };
      if (currentTooltipIndex === 0) backButton.style.visibility = 'hidden';

      // Append the button to the container
      buttonsRow.appendChild(backButton);

      const indices = document.createElement('span');
      indices.textContent = `${currentTooltipIndex + 1} of ${clickableDemoWithSteps.steps.length}`;

      indices.style.color = '#84868a';
      indices.style.margin = 'auto';
      indices.style.fontSize = 'small';
      indices.style.fontWeight = '300';

      buttonsRow.appendChild(indices);

      // Create the 'Next' button
      const nextButton = document.createElement('button');
      nextButton.textContent = currentTooltipIndex === clickableDemoWithSteps.steps.length - 1 ? 'Complete' : 'Next';
      nextButton.onclick = async () => {
        setCurrentTooltipIndex((prevIndex) => {
          const newIndex = prevIndex + 1;
          setTooltipObj(clickableDemoWithSteps.steps[newIndex]);
          return newIndex;
        });
      };

      // Style the 'Next' button
      nextButton.style.padding = '5px 10px'; // Padding for a larger click area
      nextButton.style.border = 'none'; // Remove default border
      nextButton.style.borderRadius = '5px'; // Rounded corners
      nextButton.style.backgroundImage = 'linear-gradient(to left, #FFB6C1, #FF69B4)'; // Gradient background, pink hues
      nextButton.style.color = 'white'; // Text color
      nextButton.style.fontWeight = 'bold'; // Make the text bold
      nextButton.style.cursor = 'pointer'; // Cursor on hover
      nextButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; // Box shadow for depth
      nextButton.style.transition = 'all 0.3s ease'; // Transition for smooth hover effect

      // Align the button at the bottom right
      nextButton.style.marginTop = 'auto';
      nextButton.style.alignSelf = 'flex-end';
      nextButton.style.marginLeft = 'auto';

      // Hover effect
      nextButton.onmouseover = () => {
        nextButton.style.backgroundImage = 'linear-gradient(to left, #FF69B4, #FFB6C1)';
      };
      nextButton.onmouseout = () => {
        nextButton.style.backgroundImage = 'linear-gradient(to left, #FFB6C1, #FF69B4)';
      };

      if (currentTooltipIndex === clickableDemoWithSteps.steps.length - 1) nextButton.disabled = true;

      // Append the button to the container
      buttonsRow.appendChild(nextButton);

      tooltipContent.appendChild(buttonsRow);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth', // Optional: defines the transition animation
          block: 'center', // Vertical alignment: options are 'start', 'center', 'end', or 'nearest'
          inline: 'nearest', // Horizontal alignment: options are 'start', 'center', 'end', or 'nearest'
        });
        if (typeof tippy === 'function' && target) {
          tippy(target, {
            content: tooltipContent,
            allowHTML: true,
            placement: 'top',
            offset: [0, 10],
            animation: 'shift-toward', // Use the 'scale' animation
            inertia: true,
            duration: [1500, 250],
            delay: [300, 200], // Delay in ms before showing and hiding the tooltip
            interactive: true, // Allow interaction with the tooltip content
            // theme: styles.myCustomTheme,
            animateFill: true,
            showOnCreate: true,
            hideOnClick: false,
            trigger: 'manual',
            theme: 'material',
            // any other Tippy options you want to configure
          });
        }
      }
    };

    const iframe = document.createElement('iframe');
    iframe.src = tooltipObj.url;
    iframe.width = '100%';
    iframe.style.height = 'calc(100vh - 52px)';
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
    };
  }, [clickableDemoWithSteps, currentTooltipIndex, tooltipObj]);

  return (
    <FullScreenModal open={true} onClose={onClose} title={clickableDemoWithSteps.title}>
      <div id="iframe-container"></div>
    </FullScreenModal>
  );
}

export default ClickableDemoModal;
