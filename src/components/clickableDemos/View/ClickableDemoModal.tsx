import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ClickableDemoWithSteps, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ClickableDemoModalProps {
  clickableDemoWithSteps: ClickableDemoWithSteps;
  space: SpaceWithIntegrationsFragment;
  onClose: () => void;
}

function injectScriptLinkTags(htmlContent: string): string {
  // Regular expression for matching the closing head tag
  const closingHeadRegex = /<style>/i;

  // Find the position to insert the tags (after the opening head tag)
  const headEndTagIndex = closingHeadRegex.exec(htmlContent)?.index;

  if (headEndTagIndex) {
    // Construct the script and link tags
    const linkTag1 = `<style>
      .tippy-box[data-theme~='material'] {
    border-radius: 0.7rem;
    border: 1px solid rgb(224, 224, 224);
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
    background-color: #212429;
      }
      .tippy-box[data-theme~="material"][data-placement^="bottom"] > .tippy-arrow::before {
          border-bottom-color: #212429;
      }
      .tippy-box[data-theme~="material"][data-placement^="bottom"] > .tippy-arrow::after {
          content: "";
          position: absolute;
          border-color: transparent;
          border-style: solid;
          border-width: 9px;
          border-bottom-color: rgb(224, 224, 224);
          z-index: -1;
          top: -18px;
          left: -1px;
      }
      .tippy-box[data-theme~="material"][data-placement^="top"] > .tippy-arrow::before {
          border-top-color: #212429;
      }

      .tippy-box[data-theme~="material"][data-placement^="top"] > .tippy-arrow::after {
          content: "";
          position: absolute;
          border-color: transparent;
          border-style: solid;
          border-width: 9px;
          border-bottom-color: rgb(224, 224, 224);
          z-index: -1;
          top: 16px;
          left: -1px;
          rotate: 180deg;
      }
      </style>`;

    const linkTag2 = `<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/animations/shift-toward.css" />`;
    const linkTag3 = `<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/themes/material.css" />`;
    const scriptTag1 = `<script src="https://unpkg.com/@popperjs/core@2"></script>`;
    const scriptTag2 = `<script src="https://unpkg.com/tippy.js@6"></script>`;
    const scriptTag3 = `
      <script defer>
      window.addEventListener('message', (event) => {

        const xpathResult = document.evaluate(
        event.data.elementXPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const target = xpathResult.singleNodeValue;

      const tooltipContent = document.createElement("div");

      // Add text content or any other elements to your tooltip as needed
      const textElement = document.createElement("p");
      textElement.textContent = event.data.tooltipContent;
      textElement.style.display = "inline";
      textElement.style.margin = "0 auto";
      textElement.style.fontSize = "1rem";
      textElement.style.fontFamily = "sans-serif";
      textElement.style.fontWeight = "300";
      textElement.style.textAlign = "center";

      tooltipContent.style.display = "flex";
      tooltipContent.style.flexDirection = "column";
      tooltipContent.style.justifyContent = "space-evenly";
      tooltipContent.style.minHeight = "130px"; // Set a minimum height for the tooltip
      tooltipContent.style.minWidth = "300px"; // Set a minimum width for the tooltip
      tooltipContent.style.padding = "3px 12px"; // Add padding to the tooltip
      tooltipContent.style.zIndex = "9999"; // Set a high z-index to ensure the tooltip is on top
      tooltipContent.appendChild(textElement);

      // textElement.style.marginBottom = "8px"; // Add some space below the text content

      // Add an <hr> element to serve as a horizontal line
      const horizontalLine = document.createElement("hr");
      horizontalLine.style.borderTop = "1px solid #808080"; // Style the line as needed
      horizontalLine.style.margin = "2px 0"; // Add some space around the line
      // Append the horizontal line before the buttons
      tooltipContent.appendChild(horizontalLine);

      const buttonsRow = document.createElement("div");
      buttonsRow.style.display = "flex";
      buttonsRow.style.justifyContent = "space-between";

      // Create the 'Back' button
      const backButton = document.createElement("button");
      backButton.textContent = "Back";
      backButton.onclick = () => {
          const instance = target._tippy;
          instance.destroy();
          event.source.postMessage(
          { backButton: true},
          event.origin,
        );
      };

      // Style the 'Back' button
      backButton.style.padding = "5px 10px"; // Padding for a larger click area
      backButton.style.border = "none"; // Remove default border
      backButton.style.borderRadius = "5px"; // Rounded corners
      backButton.style.backgroundColor =
       event.data.buttonColor;
      backButton.style.color = event.data.buttonTextColor; // Text color
      backButton.style.fontWeight = "bold"; // Make the text bold
      backButton.style.cursor = "pointer"; // Cursor on hover
      backButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // Box shadow for depth
      backButton.style.transition = "all 0.3s ease"; // Transition for smooth hover effect

      // Align the button at the bottom left
      backButton.style.marginTop = "auto";
      backButton.style.alignSelf = "flex-start";
      backButton.style.marginRight = "auto";

      // Hover effect
      backButton.onmouseover = () => {
        backButton.style.opacity = "0.7"; // Set opacity to 0.7 on hover
        };

        backButton.onmouseout = () => {
            backButton.style.opacity = "1"; // Reset opacity to 1 when not hovering
        };

      if (event.data.currentTooltipIndex === 0) backButton.style.visibility = "hidden";

      // Append the button to the container
      buttonsRow.appendChild(backButton);

      const indices = document.createElement("span");
      indices.textContent = \`\${event.data.currentTooltipIndex + 1} of \${
        event.data.tooltipArrayLen
      }\`;

      indices.style.color = "#84868a";
      indices.style.margin = "auto";
      indices.style.fontSize = "small";
      indices.style.fontWeight = "300";

      buttonsRow.appendChild(indices);

      // Create the 'Next' button
      const nextButton = document.createElement("button");
      nextButton.textContent =
        event.data.currentTooltipIndex === event.data.tooltipArrayLen - 1 ? "Complete" : "Next";
      nextButton.onclick = async () => {
        if(nextButton.textContent === "Next"){
          const instance = target._tippy;
          instance.destroy();
          event.source.postMessage(
          { nextButton: true},
          event.origin,
        );
        }
        else {
            event.source.postMessage(
            { completeButton: true},
            event.origin,
            );
        }
      };

      // Style the 'Next' button
      nextButton.style.padding = "5px 10px"; // Padding for a larger click area
      nextButton.style.border = "none"; // Remove default border
      nextButton.style.borderRadius = "5px"; // Rounded corners
      nextButton.style.backgroundColor =
        event.data.buttonColor;
      nextButton.style.color = event.data.buttonTextColor; // Text color
      nextButton.style.fontWeight = "bold"; // Make the text bold
      nextButton.style.cursor = "pointer"; // Cursor on hover
      nextButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // Box shadow for depth
      nextButton.style.transition = "all 0.3s ease"; // Transition for smooth hover effect
      if(nextButton.textContent === "Complete") {
        nextButton.style.maxWidth = "30%";
        backButton.style.maxWidth = "30%";
      }
      else {
        nextButton.style.maxWidth = "20%";
        backButton.style.maxWidth = "20%";
      }

      // Align the button at the bottom right
      nextButton.style.marginTop = "auto";
      nextButton.style.alignSelf = "flex-end";
      nextButton.style.marginLeft = "auto";

      // Hover effect
        nextButton.onmouseover = () => {
            nextButton.style.opacity = "0.7"; // Set opacity to 0.7 on hover
        };

        nextButton.onmouseout = () => {
            nextButton.style.opacity = "1"; // Reset opacity to 1 when not hovering
        };

      // Append the button to the container
      buttonsRow.appendChild(nextButton);

      tooltipContent.appendChild(buttonsRow);

      if(target){
        target.scrollIntoView({
          behavior: "smooth", // Optional: defines the transition animation
          block: "nearest", // Vertical alignment: options are 'start', 'center', 'end', or 'nearest'
          inline: "nearest", // Horizontal alignment: options are 'start', 'center', 'end', or 'nearest'
        });
      }

       tippy(target, {
        allowHTML: true,
        placement: event.data.placement,
        offset: [0, 10],
        animation: "shift-toward", // Use the 'scale' animation
        interactive: true,
        inertia: true,
        duration: 500,
        delay: [200, 0],
        content: tooltipContent,
        appendTo: document.body,
        showOnCreate: true,
        hideOnClick: false,
        trigger: "manual",
        theme: "material",
      });
});
      </script>`;

    // Insert the tags after the opening head tag
    const modifiedHtml = [
      htmlContent.slice(0, headEndTagIndex),
      linkTag1,
      linkTag2,
      linkTag3,
      scriptTag1,
      scriptTag2,
      scriptTag3,
      htmlContent.slice(headEndTagIndex),
    ].join('');

    return modifiedHtml;
  } else {
    console.warn('Unable to find closing head tag in HTML content');
    return htmlContent; // Return unmodified content if head tag not found
  }
}

