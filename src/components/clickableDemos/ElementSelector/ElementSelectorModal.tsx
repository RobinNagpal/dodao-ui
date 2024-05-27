import React, { useEffect } from 'react';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { Space } from '@/graphql/generated/generated-types';
import axios from 'axios';

interface Props {
  space: Space;
  showModal: boolean;
  fileUrl: string;
  onLoading?: (loading: boolean) => void;
  onInput?: (imageUrl: string) => void;
  setShowModal: (showModal: boolean) => void;
}

export default function ElementSelectorModal({ space, showModal, fileUrl, onInput, setShowModal }: Props) {
  useEffect(() => {
    function receiveMessage(event: any) {
      if (event.data.xpath) setShowModal(false);
      onInput!(event.data.xpath);
    }

    const handleLoad = (iframe: HTMLIFrameElement) => {
      if (!iframe) return;

      iframe.contentWindow!.postMessage(
        {
          buttonColor: space?.themeColors?.primaryColor,
          buttonTextColor: space?.themeColors?.textColor,
          hoverColor: space?.themeColors?.bgColor,
          selectedColor: space?.themeColors?.primaryColor,
        },
        '*'
      );
    };

    const modifyHTMLFile = async () => {
      const newBaseUrl = 'https://dodao-prod-public-assets.s3.amazonaws.com';

      // Changing the base URL
      const url = new URL(fileUrl);
      const newUrl = `${newBaseUrl}${url.pathname}`;
      const htmlContent = await axios.get(newUrl, { responseType: 'text' });

      // Manipulate the HTML
      const modifiedHtml = injectScriptTag(htmlContent.data);

      // Create a Blob with the HTML content
      const blob = new Blob([modifiedHtml], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      window.addEventListener('message', receiveMessage);

      // Container where the iframe will be appended
      const container = document.getElementById('iframe-container');

      const iframe = document.createElement('iframe');
      iframe.src = blobUrl;
      iframe.width = '100%';
      iframe.style.height = '93vh';
      iframe.onload = function () {
        handleLoad(iframe);
      };

      container?.append(iframe);
    };

    if (fileUrl) {
      modifyHTMLFile();
    }
  }, [showModal, fileUrl]);

  function injectScriptTag(htmlContent: string): string {
    // Regular expression for matching the closing head tag
    const closingHeadRegex = /<style>/i;

    // Find the position to insert the tags (after the opening head tag)
    const headEndTagIndex = closingHeadRegex.exec(htmlContent)?.index;

    if (headEndTagIndex) {
      // Construct the script tag
      const scriptTag = `
      <script defer>
        window.addEventListener('message', (event) => {

        let selectedElement = null;
        let final_xpath = null;
        document.body.style.cursor = 'pointer';
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.cursor = 'pointer';
        });
        const button = document.createElement('button');

        // Set the button's text
                    button.textContent = 'Select';

                    // Apply styles directly in JavaScript
                    button.style.position = 'fixed';
                    button.style.bottom = '10px';
                    button.style.left = '10px';
                    button.style.padding = '10px 20px';
                    button.style.backgroundColor = event.data.buttonColor;
                    button.style.color = event.data.textColor;
                    button.style.border = 'none';
                    button.style.borderRadius = '5px';
                    button.style.cursor = 'pointer';
                    button.style.zIndex = '9999999';
                    button.style.transition = "all 0.3s ease"; // Transition for smooth hover effect
                    button.disabled = selectedElement === null;
                    button.style.opacity = button.disabled ? "0.5" : "1"; // Dim button if disabled

                    button.onmouseover = () => {
                        if(button.disabled) return;
                        button.style.opacity = "0.7"; // Set opacity to 0.7 on hover
                    };

                    button.onmouseout = () => {
                        if(button.disabled) return;
                        button.style.opacity = "1"; // Reset opacity to 1 when not hovering
                    };

                    // Optionally, add an event listener for click events
                    button.addEventListener('click', () => {
                        event.source.postMessage(
                            { xpath: final_xpath},
                            event.origin,
                        );
                    });

                    // Append the button to the body
                    document.body.appendChild(button);

        document.addEventListener('mouseover', function(event) {
            var hoveredElement = event.target;

            if(hoveredElement == button) return;

            if(hoveredElement === selectedElement) return;
            addBorder(hoveredElement);
        });

        document.addEventListener('mouseout', function(event) {
            var hoveredElement = event.target;

            if(hoveredElement == button) return;

            if(hoveredElement === selectedElement) return;
            removeBorder(hoveredElement);
        });

        function addBorder(element) {
            element.style.outline = \`2px solid \${event.data.hoverColor}\`;
        }

        function removeBorder(element) {
            element.style.outline = 'none';
        }

        function addSelectedBorder(element) {
            element.style.outline = \`3px solid \${event.data.selectedColor}\`;
        }

        function removeSelectedBorder(element) {
            element.style.outline = 'none';
        }

        document.addEventListener('click', function(event) {
            event.preventDefault();
            var clickedElement = event.target;
            if (selectedElement) {
                removeSelectedBorder(selectedElement);
            }
            selectedElement = clickedElement;
            button.disabled = false;
            button.style.opacity = "1"; 
            addSelectedBorder(clickedElement);
            final_xpath = getXPath(clickedElement);
        });

        function getXPath(element) {
            if (!element) return '';

            var xpath = '';
            var currentElement = element;

            while (currentElement !== document.body) {
                var tagName = currentElement.tagName.toLowerCase();
                var index = getIndex(currentElement);

                xpath = '/' + tagName + '[' + index + ']' + xpath;

                currentElement = currentElement.parentElement;
            }

            xpath = '/html/body' + xpath;
            return xpath;
        }

        function getIndex(element) {
            var index = 1;
            var sibling = element.previousSibling;

            while (sibling) {
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
                    index++;
                }
                sibling = sibling.previousSibling;
            }

            return index;
        }
        });
      </script>`;

      // Insert the tags after the opening head tag
      const modifiedHtml = [htmlContent.slice(0, headEndTagIndex), scriptTag, htmlContent.slice(headEndTagIndex)].join('');

      return modifiedHtml;
    } else {
      console.warn('Unable to find closing head tag in HTML content');
      return htmlContent; // Return unmodified content if head tag not found
    }
  }

  return (
    <div>
      <FullScreenModal open={true} onClose={() => setShowModal(false)} title={'Element Selector'}>
        <div id="iframe-container" style={{ height: '93vh' }}></div>
      </FullScreenModal>
    </div>
  );
}
