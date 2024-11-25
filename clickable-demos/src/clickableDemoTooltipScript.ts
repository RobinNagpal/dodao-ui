(function () {
  interface TooltipEventData {
    elementXPath: string;
    tooltipContent: string;
    currentTooltipIndex: number;
    tooltipArrayLen: number;
    placement: string;
  }

  interface DoDAOEventData {
    type: string;
    cssValues?: { [key: string]: string };

    [key: string]: any;
  }

  function showTooltip() {
    const dataString = window.name;
    if (!dataString) {
      return;
    }
    const data = JSON.parse(dataString);

    // Set CSS variables
    if (data.cssValues) {
      for (const variable in data.cssValues) {
        document.documentElement.style.setProperty(variable, data.cssValues[variable]);
      }
    }
    const { tooltipContent: contentText, currentTooltipIndex, tooltipArrayLen, placement, elementXPath } = data;

    const currentDocAndTargetNode = getCurrentContextNodeAndTarget(elementXPath)!;
    if (!currentDocAndTargetNode.targetNode || !currentDocAndTargetNode.currentContextNode) return;

    const { currentContextNode, targetNode } = currentDocAndTargetNode;

    const target = targetNode as HTMLElement & { _tippy?: any };

    target.classList.add('dodao-target-element');

    // Check if the tooltip already exists and destroy it if it does
    if (target._tippy) {
      target._tippy.destroy();
    }

    const tooltipContent = currentContextNode.createElement('div');
    tooltipContent.classList.add('dodao-tooltip-content');

    const textElement = currentContextNode.createElement('p');
    textElement.textContent = contentText;
    textElement.classList.add('dodao-text-element');
    tooltipContent.appendChild(textElement);

    const horizontalLine = currentContextNode.createElement('hr');
    horizontalLine.classList.add('dodao-horizontal-line');
    tooltipContent.appendChild(horizontalLine);

    const buttonsRow = currentContextNode.createElement('div');
    buttonsRow.classList.add('dodao-buttons-row');

    const backButton = createTooltipButton('Back', 'dodao-back-button', () => {
      target._tippy?.destroy();
      window.parent.postMessage({ backButton: true }, '*');
    });

    if (currentTooltipIndex === 0) backButton.style.visibility = 'hidden';
    buttonsRow.appendChild(backButton);

    const indices = currentContextNode.createElement('span');
    indices.textContent = `${currentTooltipIndex + 1} of ${tooltipArrayLen}`;
    indices.classList.add('dodao-indices');
    buttonsRow.appendChild(indices);

    const isLastTooltip = currentTooltipIndex === tooltipArrayLen - 1;
    const nextButtonText = isLastTooltip ? 'Complete' : 'Next';

    const nextButton = createTooltipButton(nextButtonText, 'dodao-next-button', () => {
      target._tippy?.destroy();
      const messageType = isLastTooltip ? 'completeButton' : 'nextButton';
      window.parent.postMessage({ [messageType]: true }, '*');
    });

    adjustButtonStyles([backButton, nextButton], isLastTooltip);
    buttonsRow.appendChild(nextButton);

    tooltipContent.appendChild(buttonsRow);

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    const tooltipWrapper = currentContextNode.createElement('div');
    tooltipWrapper.appendChild(tooltipContent);

    window.tippy(target, {
      allowHTML: true,
      placement: placement as any,
      appendTo: currentContextNode.body,
      offset: [0, 10],
      animation: 'shift-toward',
      interactive: true,
      inertia: true,
      duration: [500, 250],
      delay: [500, 200],
      content: tooltipWrapper,
      showOnCreate: true,
      hideOnClick: false,
      trigger: 'manual',
      theme: 'material',
      zIndex: 999999999999999,
    });
  }

  function elementSelector(event: MessageEvent) {
    let selectedElement: HTMLElement | null = null;
    let finalXPath: string | null = null;
    let hoverEnabled = true;
    let hoverTimer: number | undefined;
    let containingIframe: HTMLIFrameElement | null;

    document.body.style.cursor = 'pointer';
    document.querySelectorAll('input').forEach((input) => {
      (input as HTMLElement).style.cursor = 'pointer';
    });

    const upDownButtons = createUpDownButtons();
    const selectButton = createSelectButton();
    const clearSelectionButton = createClearSelectionButton();

    document.body.appendChild(upDownButtons);
    document.body.appendChild(selectButton);
    document.body.appendChild(clearSelectionButton);

    document.addEventListener('mouseover', (event: MouseEvent) => {
      if (hoverEnabled) containingIframe = null;
      handleMouseOver(event);
    });
    document.addEventListener('click', (event: MouseEvent) => {
      if (hoverEnabled) containingIframe = null;
      handleClick(event);
    });

    addEventListenersToIframe();

    function addEventListenersToIframe() {
      // Get all iframes in the document
      const iframes = document.querySelectorAll('iframe');

      iframes.forEach((iframe) => {
        // Ensure the iframe is of type HTMLIFrameElement
        if (iframe instanceof HTMLIFrameElement) {
          // Function to attach event listeners to the iframe content
          const attachEventListeners = () => {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                iframeDoc.addEventListener('click', (event: Event) => {
                  event.stopPropagation();
                  containingIframe = iframe;
                  handleClick(event as MouseEvent);
                });

                iframeDoc.addEventListener('mouseover', (event: Event) => {
                  event.stopPropagation();
                  containingIframe = iframe;
                  handleMouseOver(event as MouseEvent);
                });
              } else {
                console.error('Unable to access iframe content. It might be cross-origin.');
              }
            } catch (error) {
              console.error('Error accessing or attaching event listeners to iframe content:', error);
            }
          };
          attachEventListeners();
        }
      });
    }

    function createUpDownButtons(): HTMLDivElement {
      const container = document.createElement('div');
      container.classList.add('dodao-up-down-buttons');

      const minusButton = document.createElement('button');
      minusButton.textContent = '-';
      minusButton.title = 'Click to move to parent of element';
      minusButton.addEventListener('click', () => navigateSelection('up'));
      container.appendChild(minusButton);

      const plusButton = document.createElement('button');
      plusButton.textContent = '+';
      plusButton.title = 'Click to move down to first child of element';
      plusButton.addEventListener('click', () => navigateSelection('down'));
      container.appendChild(plusButton);

      return container;
    }

    function navigateSelection(direction: 'up' | 'down') {
      if (!selectedElement) return;

      if (direction === 'up' && selectedElement.parentElement && selectedElement.parentElement !== document.body) {
        selectedElement = selectedElement.parentElement;
      } else if (direction === 'down' && selectedElement.firstElementChild) {
        selectedElement = selectedElement.firstElementChild as HTMLElement;
      } else {
        return;
      }
      createOrUpdateOverlay(selectedElement, containingIframe);
      finalXPath = getXPath(selectedElement, containingIframe);
    }

    function createSelectButton(): HTMLButtonElement {
      const button = document.createElement('button');
      button.textContent = 'Select';
      button.classList.add('dodao-select-element-button');
      button.disabled = true;
      button.style.opacity = '0.5';

      button.addEventListener('click', async () => {
        if (selectedElement && finalXPath) {
          const dataUrl = await captureScreenshotWithOverlay(selectedElement, containingIframe);

          event.source?.postMessage(
            { xpath: finalXPath, elementImgUrl: dataUrl },
            { targetOrigin: event.origin } // Use options object instead of just `event.origin`
          );
        }
      });

      button.addEventListener('mouseover', () => {
        if (!button.disabled) button.style.opacity = '0.7';
      });

      button.addEventListener('mouseout', () => {
        if (!button.disabled) button.style.opacity = '1';
      });

      return button;
    }

    function createClearSelectionButton(): HTMLButtonElement {
      const button = document.createElement('button');
      button.textContent = 'Clear Selection';
      button.classList.add('dodao-clear-selection-button');
      button.disabled = selectedElement === null;
      button.style.opacity = '0.5';

      button.addEventListener('mouseover', () => {
        if (!button.disabled) button.style.opacity = '0.7';
      });

      button.addEventListener('mouseout', () => {
        if (!button.disabled) button.style.opacity = '1';
      });

      button.addEventListener('click', () => {
        selectedElement = null;
        finalXPath = null;
        containingIframe = null;
        hoverEnabled = true;
        const overlay = document.getElementById('dimming-overlay');
        if (overlay) overlay.remove();
        selectButton.disabled = true;
        selectButton.style.opacity = '0.5';
        document.body.style.cursor = 'default';
        button.disabled = true;
        button.style.opacity = '0.5';
      });

      return button;
    }

    function handleMouseOver(e: MouseEvent) {
      e.preventDefault();
      if (hoverEnabled && !selectedElement) {
        clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => {
          const hoveredElement = e.target as HTMLElement;
          if (![selectButton, clearSelectionButton, upDownButtons, ...Array.from(upDownButtons.children)].includes(hoveredElement)) {
            createOrUpdateOverlay(hoveredElement, containingIframe);
          }
        }, 180);
      }
    }

    function handleClick(e: MouseEvent) {
      e.preventDefault();
      const clickedElement = e.target as HTMLElement;

      if (clickedElement === selectButton || clickedElement === clearSelectionButton) return;

      if (Array.from(upDownButtons.children).includes(clickedElement)) return;

      hoverEnabled = false;
      selectedElement = clickedElement;
      selectButton.disabled = false;
      selectButton.style.opacity = '1';
      clearSelectionButton.disabled = false;
      clearSelectionButton.style.opacity = '1';
      createOrUpdateOverlay(selectedElement, containingIframe);
      finalXPath = getXPath(selectedElement, containingIframe);
    }
  }

  //************** Event handler **************//

  async function handleDoDAOParentWindowEvent(event: MessageEvent) {
    const data = event.data as DoDAOEventData;
    console.log('Received message from parent window:', data);
    if (data.type === 'elementSelector') {
      elementSelector(event);
    }

    if (data.type === 'showTooltip') {
      showTooltip();
    }

    if (data.type === 'capturePageScreenshot') {
      const canvas = await html2canvas(document.body, { useCORS: true });
      const dataURL = canvas.toDataURL('image/png');
      event.source?.postMessage({ type: 'pageScreenshotCaptured', dataURL }, { targetOrigin: '*' });
    }

    if (data.type === 'captureElementScreenshot') {
      const { selector } = data;
      const currentDocAndTargetNode = getCurrentContextNodeAndTarget(selector)!;
      if (!currentDocAndTargetNode.targetNode || !currentDocAndTargetNode.currentContextNode) return;

      const { currentContextNode, targetNode } = currentDocAndTargetNode;
      const target = targetNode as HTMLElement;
      if ((selector as string).includes('iframe')) {
        const dataURL = await captureScreenshotWithOverlay(target, currentContextNode.documentElement as HTMLIFrameElement);
        event.source?.postMessage({ type: 'elementScreenshotCaptured', dataURL }, { targetOrigin: '*' });
      }
    }
  }

  window.onmessage = handleDoDAOParentWindowEvent;
  window.handleDoDAOParentWindowEvent = handleDoDAOParentWindowEvent;

  console.log('handleDoDAOParentWindowEvent is defined on window', window.handleDoDAOParentWindowEvent);

  window.document.addEventListener('DOMContentLoaded', () => {
    showTooltip();
  });

  //************** Helper functions **************//
  function getCurrentContextNodeAndTarget(elementXPath: string): { currentContextNode: Document; targetNode: Node } | null {
    console.log('event.data.elementXPath', elementXPath);
    document.addEventListener('click', (e: Event) => e.preventDefault());
    let currentContextNode: Document = document;

    // Determine if the XPath is intended for an iframe by checking the prefix
    const isIframeXPath = elementXPath.startsWith('/html[1]/body[1]');
    let targetNode: Node | null = null;

    if (isIframeXPath) {
      // Search in all iframes
      const iframes = document.querySelectorAll('iframe')!;
      for (const iframe of iframes) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          try {
            const xpathResult = iframeDoc.evaluate(elementXPath, iframeDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (xpathResult) {
              targetNode = xpathResult;
              currentContextNode = iframeDoc;
              const head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0];

              const materialStyle = iframeDoc.createElement('link');
              materialStyle.rel = 'stylesheet';
              materialStyle.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/themes/material.css';
              head.appendChild(materialStyle);

              const shiftTowardsStyle = iframeDoc.createElement('link');
              shiftTowardsStyle.rel = 'stylesheet';
              shiftTowardsStyle.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/animations/shift-toward.css';
              head.appendChild(shiftTowardsStyle);

              const tippyData = iframeDoc.createElement('link');
              tippyData.rel = 'stylesheet';
              tippyData.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/stylesheet/tippy-data.css';
              head.appendChild(tippyData);

              const link = iframeDoc.createElement('link');
              link.rel = 'stylesheet';
              link.href = '/clickable-demos-prod-files/clickableDemoTooltipStyles.css';
              iframeDoc.head.appendChild(link);

              break;
            }
          } catch (error) {
            console.error('Error evaluating XPath in iframe:', error);
          }
        }
      }

      if (!targetNode) {
        console.log('Element not found in any iframe.');
      }
    } else {
      const xpathResult = document.evaluate(elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

      if (xpathResult) {
        console.log('Element found in the main document:', xpathResult);
        targetNode = xpathResult;
      } else {
        console.log('Element not found in the main document.');
      }
    }

    if (targetNode) {
      return { currentContextNode, targetNode };
    } else {
      console.log('Element not found using XPath.');

      // Fallback 1: select element near the middle of the screen
      console.log('Attempting to select a fallback element near the middle of the screen.');
      const viewportWidth = currentContextNode.documentElement.clientWidth;
      const viewportHeight = currentContextNode.documentElement.clientHeight;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      targetNode = currentContextNode.elementFromPoint(centerX, centerY);

      if (targetNode) {
        console.log('Fallback element selected:', targetNode);
        return { currentContextNode, targetNode };
      } else {
        console.log('Fallback failed: Could not find an element at the center of the screen.');

        // Fallback 2: use document.body or document.documentElement
        targetNode = currentContextNode.body || currentContextNode.documentElement;

        if (targetNode) {
          console.log('Defaulting to document body as the target element:', targetNode);
          return { currentContextNode, targetNode };
        } else {
          console.log('No suitable default element found. Exiting function.');
          return null;
        }
      }
    }
  }

  function createTooltipButton(text: string, className: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('dodao-tooltip-button', className);
    button.onclick = onClick;
    button.onmouseover = () => {
      button.style.opacity = '0.7';
    };
    button.onmouseout = () => {
      button.style.opacity = '1';
    };
    return button;
  }

  function adjustButtonStyles(buttons: HTMLButtonElement[], isLastTooltip: boolean): void {
    const maxWidth = isLastTooltip ? '30%' : '20%';
    buttons.forEach((button) => {
      button.style.maxWidth = maxWidth;
    });
  }

  function createOverlayPart(position: string, rect: DOMRect, scrollY: number, scrollHeight: number): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = `${position}-overlay`;
    overlay.style.position = 'absolute';
    overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.6)';
    overlay.style.transition = 'all 0.3s ease';

    switch (position) {
      case 'top':
        Object.assign(overlay.style, {
          top: '0',
          left: '0',
          width: '100%',
          height: `${rect.top + scrollY}px`,
        });
        break;
      case 'left':
        Object.assign(overlay.style, {
          top: `${rect.top + scrollY}px`,
          left: '0',
          width: `${rect.left}px`,
          height: `${scrollHeight - rect.top - scrollY}px`,
        });
        break;
      case 'right':
        Object.assign(overlay.style, {
          top: `${rect.top + scrollY}px`,
          left: `${rect.right}px`,
          width: `calc(100% - ${rect.right}px)`,
          height: `${scrollHeight - rect.top - scrollY}px`,
        });
        break;
      case 'bottom':
        Object.assign(overlay.style, {
          top: `${rect.bottom + scrollY}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${scrollHeight - rect.bottom - scrollY}px`,
        });
        break;
    }
    return overlay;
  }

  function updateOverlay(container: HTMLElement, rect: DOMRect, scrollY: number, scrollHeight: number) {
    const overlays = container.children;
    const topOverlay = overlays[0] as HTMLElement;
    const leftOverlay = overlays[1] as HTMLElement;
    const rightOverlay = overlays[2] as HTMLElement;
    const bottomOverlay = overlays[3] as HTMLElement;

    topOverlay.style.height = `${rect.top + scrollY}px`;
    leftOverlay.style.top = `${rect.top + scrollY}px`;
    leftOverlay.style.height = `${scrollHeight - rect.top - scrollY}px`;
    leftOverlay.style.width = `${rect.left}px`;
    rightOverlay.style.top = `${rect.top + scrollY}px`;
    rightOverlay.style.left = `${rect.right}px`;
    rightOverlay.style.width = `calc(100% - ${rect.right}px)`;
    rightOverlay.style.height = `${scrollHeight - rect.top - scrollY}px`;
    bottomOverlay.style.top = `${rect.bottom + scrollY}px`;
    bottomOverlay.style.left = `${rect.left}px`;
    bottomOverlay.style.width = `${rect.width}px`;
    bottomOverlay.style.height = `${scrollHeight - rect.bottom - scrollY}px`;
  }

  function getIframeOffset(iframe: HTMLIFrameElement): { top: number; left: number } {
    let top = 0;
    let left = 0;
    let element: HTMLElement | null = iframe;

    while (element) {
      const rect = element.getBoundingClientRect();
      top += rect.top + (element.ownerDocument.defaultView?.scrollY || 0);
      left += rect.left + (element.ownerDocument.defaultView?.scrollX || 0);
      element = element.ownerDocument.defaultView?.frameElement as HTMLElement | null;
    }

    return { top, left };
  }

  function getElementIndex(element: HTMLElement): number {
    let index = 1;
    let sibling = element.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === element.tagName) index++;
      sibling = sibling.previousElementSibling;
    }
    return index;
  }

  function createOverlayContainer(rect: DOMRect, scrollY: number, scrollHeight: number): HTMLDivElement {
    const overlayContainer: HTMLDivElement = document.createElement('div');
    overlayContainer.id = 'dimming-overlay';
    Object.assign(overlayContainer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: `${scrollHeight}px`,
      pointerEvents: 'none',
      zIndex: '2147483646',
    });

    const overlays = ['top', 'left', 'right', 'bottom'].map((position) => createOverlayPart(position, rect, scrollY, scrollHeight));

    overlays.forEach((overlay) => overlayContainer.appendChild(overlay));
    return overlayContainer;
  }

  function createOrUpdateOverlay(element: HTMLElement | null, containerIframe: HTMLIFrameElement | null) {
    if (!element) return;

    // get element's Xpath

    let rect: any = element.getBoundingClientRect();
    let scrollY = window.scrollY;
    const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    if (containerIframe) {
      const iframeOffset = getIframeOffset(containerIframe!);
      rect = {
        top: rect.top + iframeOffset.top,
        left: rect.left + iframeOffset.left,
        right: rect.right + iframeOffset.left,
        bottom: rect.bottom + iframeOffset.top,
        width: rect.width,
        height: rect.height,
      };
      scrollY = 0;
    }

    const existingOverlay = document.getElementById('dimming-overlay');
    if (existingOverlay) {
      updateOverlay(existingOverlay, rect, scrollY, scrollHeight);
    } else {
      const overlayContainer = createOverlayContainer(rect, scrollY, scrollHeight);
      document.body.appendChild(overlayContainer);
    }
  }

  function getXPath(element: HTMLElement, containerIframe: HTMLIFrameElement | null): string {
    if (!element) return '';
    const segments: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      const tagName = current.tagName.toLowerCase();
      const index = getElementIndex(current);
      segments.unshift(`${tagName}[${index}]`);
      current = current.parentElement;
    }
    if (containerIframe) {
      return `/${segments.join('/')}`;
    }
    return `/html/body/${segments.join('/')}`;
  }

  async function captureScreenshotWithOverlay(element: HTMLElement, containerIframe: HTMLIFrameElement | null): Promise<string> {
    let currentContextNode = document;
    let captureArea;
    const margin = 30;
    const { x: scrollOffsetX, y: scrollOffsetY } = calculateScrollOffsets(element);
    const yScroll = scrollOffsetY + window.scrollY;
    const rect = element.getBoundingClientRect();

    if (containerIframe) {
      captureArea = {
        x: Math.max(0, rect.left + scrollOffsetX - margin),
        y: Math.max(0, rect.top - 2 * margin),
        width: rect.width + margin * 2,
        height: rect.height + margin * 2,
      };
      currentContextNode = containerIframe.contentDocument || containerIframe.contentWindow!.document;
    } else {
      captureArea = {
        x: Math.max(0, rect.left + scrollOffsetX - margin),
        y: Math.max(0, rect.top + yScroll - margin),
        width: rect.width + margin * 2,
        height: rect.height + margin * 2,
      };
    }

    const canvas = await html2canvas(currentContextNode.body, {
      x: captureArea.x,
      y: captureArea.y,
      width: captureArea.width,
      height: captureArea.height,
      windowWidth: document.documentElement.scrollWidth,
      scrollY: scrollOffsetY,
      useCORS: true,
      backgroundColor: null,
      logging: true,
    });
    const dataURL = canvas.toDataURL('image/png');
    return dataURL;
  }

  function calculateScrollOffsets(element: HTMLElement): {
    x: number;
    y: number;
  } {
    let x = 0;
    let y = 0;
    let parent = element.parentElement;

    while (parent) {
      if (isScrollable(parent)) {
        x += parent.scrollLeft;
        y += parent.scrollTop;
      }
      parent = parent.parentElement;
    }
    return { x, y };
  }

  function isScrollable(element: HTMLElement): boolean {
    const overflowY = window.getComputedStyle(element).overflowY;
    return overflowY === 'scroll' || overflowY === 'auto';
  }
})();