function ClickableDemoModal({ clickableDemoWithSteps, space, onClose }: ClickableDemoModalProps) {
  const router = useRouter();
  var indexCount = 0;

  useEffect(() => {
    function receiveMessage(event: any) {
      const currentIframe = document.getElementById(`frame${indexCount}`) as HTMLIFrameElement;
      if (event.data.nextButton) {
        currentIframe.style.height = '0vh';
        indexCount++;
        const nextIframe = document.getElementById(`frame${indexCount}`) as HTMLIFrameElement;
        nextIframe.style.height = '93vh';
        handleLoad(nextIframe, indexCount);
      }

      if (event.data.backButton) {
        currentIframe.style.height = '0vh';
        indexCount--;
        const previousIframe = document.getElementById(`frame${indexCount}`) as HTMLIFrameElement;
        previousIframe.style.height = '93vh';
        handleLoad(previousIframe, indexCount);
      }

      if (event.data.completeButton) {
        router.push(`/clickable-demos`);
      }
    }
    const handleLoad = (iframe: HTMLIFrameElement, index: number) => {
      if (!iframe) return; // Ensure the iframe ref is set

      iframe.contentWindow!.postMessage(
        {
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
    };

    const getModifiedHTMLUrl = async (oldUrl: string) => {
      const newBaseUrl = 'https://dodao-prod-public-assets.s3.amazonaws.com';

      // Changing the base URL
      const url = new URL(oldUrl);
      const newUrl = `${newBaseUrl}${url.pathname}`;
      const htmlContent = await axios.get(newUrl, { responseType: 'text' });

      // Manipulate the HTML
      const modifiedHtml = injectScriptLinkTags(htmlContent.data);

      // Create a Blob with the HTML content
      const blob = new Blob([modifiedHtml], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      return blobUrl;
    };

    const initializeIframes = async () => {
      for (let i = 0; i < clickableDemoWithSteps.steps.length; i++) {
        const modifiedHTMLUrl = await getModifiedHTMLUrl(clickableDemoWithSteps.steps[i].url);

        const iframe = document.getElementById(`frame${i}`) as HTMLIFrameElement;
        iframe.src = modifiedHTMLUrl;
        iframe.width = '100%';
        iframe.style.height = i === 0 ? '93vh' : '0';
        iframe.onload = function () {
          handleLoad(iframe, i);
        };
      }
    };

    window.addEventListener('message', receiveMessage);

    initializeIframes();

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  });

  return (
    <FullScreenModal open={true} onClose={onClose} title={clickableDemoWithSteps.title}>
      <div id="iframe-container" style={{ height: '93vh' }}>
        {clickableDemoWithSteps.steps.map((step, index) => (
          <iframe key={step.id} id={`frame${index}`} />
        ))}
      </div>
    </FullScreenModal>
  );
}

export default ClickableDemoModal;
